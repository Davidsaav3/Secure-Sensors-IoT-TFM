const {sequalize, DataTypes} = require('../bd');

const SmartUniModelDeviceConfiguration = sequalize.define('device_configurations',{
    "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    "typemeter": {type: DataTypes.STRING(45), allowNull: false},
    "topic_name": {type: DataTypes.STRING(45), allowNull: false},
    "organizationid": {type: DataTypes.STRING(45), allowNull: false},
    "lat": {type: DataTypes.DOUBLE, allowNull: false},
    "lon": {type: DataTypes.DOUBLE, allowNull: false},
    "cota": {type: DataTypes.DOUBLE, allowNull: false},
    "timezone": {type: DataTypes.STRING(45), allowNull: false},
    "description_origin": {type: DataTypes.STRING(45), allowNull: false},
    "origin": {type: DataTypes.STRING(45), allowNull: false},
    "uid": {type: DataTypes.STRING(45), allowNull: false},
    "application_id": {type: DataTypes.STRING(45), allowNull: false},
    "id_data_estructure": {type: DataTypes.INTEGER, allowNull: true},  
    "alias": {type: DataTypes.STRING(45), allowNull: false},
    "enable": {type: DataTypes.TINYINT, allowNull: false}
  
  })

  module.exports = {
    SmartUniModelDeviceConfiguration
  };
