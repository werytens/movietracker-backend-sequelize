const { DataTypes } = require("sequelize");
import { sequelize } from "./db";

const users = sequelize.define("user", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    avatarLink: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false }
})

const filmStatus = sequelize.define("filmStatus", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false }
})

const list = sequelize.define("list", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    filmId: { type: DataTypes.INTEGER, allowNull: false },
    statusId: { type: DataTypes.INTEGER, allowNull: false },
    userRate: { type: DataTypes.INTEGER, allowNull: true },
    rewatchCount: { type: DataTypes.INTEGER, allowNull: true },
    userDescription: { type: DataTypes.TEXT, allowNull: true }
})

const film = sequelize.define("film", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    rate: { type: DataTypes.STRING, allowNull: false },
    metascore: { type: DataTypes.STRING, allowNull: false },
    genre: { type: DataTypes.STRING, allowNull: false },
    releaseDate: { type: DataTypes.STRING, allowNull: false },
    runtime: { type: DataTypes.STRING, allowNull: false },
    writer: { type: DataTypes.STRING, allowNull: false },
    actors: { type: DataTypes.STRING, allowNull: false },
    poster: { type: DataTypes.STRING, allowNull: false },
    votersCount: { type: DataTypes.STRING, allowNull: false },
    imdbID: { type: DataTypes.STRING, allowNull: true },
    kinopoiskID: { type: DataTypes.STRING, allowNull: true },
    seasonsCount: { type: DataTypes.INTEGER, allowNull: true },
    episodesCount: { type: DataTypes.INTEGER, allowNull: true },
})

const news = sequelize.define('news', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.TEXT, allowNull: false },
})

export const models = {
    users, filmStatus, list, film, news
}