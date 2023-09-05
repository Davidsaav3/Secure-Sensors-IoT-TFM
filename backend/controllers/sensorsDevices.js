const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())

  /* SENSORS_DEVICES /////////////////////////////////////////////////////*/
  router.get("/id/:id/:type", (req,res)=>{  /*/ ID  /*/
    let id_device= parseInt(req.params.id);
    const query = `SELECT orden, enable, id_device, id_type_sensor, id, datafield, nodata, 
    (SELECT type FROM sensors_types as t WHERE s.id_type_sensor= t.id) As type_name,correction_specific,correction_time_specific 
    FROM sensors_devices as s WHERE id_device= '${id_device}' order by orden`;
    con.query(query, (err, result) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.send(result);
    });
  });

  router.post("/post/", (req, res) => {  /*/ POST  /*/
    const {
      orden, enable, id_device,id_type_sensor,datafield, correction_specific, correction_time_specific, nodata,
    } = req.body;
    const nodataValue = nodata ? 1 : 0;
    const query = `
      INSERT INTO sensors_devices (orden, enable, id_device, id_type_sensor, datafield, nodata, correction_specific, correction_time_specific)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    con.query(query, [orden, enable, id_device, id_type_sensor, datafield, nodataValue, correction_specific,correction_time_specific, ],
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