
// Mensaje cuando se conecta a MQTT
const msg_connect = false;

const msg_ttn_uplink = false;
const msg_new_data = true;
const msg_ttn_data= false;
const msg_dev_app= false;
const msg_sensor_data= false;
const msg_discard_value= false;
const msg_objData = false;
const msg_objFinal = false;
const msg_axios=true;

// Desactiva el envio de datos a la API para pruebas
const axios_control = true;

const debugTopics = ['ua.datosCO2.raw'];
//const debugTopics = [];


 module.exports = {
    msg_connect, 
    msg_ttn_uplink, 
    msg_new_data, 
    msg_ttn_data, 
    msg_dev_app,
    msg_sensor_data, 
    msg_discard_value, 
    msg_objData, 
    msg_objFinal,
    axios_control,
    msg_axios,
    debugTopics
}
/**/
