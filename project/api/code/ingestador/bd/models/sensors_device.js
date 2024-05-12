const {sequalize, DataTypes} = require('../bd');

const SmartUniModelSensorsDevice = sequalize.define('sensors_devices',{
    "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    "id_type_sensor": {type: DataTypes.INTEGER, allowNull: false},
    "id_device": {type: DataTypes.INTEGER, allowNull: false},
    "enable": {type: DataTypes.TINYINT, allowNull: false},
    "orden": {type: DataTypes.INTEGER, allowNull: false},
    "datafield": {type: DataTypes.STRING(45), allowNull: true},
    "nodata": {type: DataTypes.TINYINT, allowNull: true},
    "correction_specific": {type: DataTypes.STRING(45), allowNull: true},
    "correction_time_specific": {type: DataTypes.STRING(45), allowNull: true}

  })

  module.exports = {
    SmartUniModelSensorsDevice
  };