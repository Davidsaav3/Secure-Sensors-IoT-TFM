const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config()

const sequalize = new Sequelize('mysql://user_api_sensors:user_api_sensors_72435y7vsddfbre342bbvgasTYV90@172.19.202.65:33336/sensors',
  {
    logging: false
  }) // Example for postgres
const Op = Sequelize.Op;
module.exports = {
  sequalize,
  DataTypes,
  Op
}

//const sequalize = new Sequelize('mysql://lucia:T0rr3v13j433@172.19.202.65:3336/sensors',
//const sequalize = new Sequelize('mysql://root@172.19.202.65:3306/sensors',
//const sequalize = new Sequelize('mysql://root:T0rr3v13j433@172.19.202.65:3306/sensors',
//const sequalize = new Sequelize('mysql://user_api_sensors:user_api_sensors_72435y7vsddfbre342bbvgasTYV90@15.5.0.5:3306/sensors',

/*
module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "sensores22$",
  DB: "sensors",
  dialect: "mysql", 
 
};
*/
