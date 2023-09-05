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
        consulta= array.join(" OR d.id IN ")
      }
      if(sensors_act==1){
        consulta= array.join(" AND d.id IN ")
      }
      if(sensors_act==2){
        consulta= array.join(" AND d.id IN ")
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
            variable+= "SELECT  id, uid, topic_name, application_id, enable, id_data_estructure, updatedAt,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure FROM device_configurations"
            if(devices_act!=2 && array_sensors==-1){
              console.log("LISTA ACT")
              variable+= ` WHERE enable=${devices_act} order by ${order_by} ${ord_asc} LIMIT ${tam} OFFSET ${act}`
              con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                if (err) throw err;
                  res.send(result)
              }); 
            }
            //
            else{
              if(array_sensors!=-1 && array_sensors!=-2){
                console.log("LISTA FILTRO TODOS Y ACT")
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
            variable+= `SELECT d.id, d.uid, d.topic_name, d.application_id, d.enable, d.id_data_estructure,updatedAt, s.orden, s.enable as enable_sensor, (SELECT type FROM sensors_types as t WHERE s.id_type_sensor= t.id) As type_name,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure FROM device_configurations d INNER JOIN sensors_devices s ON d.id = s.id_device`
            if(devices_act!=2 && array_sensors==-1){
              console.log("MAPA ACT")
              variable+= ` WHERE d.enable=${devices_act} AND d.lon BETWEEN ${xx1} AND ${xx2} AND d.lat BETWEEN ${yy1} AND ${yy2}`
              con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                if (err) throw err;
                  res.send(result)
              }); 
            }
            //
            else{
              if(array_sensors!=-1 && array_sensors!=-2){
                console.log("MAPA FILTRO TODOS Y ACT")
                variable+= ` where d.id IN ${consulta}`
                if(devices_act!=2){
                  variable+= ` AND d.enable=${devices_act}`
                }
                variable+= ` AND d.lon BETWEEN ${xx1} AND ${xx2} AND d.lat BETWEEN ${yy1} AND ${yy2}`
                con.query(variable, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                    res.send(result)
                }); 
              }
              if(array_sensors==-2){
                console.log("MAPA FILTRO NINGUNO Y ACT")
                variable+= ` where s.id NOT IN (SELECT id_device FROM sensors_devices)`
                if(devices_act!=2){
                  variable+= ` AND d.enable=${devices_act}`
                }
                variable+= ` AND d.lon BETWEEN ${xx1} AND ${xx2} AND d.lat BETWEEN ${yy1} AND ${yy2}`
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
            con.query(`SELECT id, uid, topic_name, application_id, enable, id_data_estructure,updatedAt,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure FROM device_configurations order by ${order_by} ${ord_asc} LIMIT ${tam} OFFSET ${act}`, function (err, result) {
              if (err) throw err;
                res.send(result)
            }); 
          }
          else{
            console.log("MAPA SIMPLE")
            con.query(`SELECT d.id, d.uid, d.topic_name, d.application_id, d.enable, d.id_data_estructure,updatedAt, s.orden, s.enable as enable_sensor, (SELECT type FROM sensors_types as t WHERE s.id_type_sensor= t.id) As type_name,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure FROM device_configurations d INNER JOIN sensors_devices s ON d.id = s.id_device where lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`, function (err, result) {
              if (err) throw err;
                res.send(result)
            }); 
          }
        }
      }
      else{
        if(state=='0'){
          console.log("LISTA BUSQUEDA POR TEXTO")
            con.query(`SELECT id, uid, topic_name, application_id, enable, id_data_estructure,updatedAt,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure FROM device_configurations WHERE uid LIKE '%${search_text}%' OR alias LIKE '%${search_text}%' OR origin LIKE '%${search_text}%' OR description_origin LIKE '%${search_text}%' OR application_id LIKE '%${search_text}%' OR topic_name LIKE '%${search_text}%' OR typemeter LIKE '%${search_text}%' OR lat LIKE '%${search_text}%' OR lon LIKE '%${search_text}%' OR cota LIKE '%${search_text}%' OR timezone LIKE '%${search_text}%' OR enable LIKE '%${search_text}%' OR organizationid LIKE '%${search_text}%' LIMIT ${tam} OFFSET ${act};`, function (err, result) {
            if (err) throw err;
              res.send(result)
          });
        }
        else{
          console.log("MAPA BUSQUEDA POR TEXTO")
            con.query(`SELECT d.id, d.uid, d.topic_name, d.application_id, d.enable, d.id_data_estructure, d.updatedAt, s.ordene as enable_sensor, (SELECT type FROM sensors_types as t WHERE s.id_type_sensor= t.id) As type_name,(select description from data_estructure where id_estructure=id_data_estructure) as data_estructure FROM device_configurations d INNER JOIN sensors_devices s ON d.id = s.id_device WHERE uid LIKE '%${search_text}%' OR alias LIKE '%${search_text}%' OR origin LIKE '%${search_text}%' OR description_origin LIKE '%${search_text}%' OR application_id LIKE '%${search_text}%' OR topic_name LIKE '%${search_text}%' OR typemeter LIKE '%${search_text}%' OR lat LIKE '%${search_text}%' OR lon LIKE '%${search_text}%' OR cota LIKE '%${search_text}%' OR timezone LIKE '%${search_text}%' OR d.enable LIKE '%${search_text}%' OR organizationid LIKE '%${search_text}%' AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`, function (err, result) {
            if (err) throw err;
              res.send(result)
          });
        }
      }
    
  });

  router.get("/id/:id", (req,res)=>{ /*/ ID  /*/
  let id= parseInt(req.params.id);
    con.query("SELECT *, (SELECT description FROM data_estructure WHERE id_estructure= id_data_Estructure) As estructure_name FROM device_configurations WHERE id= ?", id, function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  /* device_configurations /////////////////////////////////////////////////*/
  router.get("/max/", (req,res)=>{ /*/ MAX /*/
    con.query("SELECT id FROM device_configurations WHERE id=(SELECT max(id) FROM device_configurations)", function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  router.post("/post", (req,res)=>{  /*/ PUT  /*/
    let uid='';
    if(!req.body.uid){return res.status(400).json({ error: 'El campo uid es requerido.' });}else{uid= req.body.uid;}
    let alias= req.body.alias;
    let origin= req.body.origin;
    let description_origin= req.body.description_origin;
    let application_id= req.body.application_id;
    let topic_name='';
    if(!req.body.topic_name){return res.status(400).json({ error: 'El campo topic_name es requerido.' });}else{topic_name= req.body.topic_name;}
    let typemeter= req.body.typemeter;
    let lat= req.body.lat;
    let lon= req.body.lon;
    let cota= req.body.cota;
    let timezone= req.body.timezone;
    let enable= req.body.enable;
    let organizationid= req.body.organizationid;
    let createdAt= req.body.createdAt;
    let updatedAt= req.body.updatedAt;
    let id_data_estructure= req.body.id_data_estructure;
    con.query("INSERT INTO device_configurations (uid,alias,origin,description_origin,application_id,topic_name,typemeter,lat,lon,cota,timezone,enable,organizationid,createdAt,updatedAt,id_data_estructure) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[uid,alias,origin,description_origin,application_id,topic_name,typemeter,lat,lon,cota,timezone,enable,organizationid,createdAt,updatedAt,id_data_estructure], function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  router.post("/update/", (req,res)=>{  /*/ UPDATE  /*/
    console.log(req.body)
    let uid='';
    if(!req.body.uid){return res.status(400).json({ error: 'El campo uid es requerido.' });}else{uid= req.body.uid;}
    let alias= req.body.alias;
    let origin= req.body.origin;
    let description_origin= req.body.description_origin;
    let application_id= req.body.application_id;
    let topic_name='';
    if(!req.body.topic_name){return res.status(400).json({ error: 'El campo topic_name es requerido.' });}else{topic_name= req.body.topic_name;}
    let typemeter= req.body.typemeter;
    let lat= req.body.lat;
    let lon= req.body.lon;
    let cota= req.body.cota;
    let timezone= req.body.timezone;
    let enable= req.body.enable;
    let organizationid= req.body.organizationid;
    let id7= req.body.id;
    let updatedAt= req.body.updatedAt;
    let id_data_estructure= req.body.id_data_estructure;
    con.query("UPDATE device_configurations SET uid=?,alias=?,origin=?,description_origin=?,application_id=?,topic_name=?,typemeter=?,lat=?,lon=?,cota=?,timezone=?,enable=?,organizationid=?, updatedAt=?, id_data_estructure=? WHERE id= ?",[uid,alias,origin,description_origin,application_id,topic_name,typemeter,lat,lon,cota,timezone,enable,organizationid,updatedAt,id_data_estructure,id7], function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  router.post("/delete", (req,res)=>{  /*/ DELETE  /*/
    let id09= req.body.id;
    con.query("DELETE FROM device_configurations WHERE id= ?", id09, function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

module.exports = router;