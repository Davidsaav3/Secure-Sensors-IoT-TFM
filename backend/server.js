let express= require('express');
let cors= require('cors')
let { con }= require('./middleware/mysql');
let app= express();
app.use(cors());
app.use(express.json())

con.connect(function(err) {


  /* device_configurations /////////////////////////////////////////////////*/
  app.get("/api/max/device_configurations", (req,res)=>{ /*/ MAX /*/
    con.query("SELECT id FROM device_configurations WHERE id=(SELECT max(id) FROM device_configurations)", function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });
  
  app.get("/api/get/device_configurations/:state/:search_text/:order_by/:ord_asc/:array_sensors/:sensors_act/:devices_act/:pag_tam/:pag_pag/:pos_x_1/:pos_x_2/:pos_y_1/:pos_y_2", (req,res)=>{  /*/ GET  /*/
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
    if(sensors_act==0){
      consulta= array.join(" OR id IN ")
    }
    if(sensors_act==1){
      consulta= array.join(" AND id IN ")
    }
    if(sensors_act==2){
      consulta= array.join(" AND id IN ")
    }

    let xx1= parseInt(x1);
    let xx2= parseInt(x2);
    let yy1= parseInt(y1);
    let yy2= parseInt(y2);

      if(search_text=='Buscar'){
        if(array_sensors!=-1 || devices_act!=2){
          if(array_sensors!=-1 && devices_act!=2 && array_sensors!=-2){
            if(state=='0'){
              console.log("ZONA 1 LIST")
              con.query(`SELECT * FROM device_configurations where id IN ${consulta} AND enable=${devices_act} order by ${order_by} ${ord_asc} LIMIT ${tam} OFFSET ${act}`, function (err, result) {
                if (err) throw err;
                  res.send(result)
              }); 
            }
            else{
              console.log("ZONA 1 MAP")
              console.log(`SELECT * FROM device_configurations where id IN ${consulta} AND enable=${devices_act} AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`)
              con.query(`SELECT * FROM device_configurations where id IN ${consulta} AND enable=${devices_act} AND lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`, function (err, result) {
                if (err) throw err;
                  res.send(result)
              }); 
            }
          }
          else{
              if(array_sensors!=-1 && array_sensors!=-2){
                console.log("ZONA 2")
                con.query(`SELECT * FROM device_configurations where id IN ${consulta} order by ${order_by} ${ord_asc} LIMIT ${tam} OFFSET ${act}`, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                    res.send(result)
                }); 
              }
              if(array_sensors==-2){
                console.log("ZONA 3")
                con.query(`SELECT * FROM device_configurations where id NOT IN (SELECT id_device FROM sensors_devices) order by ${order_by} ${ord_asc} LIMIT ${tam} OFFSET ${act}`, function (err, result) { /////////////////////////////////////////////////////////
                  if (err) throw err;
                    res.send(result)
                }); 
              }
            if(devices_act!=2){
              console.log("ZONA 4")
              con.query(`SELECT * FROM device_configurations where enable=${devices_act} order by ${order_by} ${ord_asc} LIMIT ${tam} OFFSET ${act}`, function (err, result) {
                if (err) throw err;
                  res.send(result)
              }); 
            }
          }
        
        }
        else{
          if(state=='0'){
            console.log("ZONA 5 LIST")
            con.query(`SELECT * FROM device_configurations order by ${order_by} ${ord_asc} LIMIT ${tam} OFFSET ${act}`, function (err, result) {
              if (err) throw err;
                res.send(result)
            }); 
          }
          else{
            console.log(`SELECT * FROM device_configurations where lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`)
            con.query(`SELECT * FROM device_configurations where lon BETWEEN ${xx1} AND ${xx2} AND lat BETWEEN ${yy1} AND ${yy2}`, function (err, result) {
              if (err) throw err;
                res.send(result)
            }); 
          }
        }
      }
      else{
        console.log("ZONA 6")
          con.query(`SELECT * FROM device_configurations WHERE uid LIKE '%${search_text}%' OR alias LIKE '%${search_text}%' OR origin LIKE '%${search_text}%' OR description_origin LIKE '%${search_text}%' OR application_id LIKE '%${search_text}%' OR topic_name LIKE '%${search_text}%' OR typemeter LIKE '%${search_text}%' OR lat LIKE '%${search_text}%' OR lon LIKE '%${search_text}%' OR cota LIKE '%${search_text}%' OR timezone LIKE '%${search_text}%' OR enable LIKE '%${search_text}%' OR organizationid LIKE '%${search_text}%' LIMIT ${tam} OFFSET ${act};`, function (err, result) {
          if (err) throw err;
            res.send(result)
        }); 
      }
    
  });

  app.get("/api/id/device_configurations/:id", (req,res)=>{ /*/ ID  /*/
  let id= parseInt(req.params.id);
    con.query("SELECT * FROM device_configurations WHERE id= ?", id, function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  app.post("/api/enable/device_configurations", (req,res)=>{  /*/ ENABLE  /*/
    let id= req.body.id;
    let enable= req.body.enable;
    con.query("UPDATE device_configurations SET enable= ? WHERE id= ?",[id,enable], function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  app.post("/api/post/device_configurations", (req,res)=>{  /*/ PUT  /*/
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
    con.query("INSERT INTO device_configurations (uid,alias,origin,description_origin,application_id,topic_name,typemeter,lat,lon,cota,timezone,enable,organizationid,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[uid,alias,origin,description_origin,application_id,topic_name,typemeter,lat,lon,cota,timezone,enable,organizationid,createdAt,updatedAt], function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  app.post("/api/update/device_configurations/", (req,res)=>{  /*/ UPDATE  /*/
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
    con.query("UPDATE device_configurations SET uid=?,alias=?,origin=?,description_origin=?,application_id=?,topic_name=?,typemeter=?,lat=?,lon=?,cota=?,timezone=?,enable=?,organizationid=?, updatedAt=? WHERE id= ?",[uid,alias,origin,description_origin,application_id,topic_name,typemeter,lat,lon,cota,timezone,enable,organizationid,updatedAt,id7], function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  app.post("/api/delete/device_configurations", (req,res)=>{  /*/ DELETE  /*/
    let id09= req.body.id;
    con.query("DELETE FROM device_configurations WHERE id= ?", id09, function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });


  /* SENSORS_DEVICES /////////////////////////////////////////////////////*/
  if (err) throw err;
  app.get("/api/get/sensors_devices", (req,res)=>{  /*/ GET  /*/
    con.query("SELECT * FROM sensors_devices", function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  app.get("/api/id/sensors_devices/:id", (req,res)=>{  /*/ ID  /*/
    let id= parseInt(req.params.id);
    con.query("SELECT * FROM sensors_devices WHERE id= ?", id, function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  app.get("/api/id_device/sensors_devices/:id/:type", (req,res)=>{  /*/ GET ID_DEVICES  /*/
    let id_device= parseInt(req.params.id);
    con.query(`SELECT orden, enable, id_device, id_type_sensor, id, datafield, nodata, (SELECT type FROM sensors_types as t WHERE s.id_type_sensor= t.id) As type_name FROM sensors_devices as s WHERE id_device= '${id_device}' order by orden`, function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  app.post("/api/post/sensors_devices", (req,res)=>{  /*/ PUT  /*/
    let orden= req.body.orden;
    let enable= req.body.enable;
    let id_device= req.body.id_device;
    let id_type_sensor= req.body.id_type_sensor;
    let datafield= req.body.datafield;
    let correction_specific= req.body.correction_specific;
    let correction_time_specific= req.body.correction_time_specific;
    let nodata= req.body.nodata;
    console.log("cosas 1: "+correction_specific)
    console.log("cosas 2: "+correction_time_specific)

    if(nodata==true){
      nodata= 1;
    }
    else{
      nodata= 0; 
    }
    con.query("INSERT INTO sensors_devices (orden, enable,id_device,id_type_sensor,datafield,nodata,correction_specific,correction_time_specific) VALUES (?,?,?,?,?,?,?,?)",[orden,enable,id_device,id_type_sensor,datafield,nodata,correction_specific,correction_time_specific], function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  app.get("/api/duplicate/sensors_devices/:id1/:id2", (req,res)=>{  /*/ DUPLICATE  /*/
    let id1= parseInt(req.params.id1);
    let id2= parseInt(req.params.id2);
    con.query("INSERT INTO sensors_devices (orden, enable, id_device, id_type_sensor, datafield, nodata,correction_specific,correction_time_specific) SELECT orden, enable, ?, id_type_sensor, datafield, nodata,correction_specific,correction_time_specific FROM sensors_devices WHERE id_device= ?",[id2,id1], function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  app.post("/api/delete_all/sensors_devices", (req,res)=>{  /*/ DELETE ALL /*/
    let id= req.body.id;
    con.query("DELETE FROM sensors_devices WHERE id_device= ?", id, function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  app.post("/api/delete/sensors_devices", (req,res)=>{  /*/ DELETE  /*/
  let id= req.body.id;
    con.query("DELETE FROM sensors_devices WHERE id= ?", id, function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });


  /* SENSORS_TYPES //////////////////////////////////////////*/
  app.get("/api/get/sensors_types/:type/:type1/:type2", (req,res)=>{  /*/ GET  /*/
  let type0= req.params.type;
  let type1= req.params.type1;
  let type2= req.params.type2;
  if(type0=='Buscar'){
    con.query(`SELECT * FROM sensors_types order by ${type1} ${type2}`,function (err, result) {
      if (err) throw err;
        res.send(result)
    }); 
  }
  else{
      con.query(`SELECT * FROM sensors_types WHERE type LIKE '%${type0}%' OR metric LIKE '%${type0}%' OR description LIKE '%${type0}%' OR errorvalue LIKE '%${type0}%' OR valuemax LIKE '%${type0}%' OR valuemin LIKE '%${type0}%' order by ${type1} ${type2}`, function (err, result) {
      if (err) throw err;
        res.send(result)
    }); 
  }
  });
  
  app.get("/api/id/sensors_types/:id", (req,res)=>{  /*/ ID  /*/
    let id= parseInt(req.params.id);
    con.query("SELECT * FROM sensors_types WHERE id= ?", id, function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  app.get("/api/max/sensors_types", (req,res)=>{ /*/ MAX  /*/
    con.query("SELECT id FROM sensors_types WHERE id=(SELECT max(id) FROM sensors_types)", function (err, result) {
      if (err) throw err;
        res.send(result) 
    });
  });
  
  app.post("/api/post/sensors_types", (req,res)=>{  /*/ PUT  /*/
  if(!req.body.type){return res.status(400).json({ error: 'El campo type es requerido.' });}else{type= req.body.type;}
  if(!req.body.metric){return res.status(400).json({ error: 'El campo metric es requerido.' });}else{metric= req.body.metric;}
    let description= req.body.description;
    let errorvalue= req.body.errorvalue;
    let valuemax= req.body.valuemax;
    let valuemin= req.body.valuemin;
    let position= req.body.position;
    let correction_general= req.body.correction_general;
    let correction_time_general= req.body.correction_time_general;
    con.query("INSERT INTO sensors_types (type,metric,description,errorvalue,valuemax,valuemin,position,correction_general,correction_time_general) VALUES (?,?,?,?,?,?,?,?,?)",[type, metric, description,errorvalue,valuemax,valuemin,position,correction_general,correction_time_general], function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });
  
  app.post("/api/update/sensors_types/", (req,res)=>{  /*/ UPDATE  /*/
    if(!req.body.type){return res.status(400).json({ error: 'El campo type es requerido.' });}else{type= req.body.type;}
    if(!req.body.metric){return res.status(400).json({ error: 'El campo metric es requerido.' });}else{metric= req.body.metric;}
    description= req.body.description;
    errorvalue= req.body.errorvalue;
    valuemax= req.body.valuemax;
    valuemin= req.body.valuemin;
    id= req.body.id;
    position= req.body.position;
    correction_general= req.body.correction_general;
    correction_time_general= req.body.correction_time_general;
    con.query("UPDATE sensors_types SET position=?, type=?,metric=?,description=?,errorvalue=?,valuemax=?,valuemin=?,correction_general=?,correction_time_general=? WHERE id= ?",[position,type, metric, description,errorvalue,valuemax,valuemin,correction_general,correction_time_general,id], function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  app.post("/api/delete/sensors_types", (req,res)=>{  /*/ DELETE  /*/
    let id= req.body.id;
    con.query("DELETE FROM sensors_types WHERE id= ?", id, function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  
  /* ESTRUCTURE //////////////////////////////////////////*/
  app.get("/api/get/data_estructure/:type/:type1/:type2", (req,res)=>{  /*/ GET  /*/
  let type0= req.params.type;
  let type1= req.params.type1;
  let type2= req.params.type2;
  if(type0=='Buscar'){
    con.query(`SELECT * FROM data_estructure order by ${type1} ${type2}`,function (err, result) {
      if (err) throw err;
        res.send(result)
    }); 
  }
  else{
      con.query(`SELECT * FROM data_estructure WHERE description LIKE '%${type0}%' OR configuration LIKE '%${type0}%' order by ${type1} ${type2}`, function (err, result) {
      if (err) throw err;
        res.send(result)
    }); 
  }
  });
  
  app.get("/api/id/data_estructure/:id_estructure", (req,res)=>{  /*/ ID  /*/
    let id_estructure= parseInt(req.params.id_estructure);
    con.query("SELECT * FROM data_estructure WHERE id_estructure= ?", id_estructure, function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  app.get("/api/max/data_estructure", (req,res)=>{ /*/ MAX  /*/
    con.query("SELECT id_estructure FROM data_estructure WHERE id_estructure=(SELECT max(id_estructure) FROM data_estructure)", function (err, result) {
      if (err) throw err;
        res.send(result) 
    });
  });
  
  app.post("/api/post/data_estructure", (req,res)=>{  /*/ PUT  /*/
    let description= req.body.description;
    let configuration= req.body.configuration;
    con.query("INSERT INTO data_estructure (description,configuration) VALUES (?,?)",[description, configuration], function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });
  
  app.post("/api/update/data_estructure/", (req,res)=>{  /*/ UPDATE  /*/
  let id_estructure= parseInt(req.body.id_estructure);
  let description= req.body.description;
  let configuration= req.body.configuration;
    con.query("UPDATE data_estructure SET description=?, configuration=? WHERE id_estructure= ?",[description,configuration,id_estructure], function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  app.post("/api/delete/data_estructure", (req,res)=>{  /*/ DELETE  /*/
  let id_estructure= parseInt(req.body.id_estructure);
    con.query("DELETE FROM data_estructure WHERE id_estructure= ?", id_estructure, function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

});

app.listen(5172, ()=>{
  console.log(`Sirviendo: http://localhost:5172/api/`)
})