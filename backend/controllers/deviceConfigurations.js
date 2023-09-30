const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())

  router.get("/get/:state/:search_text/:order_by/:ord_asc/:array_sensors/:sensors_act/:devices_act/:pag_tam/:pag_pag/:pos_x_1/:pos_x_2/:pos_y_1/:pos_y_2", (req,res)=>{  /*/ GET  /*/
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
        consulta= array.join(" OR dc.id IN ")
      }
      if(sensors_act==1){
        consulta= array.join(" AND dc.id IN ")
      }
      if(sensors_act==2){
        consulta= array.join(" AND dc.id IN ")
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
    console.log("---")


      if(search_text=='search'){ // BUSQUEDA POR TEXTO ?
        if(array_sensors!=-1 || devices_act!=2){ //TIENE FILTROS AVANZADOS ?
          if(state=='0'){
            var variable= '';
            variable+= ` SELECT
            dc.*,
            st.id as sensor_id,
            st.type as type_name,
            sd.enable as sensor_enable,
            (select description from data_estructure where id_estructure=id_data_estructure) as data_estructure,
            (select description from variable_data_structure where variable_data_structure.id=id_data_estructure) as variable_data_structure,`;
            if(devices_act!=2 && array_sensors==-1){
              console.log("LISTA ACT")
              variable+= ` (SELECT COUNT(*) AS total FROM device_configurations WHERE device_configurations.enable=${devices_act}) as total FROM ( SELECT id FROM device_configurations WHERE enable=${devices_act} LIMIT ${tam} OFFSET ${act}) AS subquery 
              LEFT JOIN device_configurations dc ON subquery.id = dc.id
              LEFT JOIN sensors_devices sd ON subquery.id = sd.id_device
              LEFT JOIN sensors_types st ON sd.id_type_sensor = st.id  
              order by ${order_by} ${ord_asc}`
              //console.log(variable)
              con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                if (err) throw err;
                const responseArray = auxGet(result);
                res.json(responseArray);
              }); 
            }
            //
            else{
              if(array_sensors!=-1 && array_sensors!=-2){
                console.log("LISTA FILTRO TODOS Y ACT")
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
                
                variable+= `
                order by ${order_by} ${ord_asc}`
                //console.log(variable)
                con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                  const responseArray = auxGet(result);
                  res.json(responseArray);
                }); 
              }
              if(array_sensors==-2){
                console.log("LISTA FILTRO NINGUNO Y ACT")
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
                //console.log(variable)
                con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                  const responseArray = auxGet(result);
                  res.json(responseArray);
                }); 
              }
            }
          }
          else{
            var variable= '';
            variable+= ` SELECT device_configurations.*, sensors_types.id as sensor_id, sensors_types.type as type_name, sensors_devices.enable as sensor_enable,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure, (select description from variable_data_structure where variable_data_structure.id=id_data_estructure) as variable_data_structure FROM device_configurations `
            if(devices_act!=2 && array_sensors==-1){
              console.log("MAPA ACT")
              variable+= `LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
              LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id 
              WHERE device_configurations.enable=${devices_act} AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`
              con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                if (err) throw err;
                const responseArray = auxGet(result);
                res.json(responseArray);
              }); 
            }
            //
            else{
              if(array_sensors!=-1 && array_sensors!=-2){
                console.log("MAPA FILTRO TODOS Y ACT")
                variable+= ` 
                LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
                LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id 
                where device_configurations.id IN ${consulta}`
                if(devices_act!=2){
                  variable+= ` AND device_configurations.enable=${devices_act}`
                }
                variable+= ` AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`
                //console.log(variable)
                con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                  const responseArray = auxGet(result);
                  res.json(responseArray);
                }); 
              }
              if(array_sensors==-2){
                console.log("MAPA FILTRO NINGUNO Y ACT")
                variable+= ` 
                LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
                LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id 
                where device_configurations.id NOT IN (SELECT id_device FROM sensors_devices)`
                if(devices_act!=2){
                  variable+= ` AND device_configurations.enable=${devices_act}`
                }
                variable+= ` AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`
                //console.log(variable)
                con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                  const responseArray = auxGet(result);
                  res.json(responseArray);
                }); 
              }
            }
          }
        }
        else{
          if(state=='0'){
            console.log("LISTA SIMPLE")
            con.query(` SELECT
            dc.*,
            st.id as sensor_id,
            st.type as type_name,
            sd.enable as sensor_enable,
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
              res.json(responseArray);
            }); 
          }
          else{
            console.log("MAPA SIMPLE")
            con.query(` SELECT device_configurations.*, sensors_types.id as sensor_id, sensors_types.type as type_name, sensors_devices.enable as sensor_enable,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure FROM device_configurations
            LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
            LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id 
            WHERE lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`, function (err, result) {
              const responseArray = auxGet(result);
              res.json(responseArray);
            }); 
          }
        }
      }
      else{
        if(state=='0'){
          console.log("LISTA BUSQUEDA POR TEXTO")
            con.query(` SELECT
            dc.*, -- Aquí puedes seleccionar los campos específicos que necesitas de device_configurations
            st.id as sensor_id,
            st.type as type_name,
            sd.enable as sensor_enable,
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
            res.json(responseArray);    
          });
        }
        else{
          console.log("MAPA BUSQUEDA POR TEXTO")
            con.query(` SELECT device_configurations.*, sensors_types.id as sensor_id, sensors_types.type as type_name, sensors_devices.enable as sensor_enable  
            FROM device_configurations
            LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
            LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id  
            WHERE uid LIKE '%${search_text}%' OR alias LIKE '%${search_text}%' OR origin LIKE '%${search_text}%' OR description_origin LIKE '%${search_text}%' OR application_id LIKE '%${search_text}%' OR topic_name LIKE '%${search_text}%' OR typemeter LIKE '%${search_text}%' OR lat LIKE '%${search_text}%' OR lon LIKE '%${search_text}%' OR cota LIKE '%${search_text}%' OR timezone LIKE '%${search_text}%' OR device_configurations.enable LIKE '%${search_text}%' OR organizationid LIKE '%${search_text}%' AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`, function (err, result) {
            if (err) throw err;
            const responseArray = auxGet(result);
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
        });
      }
    });
    return Object.values(devicesWithSensors);
  }

  router.get("/id/:id", (req, res) => {  /*/ ID /*/
    const id = parseInt(req.params.id);

    let query1 = `SELECT variable_configuration FROM device_configurations WHERE id=?`;
    con.query(query1, [id], (err, result) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      var query = `SELECT dc.*, de.description AS structure_name,
      s.orden, s.enable as sensor_enable, s.id_device, s.id_type_sensor, s.id AS sensor_id, s.datafield, s.nodata,
      (SELECT type FROM sensors_types as t WHERE s.id_type_sensor = t.id) AS type_name,
      s.correction_specific, s.correction_time_specific, s.topic_specific,
      (SELECT position FROM sensors_types as t WHERE s.id_type_sensor = t.id) AS position
      FROM device_configurations dc
      LEFT JOIN sensors_devices s ON dc.id = s.id_device
      WHERE dc.id = ?`
      var variable_configuration=-1;
      variable_configuration = result[0].variable_configuration;
      //console.log(result[0].variable_configuration)

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
         `; 
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
         `;
       }

       con.query(query, [id], (err, result) => {
         if (err) {
           console.error("Error:", err);
           return res.status(500).json({ error: 'Error en la base de datos' });
         }
         if (result.length === 0) {
            // Ninguna de las consultas anteriores devolvió filas, ejecuta ambas sin el LEFT JOIN
            //console.log('Ejecutando ambas consultas sin LEFT JOIN');
            query = `SELECT dc.*,
            s.orden, s.enable as sensor_enable, s.id_device, s.id_type_sensor, s.id AS sensor_id, s.datafield, s.nodata,
            (SELECT type FROM sensors_types as t WHERE s.id_type_sensor = t.id) AS type_name,
            s.correction_specific, s.correction_time_specific, s.topic_specific,
            (SELECT position FROM sensors_types as t WHERE s.id_type_sensor = t.id) AS position
            FROM device_configurations dc
            LEFT JOIN sensors_devices s ON dc.id = s.id_device
            WHERE dc.id = ?
            `;
    
            con.query(query, [id], (err, result) => {
              if (err) {
                console.error("Error:", err);
                return res.status(500).json({ error: 'Error en la base de datos' });
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
              res.json(responseArray);            });
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
            res.json(responseArray);
          }
       });
      }, 100);

    });

  });

  router.get("/max/", (req, res) => {  /*/ MAX  /*/
    const query = "SHOW TABLE STATUS LIKE 'device_configurations'";
    con.query(query, (err, result) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      //console.log(result[0].Auto_increment)
      const id = result[0].Auto_increment;
      res.json({ id });
    });
  });

  router.get("/duplicate/:uid", (req, res) => {  /*/ DUPLICATE  /*/
    const uid = req.params.uid;
    let query = `SELECT uid FROM device_configurations`;
    con.query(query, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error en la base de datos");
      }

      let contador = 1;
      let nombresExistentes = new Set();
      for (let index = 0; index < result.length; index++) {
        nombresExistentes.add(result[index].uid);
      }
      
      let uid_2 = uid;
      while (nombresExistentes.has(uid_2)) {
        uid_2 = `${uid}_${contador}`;
        contador++;
      }

      res.send(uid_2);
    });
  });

  router.post("", (req, res) => { /*/ POST Y DELETE  /*/
    const { 
      uid, alias, origin, description_origin, application_id, topic_name, typemeter, lat, lon, cota, timezone, enable, organizationid, createdAt, updatedAt, id_data_estructure, variable_configuration
    } = req.body;
    auxPost(req.body.sensors)

    if (!uid) {
      return res.status(400).json({ error: 'El campo uid es requerido.' });
    }
    if (!topic_name) {
      return res.status(400).json({ error: 'El campo topic_name es requerido.' });
    }
    const query = `
      INSERT INTO device_configurations (
      uid, alias, origin, description_origin, application_id, topic_name, typemeter, lat, lon, cota, timezone, enable, organizationid, createdAt, updatedAt, id_data_estructure, variable_configuration
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    con.query( query,
      [
        uid, alias, origin, description_origin, application_id, topic_name, typemeter, lat, lon, cota, timezone, enable, organizationid, createdAt, updatedAt, id_data_estructure,variable_configuration,
      ],
      (err, result) => {
        if (err) {
          console.error("Error:", err);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.send(result);
      }
    );
  });

  function auxPost(sensors){
  //router.post("", (req, res) => {  

    const newRecords = sensors;
    const deleteIdDevice = sensors;
  
    con.beginTransaction((err) => {
      if (err) {
        console.error("Error al iniciar la transacción:", err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
  
      if (deleteIdDevice[0].id === -1) {
        con.query("DELETE FROM sensors_devices WHERE id_device = ?", [deleteIdDevice[0].id_device], (err) => {
          if (err) {
            console.error("Error al eliminar registros existentes:", err);
            con.rollback(() => {
              res.status(500).json({ error: 'Error en la base de datos' });
            });
          } else {

            con.commit((err) => {
              if (err) {
                console.error("Error al confirmar la transacción:", err);
                con.rollback(() => {
                  res.status(500).json({ error: 'Error en la base de datos' });
                });
              } else {
                //res.send({ message: 'Registros eliminados exitosamente.' });
              }
            });
          }
        });
      } else {
        
        if (Array.isArray(newRecords) && newRecords.length > 0) {
          con.query("DELETE FROM sensors_devices WHERE id_device = ?", [newRecords[0].id_device], (err) => {
            if (err) {
              console.error("Error al eliminar registros existentes:", err);
              con.rollback(() => {
                res.status(500).json({ error: 'Error en la base de datos' });
              });
            } else {
              const insertQueries = newRecords.map((record) => {
                const nodataValue = record.nodata ? 1 : 0;
                const correction_specificValue = record.correction_specific === "" ? null : record.correction_specific;
                const correction_time_specificValue = record.correction_time_specific === "" ? null : record.correction_time_specific;
                const topic_specificValue = record.topic_specific === "" ? null : record.topic_specific;
                return [
                  record.orden, record.enable, record.id_device,
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
                  });
                } else {
                  con.commit((err) => {
                    if (err) {
                      console.error("Error al confirmar la transacción:", err);
                      con.rollback(() => {
                        res.status(500).json({ error: 'Error en la base de datos' });
                      });
                    } else {
                      //res.send(result);
                    }
                  });
                }
              });
            }
          });
        } else {
          con.commit((err) => {
            if (err) {
              console.error("Error al confirmar la transacción:", err);
              con.rollback(() => {
                res.status(500).json({ error: 'Error en la base de datos' });
              });
            } else {
              //res.send({ message: 'No se insertaron nuevos registros.' });
            }
          });
        }
      }
    });
  //});
  }

  router.put("", (req,res)=>{  /*/ UPDATE  /*/
  //console.log(req.body)
    const {
      uid, alias, origin, description_origin, application_id, topic_name, typemeter, lat, lon, cota, timezone, enable, organizationid, updatedAt,id_data_estructure,variable_configuration, id: id7,
    } = req.body;
    auxPost(req.body.sensors)

    if (!uid || !topic_name) {
      return res.status(400).json({ error: 'Los campos uid y topic_name son requeridos.' });
    }
    const query = `UPDATE device_configurations SET uid = ?, alias = ?, origin = ?, description_origin = ?, application_id = ?, topic_name = ?, typemeter = ?, lat = ?, lon = ?, cota = ?, timezone = ?, enable = ?, organizationid = ?, updatedAt = ?, id_data_estructure = ?, variable_configuration = ? WHERE id = ?`;
    con.query(
      query,
      [
        uid, alias, origin, description_origin, application_id, topic_name, typemeter, lat, lon, cota, timezone, enable, organizationid, updatedAt, id_data_estructure ,variable_configuration, id7
      ],
      (err, result) => {
        if (err) {
          console.error("Error:", err);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.send(result);
      }
    );
  });

  router.delete("", (req, res) => {  /*/ DELETE  /*/
    const id = req.body.id;
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID no válido' });
    }

    con.beginTransaction(function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      con.query("DELETE FROM device_configurations WHERE id = ?", id, function (err, result) {
        if (err) {
          con.rollback(function () {
            return res.status(500).json({ error: 'Error en la base de datos' });
          });
        }
        if (result.affectedRows === 0) {
          con.rollback(function () {
            return res.status(404).json({ error: 'Configuración de dispositivo no encontrada' });
          });
        }
        
        con.query("DELETE FROM sensors_devices WHERE id_device = ?", id, function (err, result) {
          if (err) {
            con.rollback(function () {
              return res.status(500).json({ error: 'Error en la base de datos' });
            });
          }
          con.commit(function (err) {
            if (err) {
              con.rollback(function () {
                return res.status(500).json({ error: 'Error en la base de datos' });
              });
            }
            res.json({ message: 'Configuración de dispositivo eliminada con éxito' });
          });
        });
      });
    });
  });

module.exports = router;
