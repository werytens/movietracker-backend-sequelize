require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { sequelize } from './db/db'
import { models } from './db/models';

const statuses = ["favorite", "planned", "delayed", "watching", "watched", "abandoned"]

const start = async () => {
	await sequelize.authenticate();
    await sequelize.sync();

	const statusesArray = await models.filmStatus.findAll();
	if (statusesArray.length === 0) {
		statuses.forEach(async item => {
			await models.filmStatus.create({
				name: item
			})
		})
	}

	// await models.film.drop({cascade: true})       
	// await models.filmStatus.drop({cascade: true}) 
	// await models.list.drop({cascade: true})       
	// await models.users.drop({cascade: true})      

	const PORT = process.env.PORT || 1401;
	const app = await NestFactory.create(AppModule);
	app.enableCors({
		origin: true
	});
	const config = new DocumentBuilder()
		.setTitle('Movietracker')
		.setDescription('Movietracker API')
		.setVersion('1.0')
		.build();

	const document = SwaggerModule.createDocument(app, config);

	SwaggerModule.setup('api', app, document);

	(await app).listen(PORT, () => console.log('server started, port: ' + PORT));
};

start();
