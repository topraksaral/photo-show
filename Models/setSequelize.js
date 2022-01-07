const { app } = require("electron");

const { Sequelize } = require('sequelize');

const dirName = require("path").dirname(app.getPath("exe"));
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dirName + '/db.db',
    logging: true
  });


module.exports = sequelize;
