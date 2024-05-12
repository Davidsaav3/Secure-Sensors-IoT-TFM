const {sequalize, DataTypes} = require('../bd');

const SmartUniModelDataEstructure = sequalize.define('data_estructure',{
    "id_estructure": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    "description": {type: DataTypes.STRING(45), allowNull: true},
    "configuration": {type: DataTypes.STRING(45), allowNull: true}
  })

  module.exports = {
    SmartUniModelDataEstructure
  };
