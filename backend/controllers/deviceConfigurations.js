const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())

  /* device_configurations /////////////////////////////////////////////////*/
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
        consulta= array.join(" OR device_configurations.id IN ")
      }
      if(sensors_act==1){
        consulta= array.join(" AND device_configurations.id IN ")
      }
      if(sensors_act==2){
        consulta= array.join(" AND device_configurations.id IN ")
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

    let xx1= parseInt(x1);
    let xx2= parseInt(x2);
    let yy1= parseInt(y1);
    let yy2= parseInt(y2);
    console.log("---")


      if(search_text=='Buscar'){ // BUSQUEDA POR TEXTO ?
        if(array_sensors!=-1 || devices_act!=2){ //TIENE FILTROS AVANZADOS ?
          if(state=='0'){
            var variable= '';
            variable+= ` SELECT device_configurations.*, sensors_types.id as sensor_id, sensors_types.type as type_name, sensors_devices.enable as sensor_enable,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure, `
            if(devices_act!=2 && array_sensors==-1){
              console.log("LISTA ACT")
              variable+= ` (SELECT COUNT(*) AS total FROM device_configurations WHERE device_configurations.enable=${devices_act}) as total FROM device_configurations 
              LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
              LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id
              WHERE device_configurations.enable=${devices_act} order by ${order_by} ${ord_asc} LIMIT ${tam} OFFSET ${act}`
              con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                if (err) throw err;
                const responseArray = processResults(result);
                res.json(responseArray);
              }); 
            }
            //
            else{
              if(array_sensors!=-1 && array_sensors!=-2){
                console.log("LISTA FILTRO TODOS Y ACT")
                if(devices_act!=2){
                  variable+= ` (SELECT COUNT(*) AS total FROM device_configurations where device_configurations.id IN ${consulta} AND enable=${devices_act}) as total FROM device_configurations 
                  LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
                  LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id`
                }
                else{
                  variable+= ` (SELECT COUNT(*) AS total FROM device_configurations where device_configurations.id IN ${consulta}) as total FROM device_configurations 
                  LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
                  LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id`
                }
                //
                variable+= ` where device_configurations.id IN ${consulta}`
                if(devices_act!=2){
                  variable+= ` AND device_configurations.enable=${devices_act}`
                }
                variable+= `
                order by ${order_by} ${ord_asc} LIMIT ${tam} OFFSET ${act}`
                con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                  const responseArray = processResults(result);
                  res.json(responseArray);
                }); 
              }
              if(array_sensors==-2){
                console.log("LISTA FILTRO NINGUNO Y ACT")
                if(devices_act!=2){
                  variable+= ` (SELECT COUNT(*) AS total FROM device_configurations where device_configurations.id NOT IN (SELECT id_device FROM sensors_devices) AND device_configurations.enable=${devices_act}) as total FROM device_configurations 
                  LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
                  LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id`
                }
                else{
                  variable+= ` (SELECT COUNT(*) AS total FROM device_configurations where device_configurations.id NOT IN (SELECT id_device FROM sensors_devices) ) as total FROM device_configurations 
                  LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
                  LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id`
                }
                //
                variable+= ` where device_configurations.id NOT IN (SELECT id_device FROM sensors_devices)`
                if(devices_act!=2){
                  variable+= ` AND device_configurations.enable=${devices_act}`
                }
                variable+= `
                order by ${order_by} ${ord_asc} LIMIT ${tam} OFFSET ${act}`
                //console.log(variable)
                con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                  const responseArray = processResults(result);
                  res.json(responseArray);
                }); 
              }
            }
          }
          else{
            var variable= '';
            variable+= ` SELECT device_configurations.*, sensors_types.id as sensor_id, sensors_types.type as type_name, sensors_devices.enable as sensor_enable,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure, `
            if(devices_act!=2 && array_sensors==-1){
              console.log("MAPA ACT")
              variable+= `LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
              LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id 
              WHERE device_configurations.enable=${devices_act} AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`
              con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                if (err) throw err;
                const responseArray = processResults(result);
                res.json(responseArray);
              }); 
            }
            //
            else{
              if(array_sensors!=-1 && array_sensors!=-2){
                console.log("MAPA FILTRO TODOS Y ACT")
                variable+= ` where device_configurations.id IN ${consulta}`
                if(devices_act!=2){
                  variable+= ` AND device_configurations.enable=${devices_act}`
                }
                variable+= ` AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`
                con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                  const responseArray = processResults(result);
                  res.json(responseArray);
                }); 
              }
              if(array_sensors==-2){
                console.log("MAPA FILTRO NINGUNO Y ACT")
                variable+= ` where device_configurations.id NOT IN (SELECT id_device FROM sensors_devices)`
                if(devices_act!=2){
                  variable+= ` AND device_configurations.enable=${devices_act}`
                }
                variable+= ` AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`
                //console.log(variable)
                con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                  const responseArray = processResults(result);
                  res.json(responseArray);
                }); 
              }
            }
          }
        }
        else{
          if(state=='0'){
            console.log("LISTA SIMPLE")
            con.query(` SELECT device_configurations.*, sensors_types.id as sensor_id, sensors_types.type as type_name, sensors_devices.enable as sensor_enable,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure,(SELECT COUNT(*) AS total FROM device_configurations) as total
            FROM device_configurations
            LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
            LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id
            order by ${order_by} ${ord_asc} LIMIT ${tam} OFFSET ${act}`, function (err, result) {
              const responseArray = processResults(result);
              res.json(responseArray);
            }); 
          }
          else{
            console.log("MAPA SIMPLE")
            con.query(` SELECT device_configurations.*, sensors_types.id as sensor_id, sensors_types.type as type_name, sensors_devices.enable as sensor_enable,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure             FROM device_configurations
            LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
            LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id 
            WHERE lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`, function (err, result) {
              const responseArray = processResults(result);
              res.json(responseArray);
            }); 
          }
        }
      }
      else{
        if(state=='0'){
          console.log("LISTA BUSQUEDA POR TEXTO")
            con.query(` SELECT device_configurations.*, sensors_types.id as sensor_id, sensors_types.type as type_name, sensors_devices.enable as sensor_enable,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure,(SELECT COUNT(*) AS total FROM device_configurations WHERE uid LIKE '%${search_text}%' OR alias LIKE '%${search_text}%' OR origin LIKE '%${search_text}%' OR description_origin LIKE '%${search_text}%' OR application_id LIKE '%${search_text}%' OR topic_name LIKE '%${search_text}%' OR typemeter LIKE '%${search_text}%' OR lat LIKE '%${search_text}%' OR lon LIKE '%${search_text}%' OR cota LIKE '%${search_text}%' OR timezone LIKE '%${search_text}%' OR device_configurations.enable LIKE '%${search_text}%' OR organizationid LIKE '%${search_text}%') as total FROM device_configurations 
            LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
            LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id 
            WHERE uid LIKE '%${search_text}%' OR alias LIKE '%${search_text}%' OR origin LIKE '%${search_text}%' OR description_origin LIKE '%${search_text}%' OR application_id LIKE '%${search_text}%' OR topic_name LIKE '%${search_text}%' OR typemeter LIKE '%${search_text}%' OR lat LIKE '%${search_text}%' OR lon LIKE '%${search_text}%' OR cota LIKE '%${search_text}%' OR timezone LIKE '%${search_text}%' OR device_configurations.enable LIKE '%${search_text}%' OR organizationid LIKE '%${search_text}%' LIMIT ${tam} OFFSET ${act};`, function (err, result) {
            if (err) throw err;
            const responseArray = processResults(result);
            res.json(responseArray);    
          });
        }
        else{
          console.log("MAPA BUSQUEDA POR TEXTO")
            con.query(` SELECT device_configurations.*, sensors_types.id as sensor_id, sensors_types.type as type_name, sensors_devices.enable as sensor_enable,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure 
            FROM device_configurations
            LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
            LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id  
            WHERE uid LIKE '%${search_text}%' OR alias LIKE '%${search_text}%' OR origin LIKE '%${search_text}%' OR description_origin LIKE '%${search_text}%' OR application_id LIKE '%${search_text}%' OR topic_name LIKE '%${search_text}%' OR typemeter LIKE '%${search_text}%' OR lat LIKE '%${search_text}%' OR lon LIKE '%${search_text}%' OR cota LIKE '%${search_text}%' OR timezone LIKE '%${search_text}%' OR device_configurations.enable LIKE '%${search_text}%' OR organizationid LIKE '%${search_text}%' AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`, function (err, result) {
            if (err) throw err;
            const responseArray = processResults(result);
            res.json(responseArray);
          });
        }
      }
    
  });

  function processResults(result) { //Aux de get
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
    const query = `
      SELECT dc.*, de.description AS structure_name
      FROM device_configurations dc
      INNER JOIN data_estructure de ON dc.id_data_estructure = de.id_estructure
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
            //sensors: [],
          };
        }
    
        if (row.sensor_id) {
          devicesWithSensors[deviceId].sensors.push({
            type_name: row.type_name,
            enable: row.sensor_enable,
          });
        }
      });
      const responseArray = Object.values(devicesWithSensors);
      res.json(responseArray);
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


  router.post("", (req, res) => {  /*/ POST  /*/
    const { 
      uid, alias, origin, description_origin, application_id, topic_name, typemeter, lat, lon, cota, timezone, enable, organizationid, createdAt, updatedAt, id_data_estructure, variable_configuration
    } = req.body;
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

  router.put("", (req,res)=>{  /*/ UPDATE  /*/
  //console.log(req.body)
    const {
      uid, alias, origin, description_origin, application_id, topic_name, typemeter, lat, lon, cota, timezone, enable, organizationid, updatedAt,id_data_estructure,variable_configuration, id: id7,
    } = req.body;
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

 /*router.get('/gets', (req, res) => {
    const query = `
    SELECT device_configurations.*, sensors_types.id as sensor_id, sensors_types.type as type_name, sensors_devices.enable as sensor_enable,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure,(SELECT COUNT(*) AS total FROM device_configurations) as total
    FROM device_configurations
    LEFT JOIN sensors_devices ON device_configurations.id = sensors_devices.id_device 
    LEFT JOIN sensors_types ON sensors_devices.id_type_sensor = sensors_types.id 
    WHERE lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}
    `;
  
    con.query(query, (err, results) => {
      // Organiza los resultados en un formato deseado
    const devicesWithSensors = {};

    results.forEach((row) => {
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

    const responseArray = Object.values(devicesWithSensors);
    //console.log(devicesWithSensors)
    res.json(responseArray);
  });
  });*/