import { Body, Controller, Patch, Get, Param, Post, Delete } from '@nestjs/common';
import { ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { models } from 'src/db/models';

export class NewsDto {
    @ApiProperty()
    title: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    image: string;
}

@ApiTags('News')
@Controller('/api/news')
export class NewsController {

    @Post('/create')
    @ApiResponse({ status: 200, description: 'News post created!' })
    async create(@Body() body: NewsDto) {
        await models.news.create(body)
        return { isOk: true, message: 'News post created!' }
    }

    @Get('/get')
    async get() {
        return {
            isOk: true,
            posts: await models.news.findAll({
                order: [['createdAt', 'DESC']]
            })
        };
    }


    @Patch('/description')
    async description(@Body() body: { id: number; description: string }) {
        const post = await models.news.findOne({ where: { id: body.id } })

        if (!post) {
            return { isOk: false, message: "Post not found" }
        }

        post.update({ description: body.description })
        post.save();

        return { isOk: true, message: "Post description edited!" }
    }

    @Patch('/title')
    async title(@Body() body: { id: number; title: string }) {
        const post = await models.news.findOne({ where: { id: body.id } })

        if (!post) {
            return { isOk: false, message: "Post not found" }
        }

        post.update({ title: body.title })
        post.save();

        return { isOk: true, message: "Post title edited!" }
    }

    @Patch('/image')
    async image(@Body() body: { id: number; image: string }) {
        const post = await models.news.findOne({ where: { id: body.id } })

        if (!post) {
            return { isOk: false, message: "Post not found" }
        }

        post.update({ image: body.image })
        post.save(); 

        return { isOk: true, message: "Post image edited!" }
    }

    @Delete('/delete')
    async delete(@Body() body: {id: number}) {
        const post = await models.news.findOne({where: {id: body.id}});
        await post.destroy();

        return {isOk: true, message: "Post deleted!"}
    }
}
