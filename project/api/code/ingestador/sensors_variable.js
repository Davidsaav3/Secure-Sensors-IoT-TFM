
/* Variables de control debug */
const controlVars = require('./controlvars');

/** Funciones para enviar datos a la API */
const axios = require('axios');

/* Funciones auxiliares*/
const helpers = require('./methods/helpers');
const deviceConfigurationDAO = require('./DAO/deviceConfigurationDAO');
const sensorsDeviceDAO = require('./DAO/sensorsDeviceDAO');
const methods = require('./methods/deco');

/* Configuraicón TTN*/
const config = require('./config');
const mqtt = require('mqtt');

/* Credenciales */
const connection_config = config.connection_config;
const ingest_config = config.ingest_config;

// Nos conectamos a MQTT y nos conectamos al topic de las sondas
// para ver cadens de conexión mirar https://www.thethingsindustries.com/docs/integrations/mqtt/
/*const client = mqtt.connect((config.mqttQue), {
  username: config.appID,
  password: config.accessKey
});


client.on('connect', () => {
  if (controlVars.msg_connect) console.log('connected');
  client.subscribe(config.suscribe);
});

client.on('message', async (topic, message) => {
  try {
    await main(message);
  } catch (error) {
    console.log(error)
  }
});
*/

// Nos conectamos a MQTT y nos conectamos al topic de las sondas
// para ver cadens de conexión mirar https://www.thethingsindustries.com/docs/integrations/mqtt/
for (let i = 0; i < connection_config.length; i++) {

  const client = mqtt.connect(connection_config[i].mqttQeue, {
    username: connection_config[i].appID,
    password: connection_config[i].accessKey
  });


  client.on('connect', () => {
    if (controlVars.msg_connect) console.log('connected');
    console.log('connected:', i);
    console.log("Aplication:", connection_config[i].appID);
    client.subscribe(connection_config[i].subscribe);
  });

  client.on('message', async (topic, message) => {
    try {
      await main(message);
    } catch (error) {
      console.log(error)
    }
  });


}

//----------------------------------------------------------------------

