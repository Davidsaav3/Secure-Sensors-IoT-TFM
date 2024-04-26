
// Función que comprueba que el mensaje tienes las características necesarias
// Devuelve true si es correcto y false si es incorrecto
function IsCorrectMessage(payload) {

    // Comprobar que nos llegan bytes de datos
    if (payload.uplink_message.decoded_payload == undefined || payload.uplink_message.decoded_payload == null) {
        console.log('Message without decode_payload: payload.uplink_message.decoded_payload');
        return false;
    }

    if (payload.uplink_message.decoded_payload.bytes == undefined || payload.uplink_message.decoded_payload.bytes == null 
        || payload.uplink_message.decoded_payload.bytes.length == 0 ) {
        console.log('Message error: payload.uplink_message.decoded_payload.bytes');
        return false;
    }
    // si no me llega timestamp, salimos
    if (payload.received_at == undefined || payload.received_at == null) {
        console.log('Message error: payload.received_at');
        return false;
    }
    // Si no llega device_id, salimos
    if (payload.end_device_ids.device_id == undefined || payload.end_device_ids.device_id == null) {
        console.log('Message error: end_device_ids.device_id');
        return false;
    }
    // Si no llega application_id, fuera
    if (payload.end_device_ids.application_ids.application_id == undefined || payload.end_device_ids.application_ids.application_id == null) {
        console.log('Message error: payload.end_device_ids.application_ids.application_id');
        return false;
    }
    // Si no hay
    return true;

}

module.exports = { IsCorrectMessage };