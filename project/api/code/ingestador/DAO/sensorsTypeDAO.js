const {SmartUniModelSensorsType} = require('../bd/models/sensors_type')

const table_sensors_type  = async(ttn_data) =>
{
    try {

        let type_sensors = await SmartUniModelSensorsType.findOne({
            where: {id: ttn_data['id_type_sensor']} //'s'
        });
        return type_sensors;

    } catch (error) {
        console.log('Error: ',error);
    }
}


module.exports = {
    table_sensors_type
}