const main = async (message) => {

  // Si no hay mensaje o es null
  if (message == null || message == undefined) {
    console.log('No message');
    return;
  }

  // Parseamos el payload a JSON para poder trabajar con él
  let payload = JSON.parse(message.toString());

  // Comprobar que el formato es correcto, aquí van todas las comprobaciones necesaris
  if (!helpers.IsCorrectMessage(payload)) {
    console.log(new Date(), ' No process message from ', payload.end_device_ids.device_id);
    return;
  }

  // Obtenemos los datos del mensaje
  let date = new Date(payload.received_at).getTime();
  let ttn_device_id = payload.end_device_ids.device_id;
  let ttn_application_id = payload.end_device_ids.application_ids.application_id;
  let ttn_uplink = payload.uplink_message.decoded_payload.bytes;

  /****
   * CÓDIGO PARA SUPLANTAR UNA SONDA
   * ASÍ SE PUEDE CAMBIAR EL ID Y LOS DATOS QUE RECIBE PARA HACER PRUEBAS
   *
  // vamos a simular la sonda VOC si es la 3
  ***/
 /*
  if (ttn_device_id == 'ua-sensor-s3' || ttn_device_id == 'ua-sensor-s25' || ttn_device_id == 'ua-sensor-s23' || ttn_device_id == 'ua-sensor-s19') {
    console.log('')
    console.log('Reemplazamos:', ttn_device_id)
    ttn_device_id = 'sensor-voc-1';
    ttn_uplink = [0, 192, 242, 6, 41, 11, 0, 194, 1, 200, 0, 201, 2, 43, 0, 0, 0, 0];
    console.log('Después:', ttn_device_id, ttn_uplink)
  }
  */
  if (ttn_device_id == 'yokogawa-xs770a-s1') {
    console.log('')
    console.log('Reemplazamos:', ttn_device_id)
    ttn_device_id = 'yokogawa-xs770a-s1';
    ttn_uplink = [66,48,48,48,52,56,0,0,0,0,0];
    console.log('Después:', ttn_device_id, ttn_uplink)
  }
  /**/

  /*-----------------------------------*/

  if (controlVars.msg_ttn_uplink) console.log('Bytes recibidos ttn_uplink:', ttn_uplink);

  if (controlVars.msg_new_data) console.log('');
  if (controlVars.msg_new_data) console.log('---------------------NEW-----------------');
  if (controlVars.msg_dev_app) console.log('Message:', ttn_device_id, ttn_application_id);

  let board_config;
  try {
    // Consulta para obtener la configuracíon de la plaza 
    board_config = await deviceConfigurationDAO.table_device_configuration(ttn_device_id, ttn_application_id);

    // Si no devuelve nada porque no se encuentra ninguna configuracion activa, entonces termina
    if (!board_config) return;
  } catch (error) {
    console.log('Error al obtener configuración de la placa:')
  }

  // Comprobamos si el topic donde está la placa es de los de depuración, si es así lo ignoramos
  if (controlVars.debugTopics.includes(board_config.topic_name)) return;

  // Obtenemos si es estructrua fija o variable
  if (board_config.variable_configuration == 1) {
    // Aquí habría que hacer el tratamiento de estructura variable
    // decodificar el byte que toque, botener el código, y obtener así la estructura fija asociad a ese código
    console.log('Estructura variable, funcionalidad por desarrollar. FIN');
    return;
  };

  // Obtenemos la estructura a decofificar
  dataEstructure = board_config.configuration.split(',');
  // Array de funciones para decodificar
  let arrayDecodefunction = [];
  let numBytes = [];

  for (i = 0; i < dataEstructure.length; i++) {

    if (!methods.typeExist(dataEstructure[i])) continue;
    arrayDecodefunction.push(methods.methodType(dataEstructure[i]));
    numBytes.push(methods.methodBytes(dataEstructure[i]));
  }

  let ttn_data = 0;

  ttn_data = methods.decode(ttn_uplink, arrayDecodefunction, numBytes);
  if (ttn_data.length<=0) return;

  let listaValores = Object.values(ttn_data);

  let sensor_data;
  try {
    // Obtenemso la información de los sensores asociados a la sonda
    sensor_data = await sensorsDeviceDAO.table_sensors_device(board_config.id);
    if (controlVars.msg_sensor_data) console.log('sensor_data', sensor_data);
    // Si no hay sensores activos o no hay ninguno salimos
    if (!sensor_data || sensor_data.length == 0) return;
  } catch (error) {
    console.log('Error al obtener datos del sensor:', error);
    return;
  }

  // Configuramos valores GEO para ser enviados hacia le endpoint
  let lat = board_config.lat;
  let lon = board_config.lon;
  let cota = board_config.cota;

  // Creamos el objeto global para enviar
  let dataSend = {
    topic_name: String(board_config.topic_name),
    arrayobjects: []
  };


  for (i = 0; i < sensor_data.length; i++) {
    let objData = {};

    let orden = sensor_data[i]['orden'];

    if (orden > listaValores.length) continue;

    let lista_valores = sensor_data[i]['discard_value']
    if (lista_valores != null) {
      let array_valores = lista_valores.split(',')
      if (controlVars.msg_discard_value) console.log('Lista de valores de descarte:', array_valores)
      valor_string = String(listaValores[orden - 1])
      if (array_valores.includes(valor_string)) {
        if (controlVars.msg_discard_value) console.log('Esta el valor de descarte, IGNORAR');
        return;
      }
    }

    // Comprobamos si es un valor de error y por tanto no hay que introducirlo, lo ingnoramos
    if (sensor_data[i]['errorvalue'] != null && sensor_data[i]['errorvalue'] == listaValores[orden - 1]) continue;

    // Coprobamos si el campo es un campo que lat/lon/cota que ha de utilizarse para geoposicionar la llamada que se hace 
    switch (sensor_data[i]['datafield']) { //generico
      case 'lat':
        lat = listaValores[orden - 1];
        break;

      case 'lon':
        lon = listaValores[orden - 1];
        break;

      case 'cota':
        cota = listaValores[orden - 1];
        break;

      default:
        break;
    }

    // nodata indica que el dato debe ignorarse, 0 indica que entra como data en objData
    if (sensor_data[i]['nodata'] != 0) continue;

    // Comprobamos si los value están dentro o no de los umbrales
    if (sensor_data[i]['valuemax'] != null && sensor_data[i]['valuemax'] < listaValores[orden - 1]) continue;
    if (sensor_data[i]['valuemin'] != null && sensor_data[i]['valuemin'] > listaValores[orden - 1]) continue;

    // Aplicar correcciones de valor y tiempo
    // si hay corrección en el sensor nos quedamos con la del sensor y si no la general
    let correction = sensor_data[i]['correction_specific'] ?? sensor_data[i]['correction_general'];
    let correction_time = sensor_data[i]['correction_time_specific'] ?? sensor_data[i]['correction_time_general'];

    let val = 0;
    let time = 0;

    // Comprobamos que la cadena contiene una operación con "value+..."
    if (correction != null && correction.length > 0 && correction.includes('value')) {
      let cadena = correction.replace('value', listaValores[orden - 1]);
      val = Number(eval(cadena).toFixed(7))
    } else {
      val = Number(listaValores[orden - 1])
    }
    // Comprobamos que la cadena incluye "time+.."
    if (correction_time != null && correction_time.length > 0 && correction_time.includes('time')) {
      let cadena = correction_time.replace('time', date);
      time = eval(cadena)
    } else {
      time = date
    }


    // Creamos el objeto a ser enviado
    if (controlVars.msg_objData) console.log("obj.data", objData);
    let obj = {
      organizationid: String(board_config.organizationid),
      typemeter: String(board_config.typemeter),
      timestamp: time,
      timestamp_to: time,
      lat: Number(lat),
      lon: Number(lon),
      cota: Number(cota),
      timezone: String(board_config.timezone),
      description_origin: String(board_config.description_origin),
      origin: String(board_config.origin),
      uid: String(ttn_device_id),
      alias: String(board_config.alias),
      data: [
        {
          name: String(sensor_data[i]['type']),
          value: val,
          metric: String(sensor_data[i]['metric']),
          description: String(sensor_data[i]['description'])
        }
      ]
    };
    // Apilamos el objeto en
    dataSend.arrayobjects.push(obj);

    if (controlVars.msg_objFinal) console.log('Termino para hacer axios:', obj);
    if (controlVars.msg_objFinal) console.log('-------------------------');

  }


  // Si no hay objetos que enviar no enviamos nada
  if (dataSend.arrayobjects.length == 0) return;

  // Comprobar si hemos desactivado el envío de dato, si está desactivado entonces terminamos
  if (!controlVars.axios_control) return


  for (let i = 0; i < ingest_config.length; i++) {

    let configAxios = {
      method: 'post',
      url: ingest_config[i].urlIngest,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': ingest_config[i].authorization
      },
      data: dataSend
    };
    if (controlVars.msg_axios) console.log('Enviado a COLECCIÓN:', dataSend.topic_name)
    axios(configAxios)
      .then(function (response) {
        if (controlVars.msg_axios) console.log('Enviado a EndPoint SmartUniversity:', ttn_device_id);
      })
      .catch(function (error) {
        console.log(ttn_device_id, 'Error: ', error);
      });
    return;
  }

}



//client.on('error', (err) => console.log(err));

