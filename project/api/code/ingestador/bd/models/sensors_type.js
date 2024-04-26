const {sequalize, DataTypes} = require('../bd');

const SmartUniModelSensorsType = sequalize.define('sensors_types',{
    "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    "type": {type: DataTypes.STRING(45), allowNull: false},
    "metric": {type: DataTypes.STRING(45), allowNull: false},
    "description": {type: DataTypes.STRING(45), allowNull: false},
    "errorvalue": {type: DataTypes.DOUBLE, allowNull: true},
    "valuemax": {type: DataTypes.DOUBLE, allowNull: true},
    "valuemin": {type: DataTypes.DOUBLE, allowNull: true},
    "correction_general": {type: DataTypes.STRING(45), allowNull: true},
    "correction_time_general": {type: DataTypes.STRING(45), allowNull: true},
    "discard_value": {type: DataTypes.STRING(45), allowNull: true}

  })

  module.exports = {
    SmartUniModelSensorsType
  };