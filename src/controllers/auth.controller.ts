import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import { models } from 'src/db/models';



class UserDto {
    @ApiProperty()
    username: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    avatarLink: string | undefined;
}

class TokenDto {
    @ApiProperty()
    token: string;
}

@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
    @Post('/registration')
    async registration(@Body() body: UserDto) {
        const users = await models.users.findOne({where: {username: body.username}})


        if (users) {
            return {isOk: false, message: 'This user already created'}
        }

        const hashPassword = await bcrypt.hash(body.password, 10)

        const response = await models.users.create({
            username: body.username,
            passwordHash: hashPassword,
            avatarLink: 'none',
            status: 'Member'
        })


        const token = jwt.sign(response.dataValues, process.env.TOKEN_SECRET);

        return {isOk: true, user: {...response.dataValues}, token: token}
    }

    @Post('/login')
    async login(@Body() body: UserDto) {
        const user = await models.users.findOne({where: {username: body.username}})
	
	console.log(body);

        if (!user) {
            return {isOk: false, message: 'This user not created'}
        }

        const checkPassword = await bcrypt.compare(body.password, user.dataValues.passwordHash)

        if (!checkPassword) {
            return {isOk: false, message: 'Invalid password'}
        }

        const token = jwt.sign(user.dataValues, process.env.TOKEN_SECRET);

        return {isOk: true, user: {...user.dataValues}, token: token}
    }

    @Get('/me')
    async me(@Headers('Authorization') headers: TokenDto) {
        const userDataJWT = jwt.verify(headers, process.env.TOKEN_SECRET);

        const userData = await models.users.findOne({where: {id: userDataJWT.id}})

        return {isOk: true, userData}
    }
}
