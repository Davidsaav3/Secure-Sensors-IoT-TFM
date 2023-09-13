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
        array.push(`(SELECT id_device FROM sensors_devices Where id_type_sensor=${array2[i]} AND enable=0)`);
      }
      if(sensors_act==1){
        array.push(`(SELECT id_device FROM sensors_devices Where id_type_sensor=${array2[i]} AND enable=1)`);
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
        consulta= array.join(" OR id IN ")
      }
      if(sensors_act==1){
        consulta= array.join(" AND id IN ")
      }
      if(sensors_act==2){
        consulta= array.join(" AND id IN ")
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
            variable+= ` SELECT *,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure,`
            if(devices_act!=2 && array_sensors==-1){
              console.log("LISTA ACT")
              variable+= ` (SELECT COUNT(*) AS total FROM device_configurations WHERE enable=${devices_act}) as total FROM device_configurations WHERE enable=${devices_act} order by ${order_by} ${ord_asc} LIMIT ${tam} OFFSET ${act}`
              con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                if (err) throw err;
                  res.send(result)
              }); 
            }
            //
            else{
              if(array_sensors!=-1 && array_sensors!=-2){
                console.log("LISTA FILTRO TODOS Y ACT")
                if(devices_act!=2){
                  variable+= ` (SELECT COUNT(*) AS total FROM device_configurations where id IN ${consulta} AND enable=${devices_act}) as total FROM device_configurations `
                }
                else{
                  variable+= ` (SELECT COUNT(*) AS total FROM device_configurations where id IN ${consulta}) as total FROM device_configurations `
                }
                //
                variable+= ` where id IN ${consulta}`
                if(devices_act!=2){
                  variable+= ` AND enable=${devices_act}`
                }
                variable+= ` order by ${order_by} ${ord_asc} LIMIT ${tam} OFFSET ${act}`
                con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                    res.send(result)
                }); 
              }
              if(array_sensors==-2){
                console.log("LISTA FILTRO NINGUNO Y ACT")
                if(devices_act!=2){
                  variable+= ` (SELECT COUNT(*) AS total FROM device_configurations where id NOT IN (SELECT id_device FROM sensors_devices) AND enable=${devices_act}) as total FROM device_configurations `
                }
                else{
                  variable+= ` (SELECT COUNT(*) AS total FROM device_configurations where id NOT IN (SELECT id_device FROM sensors_devices) ) as total FROM device_configurations `
                }
                //
                variable+= ` where id NOT IN (SELECT id_device FROM sensors_devices)`
                if(devices_act!=2){
                  variable+= ` AND enable=${devices_act}`
                }
                variable+= ` order by ${order_by} ${ord_asc} LIMIT ${tam} OFFSET ${act}`
                console.log(variable)
                con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                    res.send(result)
                }); 
              }
            }
          }
          else{
            var variable= '';
            variable+= " SELECT *,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure,(SELECT COUNT(*) AS total FROM device_configurations) as total FROM device_configurations"
            if(devices_act!=2 && array_sensors==-1){
              console.log("MAPA ACT")
              variable+= ` WHERE enable=${devices_act} AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`
              con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                if (err) throw err;
                  res.send(result)
              }); 
            }
            //
            else{
              if(array_sensors!=-1 && array_sensors!=-2){
                console.log("MAPA FILTRO TODOS Y ACT")
                variable+= ` where id IN ${consulta}`
                if(devices_act!=2){
                  variable+= ` AND enable=${devices_act}`
                }
                variable+= ` AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`
                con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                    res.send(result)
                }); 
              }
              if(array_sensors==-2){
                console.log("MAPA FILTRO NINGUNO Y ACT")
                variable+= ` where id NOT IN (SELECT id_device FROM sensors_devices)`
                if(devices_act!=2){
                  variable+= ` AND enable=${devices_act}`
                }
                variable+= ` AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`
                console.log(variable)
                con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                    res.send(result)
                }); 
              }
            }
          }
        }
        else{
          if(state=='0'){
            console.log("LISTA SIMPLE")
            con.query(` SELECT *,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure,(SELECT COUNT(*) AS total FROM device_configurations) as total FROM device_configurations order by ${order_by} ${ord_asc} LIMIT ${tam} OFFSET ${act}`, function (err, result) {
              if (err) throw err;
                res.send(result)
            }); 
          }
          else{
            console.log("MAPA SIMPLE")
            con.query(` SELECT *  FROM device_configurations where lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`, function (err, result) {
              if (err) throw err;
                res.send(result)
            }); 
          }
        }
      }
      else{
        if(state=='0'){
          console.log("LISTA BUSQUEDA POR TEXTO")
            con.query(` SELECT *,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure,(SELECT COUNT(*) AS total FROM device_configurations WHERE uid LIKE '%${search_text}%' OR alias LIKE '%${search_text}%' OR origin LIKE '%${search_text}%' OR description_origin LIKE '%${search_text}%' OR application_id LIKE '%${search_text}%' OR topic_name LIKE '%${search_text}%' OR typemeter LIKE '%${search_text}%' OR lat LIKE '%${search_text}%' OR lon LIKE '%${search_text}%' OR cota LIKE '%${search_text}%' OR timezone LIKE '%${search_text}%' OR enable LIKE '%${search_text}%' OR organizationid LIKE '%${search_text}%') as total FROM device_configurations WHERE uid LIKE '%${search_text}%' OR alias LIKE '%${search_text}%' OR origin LIKE '%${search_text}%' OR description_origin LIKE '%${search_text}%' OR application_id LIKE '%${search_text}%' OR topic_name LIKE '%${search_text}%' OR typemeter LIKE '%${search_text}%' OR lat LIKE '%${search_text}%' OR lon LIKE '%${search_text}%' OR cota LIKE '%${search_text}%' OR timezone LIKE '%${search_text}%' OR enable LIKE '%${search_text}%' OR organizationid LIKE '%${search_text}%' LIMIT ${tam} OFFSET ${act};`, function (err, result) {
            if (err) throw err;
              res.send(result)
          });
        }
        else{
          console.log("MAPA BUSQUEDA POR TEXTO")
            con.query(` SELECT * FROM device_configurations WHERE uid LIKE '%${search_text}%' OR alias LIKE '%${search_text}%' OR origin LIKE '%${search_text}%' OR description_origin LIKE '%${search_text}%' OR application_id LIKE '%${search_text}%' OR topic_name LIKE '%${search_text}%' OR typemeter LIKE '%${search_text}%' OR lat LIKE '%${search_text}%' OR lon LIKE '%${search_text}%' OR cota LIKE '%${search_text}%' OR timezone LIKE '%${search_text}%' OR enable LIKE '%${search_text}%' OR organizationid LIKE '%${search_text}%' AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`, function (err, result) {
            if (err) throw err;
              res.send(result)
          });
        }
      }
    
  });

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
      res.send(result);
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


  router.post("/post", (req, res) => {  /*/ POST  /*/
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

  router.put("/update/", (req,res)=>{  /*/ UPDATE  /*/
  console.log(req.body)
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

  router.delete("/delete", (req, res) => {  /*/ DELETE  /*/
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