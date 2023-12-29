import { Body, Controller, Patch, Get, Param } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
const bcrypt = require('bcrypt');
import { models } from 'src/db/models';



class AvatarDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    link: string;
}

class PasswordDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    password: string;
}

@ApiTags('Users')
@Controller('/api/user')
export class UserController {
    @Patch('/avatar')
    async avatar(@Body() body: AvatarDto) {
        try {
            const user = await models.users.findOne({ where: {id: body.id }})            

            if (!user)
                return {isOk: false, message: "User not found"}

            await user.update({
                avatarLink: body.link
            })

            await user.save();
                        

            return { isOk: true, message: "Avatar Changed"}
        } catch (e) {
            console.log(e);
            return {isOk: false, message: "User not found / Unexpected Error"}
        }
    }

    @Patch('/password')
    async password(@Body() body: PasswordDto) {
        try {
            const user = await models.users.findOne({where:{ id: body.id }})

            if (!user)
                return {isOk: false, message: "User not found"}

            await user.update({
                passwordHash: await bcrypt.hash(body.password, 10)
            })

            await user.save();
            
            return { isOk: true, message: "Password Changed"}
        } catch (e) {
            return {isOk: false, message: "User not found / Unexpected Error"}
        }
    }

    @Get('/:username')
    async get(@Param() params: {username: string}) {
        const user = await models.users.findOne({where: {username: params.username}});
        
        if (!user) {
            return {isOk: false, message: "User not found"}            
        }

        

        return {isOk: true, user: user.dataValues}
    }
}
