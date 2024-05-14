
const { sequalize } = require('../bd/bd');

const table_device_configuration = async (ttn_device_id, ttn_application_id) => {
    let query = "select * from device_configurations dc left join data_estructure de on dc.id_data_estructure = de.id_estructure where dc.enable='1' and dc.uid= '" + ttn_device_id + "' and dc.application_id= '" + ttn_application_id + "'";
    try {
        let [res, meta] = await sequalize.query(query);
        return res[0];
    }
    catch (error) {
        if (process.env.verbose) console.log('deviceConfigurationDato - Error al realizar query');
    }
    return null;
}

module.exports = {
    table_device_configuration,
}
