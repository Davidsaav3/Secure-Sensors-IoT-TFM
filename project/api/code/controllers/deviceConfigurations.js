const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(express.json())
const verifyToken = require('../middleware/token');
const insertLog = require('../middleware/log');

  let corsMiddleware = require('../middleware/corsMiddleware');
  let securityMiddleware = require('../middleware/securityMiddleware ');
  router.use(corsMiddleware);
  router.use(securityMiddleware);

  // NO
  router.get("/:state/:search_text/:order_by/:ord_asc/:array_sensors/:sensors_act/:devices_act/:pag_tam/:pag_pag/:pos_x_1/:pos_x_2/:pos_y_1/:pos_y_2", verifyToken, (req,res)=>{  /*/ GET  /*/
    let state= req.params.state;
    let search_text= req.params.search_text;
    let order_by= req.params.order_by;
    let array_sensors= req.params.array_sensors;  
    let devices_act= parseInt(req.params.devices_act);
    let tam= parseInt(req.params.pag_pag);
    let act= (req.params.pag_tam-1)*parseInt(req.params.pag_pag);
    let ord_asc= req.params.ord_asc;
    let sensors_act= req.params.sensors_act;
    let x1= req.params.pos_x_1;
    let x2= req.params.pos_x_2;
    let y1= req.params.pos_y_1;
    let y2= req.params.pos_y_2;
    let array= [];
    let array2= array_sensors.split(",");

    for (let i= 0; i < array2.length; i++) {
      if(sensors_act==0){
        array.push(`(SELECT id_device FROM sensors_devices Where id_type_sensor=${array2[i]} AND sensors_devices.enable=0)`);
      }
      if(sensors_act==1){
        array.push(`(SELECT id_device FROM sensors_devices Where id_type_sensor=${array2[i]} AND sensors_devices.enable=1)`);
      }
      if(sensors_act==2){
        array.push(`(SELECT id_device FROM sensors_devices Where id_type_sensor=${array2[i]})`);
      }
    }

    let consulta= '';
    if(state=='0'){
      if(sensors_act==0){
        consulta= array.join(" OR id IN ")
      }
      if(sensors_act==1){
        consulta= array.join(" AND id IN ")
      }
      if(sensors_act==2){
        consulta= array.join(" AND id IN ")
      }
    }
    else{
      if(sensors_act==0){
        consulta= array.join(" OR device_configurations.id IN ")
      }
      if(sensors_act==1){
        consulta= array.join(" AND device_configurations.id IN ")
      }
      if(sensors_act==2){
        consulta= array.join(" AND device_configurations.id IN ")
      }
    }

    let xx1= parseFloat(x1);
    let xx2= parseFloat(x2);
    let yy1= parseFloat(y1);
    let yy2= parseFloat(y2);


      if(search_text=='search'){ // BUSQUEDA POR TEXTO ?
        if(array_sensors!=-1 || devices_act!=2){ //TIENE FILTROS AVANZADOS ?
          if(state=='0'){
            var variable= '';
            variable+= ` SELECT
            dc.*,
            st.id as sensor_id,
            st.type as type_name,
            sd.enable as sensor_enable,
            sd.orden as sensor_orden,
            (select description from data_estructure where id_estructure=id_data_estructure) as data_estructure,
            (select description from variable_data_structure where variable_data_structure.id=id_data_estructure) as variable_data_structure,`;
            if(devices_act!=2 && array_sensors==-1){
              //console.log("LISTA ACT")
              variable+= ` (SELECT COUNT(*) AS total FROM device_configurations WHERE device_configurations.enable=${devices_act}) as total FROM ( SELECT id FROM device_configurations WHERE enable=${devices_act} LIMIT ${tam} OFFSET ${act} ) AS subquery 
              LEFT JOIN device_configurations dc ON subquery.id = dc.id
              LEFT JOIN sensors_devices sd ON subquery.id = sd.id_device
              LEFT JOIN sensors_types st ON sd.id_type_sensor = st.id  
              order by ${order_by} ${ord_asc}`
              //console.log(variable)
              con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                if (err) throw err;
                const responseArray = auxGet(result);
                // LOG - 200 //
                insertLog(req.user.id, req.user.user, '001-001-200-001', "200", "GET", JSON.stringify(req.params),'Dispositivo obtenido 1', JSON.stringify(responseArray));
                res.json(responseArray);
              }); 
            }
            //
            else{
              if(array_sensors!=-1 && array_sensors!=-2){
                //console.log("LISTA FILTRO TODOS Y ACT")
                if(devices_act!=2){
                  variable+= ` (SELECT COUNT(*) AS total FROM device_configurations where device_configurations.id IN ${consulta} AND enable=${devices_act}) as total FROM (
                    SELECT id
                    FROM device_configurations where id IN ${consulta} AND enable=${devices_act} 
                    LIMIT ${tam}
                    OFFSET ${act}
                  ) AS subquery
                  LEFT JOIN device_configurations dc ON subquery.id = dc.id
                  LEFT JOIN sensors_devices sd ON subquery.id = sd.id_device
                  LEFT JOIN sensors_types st ON sd.id_type_sensor = st.id `
                }
                else{
                  variable+= ` (SELECT COUNT(*) AS total FROM device_configurations where device_configurations.id IN ${consulta}) as total FROM (
                    SELECT id
                    FROM device_configurations where id IN ${consulta}
                    LIMIT ${tam}
                    OFFSET ${act}
                  ) AS subquery
                  LEFT JOIN device_configurations dc ON subquery.id = dc.id
                  LEFT JOIN sensors_devices sd ON subquery.id = sd.id_device
                  LEFT JOIN sensors_types st ON sd.id_type_sensor = st.id `
                }
                //
                
                variable+= `order by ${order_by} ${ord_asc}`
                //console.log(variable)
                con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                  const responseArray = auxGet(result);
                  // LOG - 200 //
                  insertLog(req.user.id, req.user.user, '001-001-200-002', "200", "GET", JSON.stringify(req.params),'Dispositivo obtenido 2', JSON.stringify(responseArray));
                  res.json(responseArray);
                }); 
              }
              if(array_sensors==-2){
                //console.log("LISTA FILTRO NINGUNO Y ACT")
                if(devices_act!=2){
                  variable+= ` (SELECT COUNT(*) AS total FROM device_configurations where device_configurations.id NOT IN (SELECT id_device FROM sensors_devices) AND device_configurations.enable=${devices_act}) as total FROM (
                    SELECT id
                    FROM device_configurations where dc.id NOT IN (SELECT id_device FROM sensors_devices) AND enable=${devices_act}
                    LIMIT ${tam}
                    OFFSET ${act}
                  ) AS subquery
                  LEFT JOIN device_configurations dc ON subquery.id = dc.id
                  LEFT JOIN sensors_devices sd ON subquery.id = sd.id_device
                  LEFT JOIN sensors_types st ON sd.id_type_sensor = st.id `
                }
                else{
                  variable+= ` (SELECT COUNT(*) AS total FROM device_configurations where device_configurations.id NOT IN (SELECT id_device FROM sensors_devices) ) as total 
                  FROM (
                    SELECT id
                    FROM device_configurations where dc.id NOT IN (SELECT id_device FROM sensors_devices)
                    LIMIT ${tam}
                    OFFSET ${act}
                  ) AS subquery
                  LEFT JOIN device_configurations dc ON subquery.id = dc.id
                  LEFT JOIN sensors_devices sd ON subquery.id = sd.id_device
                  LEFT JOIN sensors_types st ON sd.id_type_sensor = st.id `
                }
                //
                /*variable+= ` where dc.id NOT IN (SELECT id_device FROM sensors_devices)`
                if(devices_act!=2){
                  variable+= ` AND dc.enable=${devices_act}`
                }*/
                variable+= `
                order by ${order_by} ${ord_asc}`
                con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                  const responseArray = auxGet(result);
                  // LOG - 200 //
                  insertLog(req.user.id, req.user.user, '001-001-200-003', "200", "GET", JSON.stringify(req.params),'Dispositivo obtenido 3', JSON.stringify(responseArray));
                  res.json(responseArray);
                }); 
              }
            }
          }
          else{
            var variable= '';
            variable+= ` SELECT device_configurations.*, sensors_types.id as sensor_id, sensors_types.type as type_name, sensors_devices.enable as sensor_enable, sensors_devices.orden as sensor_orden,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure, (select description from variable_data_structure where variable_data_structure.id=id_data_estructure) as variable_data_structure FROM device_configurations `
            if(devices_act!=2 && array_sensors==-1){
              //console.log("MAPA ACT")
              variable+= `LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
              LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id 
              WHERE device_configurations.enable=${devices_act} AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`
              con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                if (err) throw err;
                const responseArray = auxGet(result);
                // LOG - 200 //
                insertLog(req.user.id, req.user.user, '001-001-200-004', "200", "GET", JSON.stringify(req.params),'Dispositivo obtenido 4', JSON.stringify(responseArray));
                res.json(responseArray);
              }); 
            }
            //
            else{
              if(array_sensors!=-1 && array_sensors!=-2){
                //console.log("MAPA FILTRO TODOS Y ACT")
                variable+= ` 
                LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
                LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id 
                where device_configurations.id IN ${consulta}`
                if(devices_act!=2){
                  variable+= ` AND device_configurations.enable=${devices_act}`
                }
                variable+= ` AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`
                con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                  const responseArray = auxGet(result);
                  // LOG - 200 //
                  insertLog(req.user.id, req.user.user, '001-001-200-005', "200", "GET", JSON.stringify(req.params),'Dispositivo obtenido 5', JSON.stringify(responseArray));
                  res.json(responseArray);
                }); 
              }
              if(array_sensors==-2){
                //console.log("MAPA FILTRO NINGUNO Y ACT")
                variable+= ` 
                LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
                LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id 
                where device_configurations.id NOT IN (SELECT id_device FROM sensors_devices)`
                if(devices_act!=2){
                  variable+= ` AND device_configurations.enable=${devices_act}`
                }
                variable+= ` AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`
                con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                  const responseArray = auxGet(result);
                  // LOG - 200 //
                  insertLog(req.user.id, req.user.user, '001-001-200-006', "200", "GET", JSON.stringify(req.params),'Dispositivo obtenido 6', JSON.stringify(responseArray));
                  res.json(responseArray);
                }); 
              }
            }
          }
        }
        else{
          if(state=='0'){
            //console.log("LISTA SIMPLE")
            con.query(` SELECT
            dc.*,
            st.id as sensor_id,
            st.type as type_name,
            sd.enable as sensor_enable,
            sd.orden as sensor_orden,
            (SELECT COUNT(*) FROM device_configurations) as total,
            (select description from data_estructure where id_estructure=id_data_estructure) as data_estructure, (select description from variable_data_structure where variable_data_structure.id=id_data_estructure) as variable_data_structure   
          FROM (
            SELECT id
            FROM device_configurations
            LIMIT ${tam}
            OFFSET ${act}
          ) AS subquery
          LEFT JOIN device_configurations dc ON subquery.id = dc.id
          LEFT JOIN sensors_devices sd ON subquery.id = sd.id_device
          LEFT JOIN sensors_types st ON sd.id_type_sensor = st.id 
          ORDER BY ${order_by} ${ord_asc};
          `, function (err, result) {
              const responseArray = auxGet(result);
              // LOG - 200 //
              insertLog(req.user.id, req.user.user, '001-001-200-007', "200", "GET", JSON.stringify(req.params),'Dispositivo obtenido 7', JSON.stringify(responseArray));
              res.json(responseArray);
            }); 
          }
          else{
            //console.log("MAPA SIMPLE")
            con.query(` SELECT device_configurations.*, sensors_types.id as sensor_id, sensors_types.type as type_name, sensors_devices.enable as sensor_enable,sensors_devices.orden as sensor_orden,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure FROM device_configurations
            LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
            LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id 
            WHERE lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`, function (err, result) {
              const responseArray = auxGet(result);
              // LOG - 200 //
              insertLog(req.user.id, req.user.user, '001-001-200-008', "200", "GET", JSON.stringify(req.params),'Dispositivos obtenidos 8', JSON.stringify(responseArray));
              res.json(responseArray);
            }); 
          }
        }
      }
      else{
        if(state=='0'){
          //console.log("LISTA BUSQUEDA POR TEXTO")
            con.query(` SELECT
            dc.*, -- Aquí puedes seleccionar los campos específicos que necesitas de device_configurations
            st.id as sensor_id,
            st.type as type_name,
            sd.enable as sensor_enable,
            sd.orden as sensor_orden,
            (SELECT COUNT(*) FROM device_configurations WHERE uid LIKE '%${search_text}%' OR alias LIKE '%${search_text}%' OR origin LIKE '%${search_text}%' OR description_origin LIKE '%${search_text}%' OR application_id LIKE '%${search_text}%' OR topic_name LIKE '%${search_text}%' OR typemeter LIKE '%${search_text}%' OR lat LIKE '%${search_text}%' OR lon LIKE '%${search_text}%' OR cota LIKE '%${search_text}%' OR timezone LIKE '%${search_text}%' OR device_configurations.enable LIKE '%${search_text}%' OR organizationid LIKE '%${search_text}%') as total,
            (select description from data_estructure where id_estructure=id_data_estructure) as data_estructure, (select description from variable_data_structure where variable_data_structure.id=id_data_estructure) as variable_data_structure 
          FROM (
            SELECT id
            FROM device_configurations WHERE uid LIKE '%${search_text}%' OR alias LIKE '%${search_text}%' OR origin LIKE '%${search_text}%' OR description_origin LIKE '%${search_text}%' OR application_id LIKE '%${search_text}%' OR topic_name LIKE '%${search_text}%' OR typemeter LIKE '%${search_text}%' OR lat LIKE '%${search_text}%' OR lon LIKE '%${search_text}%' OR cota LIKE '%${search_text}%' OR timezone LIKE '%${search_text}%' OR enable LIKE '%${search_text}%' OR organizationid LIKE '%${search_text}%'
            LIMIT ${tam}
            OFFSET ${act}
          ) AS subquery
          LEFT JOIN device_configurations dc ON subquery.id = dc.id
          LEFT JOIN sensors_devices sd ON subquery.id = sd.id_device
          LEFT JOIN sensors_types st ON sd.id_type_sensor = st.id  
          ORDER BY ${order_by} ${ord_asc};`, function (err, result) {
            if (err) throw err;
            const responseArray = auxGet(result);
            // LOG - 200 //
            insertLog(req.user.id, req.user.user, '001-001-200-009', "200", "GET", JSON.stringify(req.params),'Dispositivos obtenidos 9', JSON.stringify(responseArray));
            res.json(responseArray);    
          });
        }
        else{
          //console.log("MAPA BUSQUEDA POR TEXTO")
            con.query(` SELECT device_configurations.*, sensors_types.id as sensor_id, sensors_types.type as type_name, sensors_devices.enable as sensor_enable ,sensors_devices.orden as sensor_orden 
            FROM device_configurations
            LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
            LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id  
            WHERE uid LIKE '%${search_text}%' OR alias LIKE '%${search_text}%' OR origin LIKE '%${search_text}%' OR description_origin LIKE '%${search_text}%' OR application_id LIKE '%${search_text}%' OR topic_name LIKE '%${search_text}%' OR typemeter LIKE '%${search_text}%' OR lat LIKE '%${search_text}%' OR lon LIKE '%${search_text}%' OR cota LIKE '%${search_text}%' OR timezone LIKE '%${search_text}%' OR device_configurations.enable LIKE '%${search_text}%' OR organizationid LIKE '%${search_text}%' AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`, function (err, result) {
            if (err) throw err;
            const responseArray = auxGet(result);
            // LOG - 200 //
            insertLog(req.user.id, req.user.user, '001-001-200-010', "200", "GET", JSON.stringify(req.params),'Dispositivos obtenidos 10', JSON.stringify(responseArray));
            res.json(responseArray);
          });
        }
      }
    
  });

  function auxGet(result) { //Función auxiliar de get
    const devicesWithSensors = {};
  
    result.forEach((row) => {
      const deviceId = row.id;
      if (!devicesWithSensors[deviceId]) {
        devicesWithSensors[deviceId] = {
          id: deviceId,
          topic_name: row.topic_name,
          organizationid: row.organizationid,
          uid: row.uid,
          application_id: row.application_id,
          alias: row.alias,
          enable: row.enable,
          updatedAt: row.updatedAt,
          lat: row.lat,
          lon: row.lon,
          topic_name: row.topic_name,
          total: row.total,
          data_estructure: row.data_estructure,
          variable_data_structure: row.variable_data_structure,
          variable_configuration: row.variable_configuration,
          sensors: [],
        };
      }
      if (row.sensor_id) {
        devicesWithSensors[deviceId].sensors.push({
          type_name: row.type_name,
          enable: row.sensor_enable,
          orden: row.sensor_orden,
        });
      }
      devicesWithSensors[deviceId].sensors.sort((a, b) => a.orden - b.orden);
    });
    return Object.values(devicesWithSensors);
  }

  router.get("/id/:id", verifyToken, (req, res) => {  /*/ ID /*/
    const id = parseInt(req.params.id);

    let query1 = `SELECT variable_configuration FROM device_configurations WHERE id=?`;
    con.query(query1, [id], (err, result) => {
      if (err) {
        console.error("Error:", err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '001-002-500-001', "500", "GET", JSON.stringify(req.params),'Error en la base de datos 1', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos 1' });
      }
      var query = `SELECT dc.*, de.description AS structure_name,
      s.orden, s.enable as sensor_enable, s.id_device, s.id_type_sensor, s.id AS sensor_id, s.datafield, s.nodata,
      (SELECT type FROM sensors_types as t WHERE s.id_type_sensor = t.id) AS type_name,
      s.correction_specific, s.correction_time_specific, s.topic_specific,
      (SELECT position FROM sensors_types as t WHERE s.id_type_sensor = t.id) AS position
      FROM device_configurations dc
      LEFT JOIN sensors_devices s ON dc.id = s.id_device
      WHERE dc.id = ? 
      ORDER BY s.orden;`
      var variable_configuration=-1;
      variable_configuration = result[0].variable_configuration;

      setTimeout(() => {

      if(variable_configuration==0){
        query =`SELECT dc.*, de.description AS structure_name,
         s.orden, s.enable as sensor_enable, s.id_device, s.id_type_sensor, s.id AS sensor_id, s.datafield, s.nodata,
         (SELECT type FROM sensors_types as t WHERE s.id_type_sensor = t.id) AS type_name,
         s.correction_specific, s.correction_time_specific, s.topic_specific,
         (SELECT position FROM sensors_types as t WHERE s.id_type_sensor = t.id) AS position
         FROM device_configurations dc
         INNER JOIN data_estructure de ON dc.id_data_estructure = de.id_estructure
         LEFT JOIN sensors_devices s ON dc.id = s.id_device
         WHERE dc.id = ? 
         ORDER BY s.orden;`
        }
       if(variable_configuration==1){
        query =`SELECT dc.*, de.description AS structure_name,
         s.orden, s.enable as sensor_enable, s.id_device, s.id_type_sensor, s.id AS sensor_id, s.datafield, s.nodata,
         (SELECT type FROM sensors_types as t WHERE s.id_type_sensor = t.id) AS type_name,
         s.correction_specific, s.correction_time_specific, s.topic_specific,
         (SELECT position FROM sensors_types as t WHERE s.id_type_sensor = t.id) AS position
         FROM device_configurations dc
         INNER JOIN variable_data_structure de ON dc.id_data_estructure = de.id
         LEFT JOIN sensors_devices s ON dc.id = s.id_device
         WHERE dc.id = ? 
         ORDER BY s.orden;`
        }

       con.query(query, [id], (err, result) => {
        if (err) {
          console.error("Error:", err);
          // LOG - 500 //
          insertLog(req.user.id, req.user.user, '001-002-500-002', "500", "GET", JSON.stringify(req.params),'Error en la base de datos 2', JSON.stringify(err));
          return res.status(500).json({ error: 'Error en la base de datos 2' });
        }
        if (result.length === 0) {
            // Ninguna de las consultas anteriores devolvió filas, ejecuta ambas sin el LEFT JOIN
            query = `SELECT dc.*,
            s.orden, s.enable as sensor_enable, s.id_device, s.id_type_sensor, s.id AS sensor_id, s.datafield, s.nodata,
            (SELECT type FROM sensors_types as t WHERE s.id_type_sensor = t.id) AS type_name,
            s.correction_specific, s.correction_time_specific, s.topic_specific,
            (SELECT position FROM sensors_types as t WHERE s.id_type_sensor = t.id) AS position
            FROM device_configurations dc
            LEFT JOIN sensors_devices s ON dc.id = s.id_device
            WHERE dc.id = ? 
            ORDER BY s.orden;`
    
            con.query(query, [id], (err, result) => {
              if (err) {
                console.error("Error:", err);
                // LOG - 500 //
                insertLog(req.user.id, req.user.user, '001-002-500-003', "500", "GET", JSON.stringify(req.params),'Error en la base de datos 3', JSON.stringify(err));
                return res.status(500).json({ error: 'Error en la base de datos 3' });
              }
              const devicesWithSensors = {};
              result.forEach((row) => {
                const deviceId = row.id;
            
                if (!devicesWithSensors[deviceId]) {
                  devicesWithSensors[deviceId] = {
                    id: deviceId,
                    uid: row.uid, 
                    alias: row.alias, 
                    origin: row.origin,
                    description_origin: row.description_origin, 
                    application_id: row.application_id, 
                    topic_name: row.topic_name,
                    typemeter: row.typemeter, 
                    lat: row.lat, 
                    lon: row.lon, 
                    cota: row.cota,
                    timezone: row.timezone,
                    enable: row.enable,
                    organizationid: row.organizationid, 
                    createdAt: row.createdAt,
                    updatedAt: row.updatedAt,
                    id_data_estructure: row.id_data_estructure, 
                    variable_configuration: row.variable_configuration,
                    sensors: [],
                  };
                }
            
                if (row.sensor_id) {
                  devicesWithSensors[deviceId].sensors.push({
                    orden: row.orden,
                    enable: row.sensor_enable, 
                    id_device: row.id_device, 
                    id_type_sensor: row.id_type_sensor, 
                    id: row.sensor_id,
                    datafield: row.datafield, 
                    nodata: row.nodata, 
                    type_name: row.type_name,
                    correction_specific: row.correction_specific,
                    correction_time_specific: row.correction_time_specific, 
                    topic_specific: row.topic_specific, 
                    position: row.position,
                  });
                }
              });
              const responseArray = Object.values(devicesWithSensors);
              // LOG - 200 //
              insertLog(req.user.id, req.user.user, '001-002-200-001', "200", "GET", JSON.stringify(req.params),'Dispositivo obtenido 1', JSON.stringify(responseArray));
              res.json(responseArray);        
            });
          }
          else{
            const devicesWithSensors = {};
            result.forEach((row) => {
              const deviceId = row.id;
          
              if (!devicesWithSensors[deviceId]) {
                devicesWithSensors[deviceId] = {
                  id: deviceId,
                  uid: row.uid, 
                  alias: row.alias, 
                  origin: row.origin,
                  description_origin: row.description_origin, 
                  application_id: row.application_id, 
                  topic_name: row.topic_name,
                  typemeter: row.typemeter, 
                  lat: row.lat, 
                  lon: row.lon, 
                  cota: row.cota,
                  timezone: row.timezone,
                  enable: row.enable,
                  organizationid: row.organizationid, 
                  createdAt: row.createdAt,
                  updatedAt: row.updatedAt,
                  id_data_estructure: row.id_data_estructure, 
                  variable_configuration: row.variable_configuration,
                  sensors: [],
                };
              }
          
              if (row.sensor_id) {
                devicesWithSensors[deviceId].sensors.push({
                  orden: row.orden,
                  enable: row.sensor_enable, 
                  id_device: row.id_device, 
                  id_type_sensor: row.id_type_sensor, 
                  id: row.sensor_id,
                  datafield: row.datafield, 
                  nodata: row.nodata, 
                  type_name: row.type_name,
                  correction_specific: row.correction_specific,
                  correction_time_specific: row.correction_time_specific, 
                  topic_specific: row.topic_specific, 
                  position: row.position,
                });
              }
            });
            const responseArray = Object.values(devicesWithSensors);

            // LOG - 200 //
            insertLog(req.user.id, req.user.user, '001-001-200-002', "200", "GET", JSON.stringify(req.params),'Dispositivo obtenido 2', JSON.stringify(responseArray));
            res.json(responseArray);
          }
       });
      }, 100);

    });

  });

  router.get("/duplicate/:uid", verifyToken, (req, res) => {  /*/ DUPLICATE  /*/
    const uid = req.params.uid;
    const MAX_DUPLICATE_ATTEMPTS = 30;
    
    // Valida
    let query = `SELECT uid FROM device_configurations`;
    con.query(query, (err, result) => {
        if (err) {
            console.error(err);
            // LOG - 500 //
            insertLog(req.user.id, req.user.user, '001-003-500-001', "500", "GET", JSON.stringify(req.params),'Error al duplicar dispositivo', JSON.stringify(err));
            return res.status(500).json({ error: 'Error al duplicar dispositivo' });
        }

        let contador = 1;
        let nombresExistentes = new Set();
        for (let index = 0; index < result.length; index++) {
            nombresExistentes.add(result[index].uid);
        }

        let uid_2 = uid;
        while (nombresExistentes.has(uid_2)) {
            // Limitar bucles
            if (contador > MAX_DUPLICATE_ATTEMPTS) {
                // LOG - 500 //
                insertLog(req.user.id, req.user.user, '001-003-500-002', "500", "GET", JSON.stringify(req.params),'Se excedió el límite de intentos de duplicación', "");
                return res.status(500).json({ error: 'Se excedió el límite de intentos de duplicación' });
            }
            uid_2 = `${uid}_${contador}`;
            contador++;
        }

        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '001-003-200-001', "200", "GET", JSON.stringify(req.params),'Dispositivo duplicado', JSON.stringify(uid_2));
        res.send(uid_2);
    });
  });

  router.post("", verifyToken, (req, res) => { // POST Y DELETE //
    const {
      uid, alias, origin, description_origin, application_id, topic_name, typemeter, lat, lon, cota, timezone, enable, organizationid, createdAt, updatedAt, id_data_estructure, variable_configuration
    } = req.body;
  
    if (!uid) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '001-004-400-001', "400", "POST", JSON.stringify(req.body),'Uid es requerido', "");
      return res.status(400).json({ error: 'Uid es requerido' });
    }
    if (!topic_name) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '001-004-400-002', "400", "POST", JSON.stringify(req.body),'Topic_name es requerido', "");
      return res.status(400).json({ error: 'Topic_name es requerido' });
    }
  
    // uid ya existe
    const queryCheckUid = 'SELECT * FROM device_configurations WHERE uid = ?';
    con.query(queryCheckUid, [uid], (err, result) => {
      if (err) {
        console.error('Error:', err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '001-004-500-001', "500", "POST", JSON.stringify(req.body),'Error al crear el dispositivo 1', JSON.stringify(err));
        return res.status(500).json({ error: 'Error al crear el dispositivo 1' });
      }
  
      if (result.length > 0) {
        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '001-004-200-001', "200", "POST", JSON.stringify(req.body),'Dispositivo creado 1', "");
        return res.status(200).json({ found: true, message: 'Dispositivo creado 1' });
      } 
      else {
        const queryInsert = `
          INSERT INTO device_configurations (
            uid, alias, origin, description_origin, application_id, topic_name, typemeter, lat, lon, cota, timezone, enable, organizationid, createdAt, updatedAt, id_data_estructure, variable_configuration
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
        con.query(queryInsert,
          [
            uid, alias, origin, description_origin, application_id, topic_name, typemeter, lat, lon, cota, timezone, enable, organizationid, createdAt, updatedAt, id_data_estructure, variable_configuration,
          ],
          (err, result) => {
            if (err) {
              console.error("Error:", err);
              // LOG - 500 //
              insertLog(req.user.id, req.user.user, '001-004-500-002', "500", "POST", JSON.stringify(req.body),'Error al crear el dispositivo 2', JSON.stringify(err));
              return res.status(500).json({ error: 'Error al crear el dispositivo 2' });
            }
            
            auxPost(req.body.sensors, result.insertId);
            
            // LOG - 200 //
            insertLog(req.user.id, req.user.user, '001-004-200-002', "200", "POST", JSON.stringify(req.body),'Dispositivo creado 2', "");
            res.send(result);
          }
        );
      }
    });
  });
  

  function auxPost(sensors, id_exp){
    const newRecords = sensors;
    
    con.beginTransaction((err) => {
      if (err) {
        console.error("Error al iniciar la transacción:", err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '001-004-500-003', "500", "POST", JSON.stringify(req.body),'Error al crear el dispositivo 3', JSON.stringify(err));
        return res.status(500).json({ error: 'Error al crear el dispositivo 3' });
      }
  
        if (Array.isArray(newRecords) && newRecords.length > 0 || newRecords[0].id === -1) {
          con.query("DELETE FROM sensors_devices WHERE id_device = ?", [id_exp], (err) => {
            if (err) {
              console.error("Error al eliminar registros existentes:", err);
              // LOG - 500 //
              insertLog(req.user.id, req.user.user, '001-004-500-004', "500", "POST", JSON.stringify(req.body),'Error al crear el dispositivo 4', JSON.stringify(err));
              con.rollback(() => {
                res.status(500).json({ error: 'Error al crear el dispositivo 4' });
              });
            } 
            if (Array.isArray(newRecords) && newRecords.length > 0 && newRecords[0].id != -1) {

              const insertQueries = newRecords.map((record) => {
                const nodataValue = record.nodata ? 1 : 0;
                const correction_specificValue = record.correction_specific === "" ? null : record.correction_specific;
                const correction_time_specificValue = record.correction_time_specific === "" ? null : record.correction_time_specific;
                const topic_specificValue = record.topic_specific === "" ? null : record.topic_specific;
                
                return [
                  record.orden, record.enable, id_exp,
                  record.id_type_sensor, record.datafield, nodataValue,
                  correction_specificValue, correction_time_specificValue, topic_specificValue,
                ];
              });
    
              con.query(`
                INSERT INTO sensors_devices (orden, enable, id_device, id_type_sensor, datafield, nodata, correction_specific, correction_time_specific, topic_specific)
                VALUES ?
              `, [insertQueries], (err, result) => {
                if (err) {
                  console.error("Error al insertar los nuevos registros:", err);
                  con.rollback(() => {
                    res.status(500).json({ error: 'Error en la base de datos' });
                    // LOG - 500 //
                    insertLog(req.user.id, req.user.user, '001-004-500-005', "500", "POST", JSON.stringify(req.body),'Error al crear el dispositivo 5', JSON.stringify(err));
                  });
                } 
                else {
                  con.commit((err) => {
                    if (err) {
                      console.error("Error al confirmar la transacción:", err);
                      con.rollback(() => {
                        res.status(500).json({ error: 'Error en la base de datos' });
                        // LOG - 500 //
                        insertLog(req.user.id, req.user.user, '001-004-500-006', "500", "POST", JSON.stringify(req.body),'Error al crear el dispositivo 6', JSON.stringify(err));
                      });
                    } 
                    else {
                      //res.send(result);
                    }
                  });
                }
              });
            }
          });
        } 
        else {
          con.commit((err) => {
            if (err) {
              console.error("Error al confirmar la transacción:", err);
              con.rollback(() => {

                // LOG - 500 //
                insertLog(req.user.id, req.user.user, '001-004-500-007', "500", "POST", JSON.stringify(req.body),'Error al crear el dispositivo 7', JSON.stringify(err));
                res.status(500).json({ error: 'Error al crear el dispositivo 7' });
              });
            } 
            else {
              // LOG - 200 //
              insertLog(req.user.id, req.user.user, '001-004-200-003', "200", "POST", JSON.stringify(req.body),'Dispositivo creado 3', "");
              res.send({ message: 'Dispositivo creado 3' });
            }
          });
        }
      
    });
  }

  router.put("", verifyToken, (req, res) => { // UPDATE //
      const {
        uid, alias, origin, description_origin, application_id, topic_name, typemeter, lat, lon, cota, timezone, enable, organizationid, updatedAt, id_data_estructure, variable_configuration, id: id7,
      } = req.body;
    
      if (!uid || !topic_name) {
        // LOG - 400 //
        insertLog(req.user.id, req.user.user, '001-005-400-001', "400", "PUT", JSON.stringify(req.body),'Uid y topic_name son requeridos', "");
        return res.status(400).json({ error: 'Uid y topic_name son requeridos' });
      }
    
      const queryCheckUid = 'SELECT * FROM device_configurations WHERE uid = ? AND id != ?';
      con.query(queryCheckUid, [uid, id7], (err, result) => {
        if (err) {
          console.error('Error:', err);
          // LOG - 500 //
          insertLog(req.user.id, req.user.user, '001-005-500-001', "500", "PUT", JSON.stringify(req.body),'Error al actualizar el dispositivo 1', JSON.stringify(err));
          return res.status(500).json({ error: 'Error al actualizar el dispositivo 1' });
        }
    
        // UID duplicado
        if (result.length > 0) {
          // LOG - 200 //
          insertLog(req.user.id, req.user.user, '001-005-200-001', "200", "PUT", JSON.stringify(req.body),'Uid duplicado', "");
          return res.status(200).json({ found: true, message: 'Uid duplicado' });
        } 
        else {
          // Sin ningún dispositivo
          const queryUpdate = `UPDATE device_configurations SET uid = ?, alias = ?, origin = ?, description_origin = ?, application_id = ?, topic_name = ?, typemeter = ?, lat = ?, lon = ?, cota = ?, timezone = ?, enable = ?, organizationid = ?, updatedAt = ?, id_data_estructure = ?, variable_configuration = ? WHERE id = ?`;
          const values = [uid, alias, origin, description_origin, application_id, topic_name, typemeter, lat, lon, cota, timezone, enable, organizationid, updatedAt, id_data_estructure, variable_configuration, id7];
          
          con.query(queryUpdate, values, (err, result) => {
            if (err) {
              console.error("Error:", err);
              // LOG - 500 //
              insertLog(req.user.id, req.user.user, '001-005-500-002', "500", "PUT", JSON.stringify(req.body),'Error al actualizar el dispositivo 2', JSON.stringify(err));
              return res.status(500).json({ error: 'Error al actualizar el dispositivo 2' });
            }
            // éxito
            auxPost(req.body.sensors, id7);
            res.send(result);
          });
        }
      });
    }); 
    

  router.delete("", verifyToken, (req, res) => {
    const id = req.body.id;

    if (isNaN(id)) {
        // LOG - 400 //
        insertLog(req.user.id, req.user.user, '001-006-400-001', "400", "DELETE", JSON.stringify(req.body), 'Id no válido', "");
        return res.status(400).json({ error: 'ID no válido' });
    }

    con.beginTransaction(function (err) {
        if (err) {
            // LOG - 500 //
            insertLog(req.user.id, req.user.user, '001-006-500-001', "500", "DELETE", JSON.stringify(req.body), 'Error al eliminar dispositivo 1', JSON.stringify(err));
            return res.status(500).json({ error: 'Error al eliminar dispositivo 1' });
        }

        // Eliminación
        con.query("DELETE FROM device_configurations WHERE id = ?", id, function (err, result) {
            if (err) {
                con.rollback(function () {
                    // LOG - 500 //
                    insertLog(req.user.id, req.user.user, '001-006-500-002', "500", "DELETE", JSON.stringify(req.body), 'Error al eliminar dispositivo 2', JSON.stringify(err));
                    return res.status(500).json({ error: 'Error al eliminar dispositivo 2' });
                });
            }

            if (result.affectedRows === 0) {
                con.rollback(function () {
                    // LOG - 404 //
                    insertLog(req.user.id, req.user.user, '001-006-404-001', "404", "DELETE", JSON.stringify(req.body), 'No encontrado al eliminar dispositivo', "");
                    return res.status(404).json({ error: 'No encontrado al eliminar dispositivo' });
                });
            }

            // Eliminación sensores 
            con.query("DELETE FROM sensors_devices WHERE id_device = ?", id, function (err, result) {
                if (err) {
                    con.rollback(function () {
                        // LOG - 500 //
                        insertLog(req.user.id, req.user.user, '001-006-500-003', "500", "DELETE", JSON.stringify(req.body), 'Error al eliminar dispositivo 3', "");
                        return res.status(500).json({ error: 'Error al eliminar dispositivo 3' });
                    });
                }

                con.commit(function (err) {
                    if (err) {
                        con.rollback(function () {
                            // LOG - 500 //
                            insertLog(req.user.id, req.user.user, '001-006-500-004', "500", "DELETE", JSON.stringify(req.body), 'Error al eliminar dispositivo 4', JSON.stringify(err));
                            return res.status(500).json({ error: 'Error al eliminar dispositivo 4' });
                        });
                    }

                    // LOG - 200 //
                    insertLog(req.user.id, req.user.user, '001-006-200-001', "200", "DELETE", JSON.stringify(req.body), 'Dispositivo eliminado', "");
                    res.json({ message: 'Dispositivo eliminado' });
                });
            });
        });
    });
});


module.exports = router;
