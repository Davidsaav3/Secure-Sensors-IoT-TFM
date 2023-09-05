const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())

  /* SENSORS_DEVICES /////////////////////////////////////////////////////*/
  router.get("/get/", (req,res)=>{  /*/ GET  /*/
    con.query("SELECT * FROM sensors_devices", function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  router.get("/id/:id/:type", (req,res)=>{  /*/ ID  /*/
    let id_device= parseInt(req.params.id);
    con.query(`SELECT orden, enable, id_device, id_type_sensor, id, datafield, nodata, (SELECT type FROM sensors_types as t WHERE s.id_type_sensor= t.id) As type_name,correction_specific,correction_time_specific FROM sensors_devices as s WHERE id_device= '${id_device}' order by orden`, function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  router.post("/post/", (req,res)=>{  /*/ POST  /*/
    let orden= req.body.orden;
    let enable= req.body.enable;
    let id_device= req.body.id_device;
    let id_type_sensor= req.body.id_type_sensor;
    let datafield= req.body.datafield;
    let correction_specific= req.body.correction_specific;
    let correction_time_specific= req.body.correction_time_specific;
    let nodata= req.body.nodata;
    //console.log("cosas 1: "+correction_specific)
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

  router.delete("/delete", (req, res) => {  /*/ DELETE  /*/
    const id = req.body.id;
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID no válido' });
    }
    con.query("DELETE FROM sensors_devices WHERE id_device = ?", id, function (err, result) {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Dispositivo no encontrado' });
      }
      res.json({ message: 'Dispositivo eliminado con éxito' });
    });
  });

module.exports = router;