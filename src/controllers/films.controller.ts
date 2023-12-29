import { Controller, Get, Post, Body, Param, Delete, Patch, Query  } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { ImdbAPI, kinopoiskAPI, filmDto } from 'src/service/serviceapi';
import { models } from 'src/db/models';
import { sequelize } from 'src/db/db';

export class FilmDto {
    @ApiProperty()
    title: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    rate: number;
    @ApiProperty()
    metascore: number;
    @ApiProperty()
    genre: string;
    @ApiProperty()
    releaseDate: string;
    @ApiProperty()
    runtime: string;
    @ApiProperty()
    writer: string;
    @ApiProperty()
    actors: string;
    @ApiProperty()
    poster: string;
    @ApiProperty()
    votersCount: string;
    @ApiProperty()
    imdbID: string;
    @ApiProperty()
    kinopoiskID: string;
    @ApiProperty()
    seasonsCount?: number | null;
    @ApiProperty()
    episodesCount?: number | null;
}


class FilmListActionsDto {
    @ApiProperty()
    userId: string;
    @ApiProperty()
    imdbId?: string;
    @ApiProperty()
    kinopoiskId?: string;
    @ApiProperty()
    filmId?: string;
    @ApiProperty()
    statusId?: string;
    @ApiProperty()
    rewatchCount?: number;
    @ApiProperty()
    rate?: number;
    @ApiProperty()
    userDescription?: string;
    @ApiProperty()
    name: string;
}

@ApiTags('Films')
@Controller('/api/films')
export class FilmsController {

    @Patch('/rewatch')
    async changeFilmRewatch(@Body() body: FilmListActionsDto) {
        const film = await models.list.findOne({where:{filmId: body.filmId, userId: body.userId}});
        await film.update({rewatchCount: body.rewatchCount})
        await film.save()
    }

    @Patch('/rate')
    async changeFilmRate(@Body() body: FilmListActionsDto) {
        const film = await models.list.findOne({where:{filmId: body.filmId, userId: body.userId}});
        await film.update({userRate: body.rate})
        await film.save()
    }

    @Patch('/description')
    async changeFilmDescription(@Body() body: FilmListActionsDto) {
        const film = await models.list.findOne({where:{filmId: body.filmId, userId: body.userId}});
        await film.update({userDescription: body.userDescription})
        await film.save()
    }

    @Get('/get/:id')
    async getFilm(@Param() params: {id: string}) {
        let response

        try {
            response = await models.film.findOne({where: {id: params.id}});

            if (!response) {
                return {isOk: false, message: "Film not found"}
            }
        } catch (e) {
            return {isOk: false, message: "Film not found / Unexpected error"}
        }

        return {isOk: true, response}
    }

    @Get('/statuses')
    async getStatuses() {
        return {isOk: true, data: [...(await models.filmStatus.findAll())]}
    }

    // List Endpoints

    @Post('/add')
    async addFilmToUser(@Body() body: FilmListActionsDto) {
        let film = await models.film.findOne({where: {imdbID: body.imdbId}});

        if (!body.imdbId) {
            film = await models.film.findOne({where: {kinopoiskID: String(body.kinopoiskId)}})
        }

        if (!film) {
            console.log('creating new film');

            // check type (serial / film)
            const kinopoiskFilm = await kinopoiskAPI.getFilm(Number(body.filmId))
            let imdbFilm;
            let filmSeasons;

            if (body.imdbId) {
                imdbFilm = await ImdbAPI.getFilm(String(body.imdbId))
            }
            
            if (kinopoiskFilm.type === 'TV_SERIES') {
                filmSeasons = await kinopoiskAPI.getFilmSeasons(Number(body.filmId))
            }

            const filmDtoResponse = await filmDto.getDto(kinopoiskFilm, imdbFilm, filmSeasons);
    
            film = await models.film.create({...filmDtoResponse});
        }

        let user;

        try {
            user = await models.users.findOne({ where: { id: body.userId } });

            if (!user) {
                return { isOk: false, message: "User not found" }
            }
        } catch (e) {
            return { isOk: false, message: "User not found / Unexpected error" }
        }

        // Ищем в списке пользователя текущий фильм (добавлен ли он на текущий момент)
        const userFilm = await models.list.findOne({ where: { filmId: film.id, userId: user.id } })

        if (userFilm) {
            return {isOk: false, message: 'This film already in your list.'}
        }

        const response = await models.list.create({
            userId: user.id,
            filmId: film.id,
            statusId: (await models.filmStatus.findOne({where:{name: 'planned'}})).id
        })

        return {isOk: true, response}
    }

