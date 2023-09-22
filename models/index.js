//const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");
const config = require('../database/config');

const sequelize = new Sequelize(config.DB, 'admin', 'JadSuporte@2021', {
  host: config.HOST,
  dialect: config.dialect,
  operatorsAliases: false,
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.tutorials = require("./tutorial.models")(sequelize, Sequelize);
module.exports = db;