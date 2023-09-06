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

  router.post("/post", (req, res) => {  /*/ POST Y DELETE  /*/
    const newRecords = req.body.sensors;
    const deleteIdDevice = req.body.sensors;
  
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
                res.send({ message: 'Registros eliminados exitosamente.' });
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
                return [
                  record.orden, record.enable, record.id_device,
                  record.id_type_sensor, record.datafield, nodataValue,
                  record.correction_specific, record.correction_time_specific,
                ];
              });
    
              con.query(`
                INSERT INTO sensors_devices (orden, enable, id_device, id_type_sensor, datafield, nodata, correction_specific, correction_time_specific)
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
                      res.send(result);
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
              res.send({ message: 'No se insertaron nuevos registros.' });
            }
          });
        }
      }
    });
  });

module.exports = router;