import {Module} from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { FilmsController } from './controllers/films.controller';
import { UserController } from './controllers/user.controller';
import { NewsController } from './controllers/news.controller';

@Module({
    controllers: [AuthController, FilmsController, UserController, NewsController]
})
export class AppModule {}
