require('dotenv').config()
import { FilmDto } from "src/controllers/films.controller";


export class ImdbAPI {
    static async getFilm(id) {
        const response = await (await fetch(process.env.IMDB_API_LINK + '?i=' + id + '&apikey=' + process.env.API_KEY)).json();

        if (response.Error) {
            return response
        }

        return response
    }
}

export class kinopoiskAPI {
    static async getFilm(id) {
        const response = await fetch(process.env.API_KINOPOISKID_LINK + id, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': process.env.API_KINOPOISK_KEY
            }
        })

        return await (await response).json();
    }

    static async getFilmSeasons(id) {
        const response = await fetch(process.env.API_KINOPOISKID_LINK + id + '/seasons', {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': process.env.API_KINOPOISK_KEY
            }
        })

        return await (await response).json();
    }
} 

export class filmDto {
    static async getDto(kFilm, iFilm, seasons?) {
        let seasonsCount, episodesCount;

        if (seasons) {
            seasonsCount = seasons.items.length
            episodesCount = seasons.items.reduce((a, n) => a + n.episodes.length, 0)
        }

        const genresDict = {
            "триллер": "Thriller",
            "драма": "Drama",
            "детектив": "Crime",
            "фантастика": "Sci-Fi",
            "фэнтези": "Fantasy",
            "ужасы": "Horror",
            "комедия": "Comedy",
            "криминал": "Crime"
        }


        const filmDto: FilmDto = {
            title: iFilm ? iFilm.Title : kFilm.nameRu,
            description: iFilm ? iFilm.Plot : kFilm.description,
            rate: iFilm ? iFilm.imdbRating : kFilm.ratingImdb,
            metascore: iFilm ? iFilm.Metascore : kFilm.ratingKinopoisk,
            genre: iFilm ? iFilm.Genre : kFilm.genres.map(item => Object.keys(genresDict).includes(item.genre) ? genresDict[item.genre] : item.genre).join(', '),
            releaseDate: iFilm ? iFilm.Released : kFilm.startYear,
            runtime: iFilm ? iFilm.Runtime : kFilm.filmLength + ' min',
            writer: iFilm ? iFilm.Writer : '',
            actors: iFilm ? iFilm.Actors : '',
            poster: iFilm ? iFilm.Poster : kFilm.posterUrl,
            votersCount: iFilm ? iFilm.imdbVotes.replace(",", '.') : kFilm.ratingImdbVoteCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            imdbID: iFilm ? iFilm.imdbID : kFilm.imdbId,
            kinopoiskID: String(kFilm.kinopoiskId),
            seasonsCount: seasonsCount ? seasonsCount : null,
            episodesCount: episodesCount ? episodesCount : null
        };

        return filmDto
    }
}