    @Delete('/delete')
    async removeFilmFromList(@Body() body: FilmListActionsDto) {
        let response; 

        try {
            response = await models.list.destroy({where:{filmId: body.filmId, userId: body.userId}})
            return {isOk: true, response};
        } catch (e) {
            return {isOk: false, message: "(User / Film / User&Film doenst exists) / Unexpected error."}
        }

    }

    @Patch('/status')
    async changeFilmStatus(@Body() body: FilmListActionsDto) {
        const statusesIdsArrays = (await models.filmStatus.findAll()).map((item) => item.id)

        if (!statusesIdsArrays.includes(body.statusId))
            return {isOk: false, message: "This status dont found"}

        let item; 

        try {
            item = await models.list.findOne({where:{filmId: body.filmId, userId: body.userId}});
            await item.update({statusId: body.statusId})
            await item.save()
            return {isOk: true, item}
        } catch (e) {
            return {isOk: false, message: "(User / Film / User&Film doenst exists) / Unexpected error."}
        }
    }


    @Get('/getlist/:id')
    async getUserList(@Param() params: {id: string}) {
        let user;

        try {
            user = await models.users.findOne({where:{id: params.id}});

            if (!user) {
                return {isOk: false, message: "User not found"}
            }
        } catch (e) {
            return {isOk: false, message: "User not found / Unexpected error"}
        }

        const response = await models.list.findAll({where:{userId: user.id}})

        return {isOk: true, response}
    }

    @Get('/getlist/v2/:id')
    async getUserList2(@Param() params: { id: string }) {
        let user;

        try {
            user = await models.users.findOne({ where: { id: params.id } });

            if (!user) {
                return { isOk: false, message: "User not found" }
            }
        } catch (e) {
            return { isOk: false, message: "User not found / Unexpected error" }
        }

        const response = await models.list.findAll({ where: { userId: user.id } })

        const films = [
            {
                name: "favorite",
                films: []
            },
            {
                name: "planned",
                films: []
            },
            {
                name: "delayed",
                films: []
            },
            {
                name: "watching",
                films: []
            },
            {
                name: "watched",
                films: []
            },
            {
                name: "abandoned",
                films: []
            }
        ];

        for (let index = 0; index < response.length; index++) {
            const filmData = response[index].dataValues;
            const film = (await models.film.findOne({ where: { id: response[index].dataValues.filmId } })).dataValues;
            
            films[filmData.statusId - 1].films.push(film);
        }
        
        return { isOk: true, films: films }
    }

    @Get('/getlist/v3/:id')
    async getUserList3(@Param() params: { id: string }) {
        let user;

        try {
            user = await models.users.findOne({ where: { id: params.id } });

            if (!user) {
                return { isOk: false, message: "User not found" }
            }
        } catch (e) {
            return { isOk: false, message: "User not found / Unexpected error" }
        }

        const films = [
            {
                name: "favorite",
                films: []
            },
            {
                name: "planned",
                films: []
            },
            {
                name: "delayed",
                films: []
            },
            {
                name: "watching",
                films: []
            },
            {
                name: "watched",
                films: []
            },
            {
                name: "abandoned",
                films: []
            }
        ];

        const allFilms =
        await sequelize.query(`select * from lists left join films film on film.id = "lists"."filmId" where "userId" = ${user.id};`)

        for (const film of allFilms[0]) {
            films[film.statusId - 1].films.push(film)
        }

        return { isOk: true, films: films }
    }


    

    @Get('/status/:userId')
    async getByStatus(@Param('userId') userId: string, @Query('statusId') statusId: string) {
        let response;

        try {
            response = await models.users.findOne({where:{"userId": userId, "statusId": statusId}})

            if (!response) {
                return {isOk: false, message: "User not found / Status not found"}
            }
        } catch (e) {
            return {isOk: false, message: "(User not found / List not found) / Unexpected error."}
        }

        return {isOk: true, response}
    }
}
