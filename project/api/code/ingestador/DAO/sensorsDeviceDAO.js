const {sequalize} = require('../bd/bd');

const table_sensors_device  = async(device_id) =>
{
    try {

        let query = "select * from sensors_devices sd left join sensors_types st on sd.id_type_sensor = st.id where sd.enable='1' and sd.id_device = '" + device_id+"' order by sd.orden";
        let [res, meta] = await sequalize.query( query ); 
        return res; //sensor_data;
    } catch (error) {
        console.log('sensorsDeviceDAO error: ',error);
    }
    return null;
}

module.exports = {
    table_sensors_device,
}
