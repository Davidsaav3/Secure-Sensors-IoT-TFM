const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())
const verifyToken = require('./token');
const insertLog = require('./log');

  router.get("/get/:type/:type1/:type2/:pag_tam/:pag_pag", verifyToken, (req, res) => {
    
    const type0 = req.params.type;
    const type1 = req.params.type1;
    const type2 = req.params.type2;
    const tam = parseInt(req.params.pag_pag);
    const act = (parseInt(req.params.pag_tam) - 1) * parseInt(req.params.pag_pag);
    let query;
    let values;

    if (type0 == 'search') {
      query = `SELECT id, type, metric, description, position, correction_general, correction_time_general,(SELECT COUNT(*) AS total FROM sensors_types) as total FROM sensors_types ORDER BY ${type1} ${type2} LIMIT ? OFFSET ?`;
    } 
    else {
      query = `SELECT id, type, metric, description, position, correction_general, correction_time_general,discard_value,(SELECT COUNT(*) AS total FROM sensors_types WHERE type LIKE '%${type0}%' OR metric LIKE '%${type0}%' OR description LIKE '%${type0}%' OR errorvalue LIKE '%${type0}%' OR valuemax LIKE '%${type0}%' OR valuemin LIKE '%${type0}%') as total FROM sensors_types
        WHERE type LIKE '%${type0}%' OR metric LIKE '%${type0}%' OR description LIKE '%${type0}%' OR errorvalue LIKE '%${type0}%' OR valuemax LIKE '%${type0}%' OR valuemin LIKE '%${type0}%'
        ORDER BY ${type1} ${type2} LIMIT ? OFFSET ?`;
    }
    values = [tam, act];
    con.query(query, values, (err, result) => {
      if (err) {
        console.error("Error:", err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '002-001-500-001', "500", "GET", JSON.stringify(req.params),'Error al obtener los tipos de sensores', JSON.stringify(err));
        return res.status(500).json({ error: 'Error al obtener los tipos de sensores' });
      }
      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '002-001-200-001', "200", "GET", JSON.stringify(req.params), 'Tipos de sensores recuperados', JSON.stringify(result));
      res.send(result);
    });
  });

  router.get("/GET", verifyToken, (req, res) => {  /*/ GET LIST /*/
    
    let query = `SELECT id, type, position FROM sensors_types ORDER BY type ASC`;
    con.query(query, (err, result) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '002-002-500-001', "500", "GET", "",'Error al obtener la lista de tipos de sensores ', JSON.stringify(err));
        console.error(err);
      }
      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '002-002-200-001', "200", "GET", "",'Lista de tipos de sensores recuperada', JSON.stringify(result));
      res.send(result);
    });
  });

  router.get("/duplicate/:type", verifyToken, (req, res) => {  /*/ DUPLICATE  /*/
    
    const type = req.params.type;
    let query = `SELECT type FROM sensors_types`;
    con.query(query, (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '002-003-500-001', "500", "GET", JSON.stringify(req.params),'Error al duplicar el tipo de sensor', JSON.stringify(err));
        return res.status(500).send("Error al duplicar el tipo de sensor");
      }

      let contador = 1;
      let nombresExistentes = new Set();
      for (let index = 0; index < result.length; index++) {
        nombresExistentes.add(result[index].type);
      }
      let type_2 = type;
      while (nombresExistentes.has(type_2)) {
        type_2 = `${type}_${contador}`;
        contador++;
      }

      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '002-003-200-001', "200", "GET", JSON.stringify(req.params),'Tipo de sensor duplicado', "");
      res.json({ duplicatedSensor: type_2 });
    });
  });
  
  router.get("/id/:id", verifyToken, (req, res) => {  /*/ ID  /*/
    const id = parseInt(req.params.id);
    

    const query = "SELECT * FROM sensors_types WHERE id = ?";
    con.query(query, [id,id], (err, result) => {
      if (err) {
        console.error("Error:", err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '002-004-500-001', "500", "GET", JSON.stringify(req.params),'Error al obtener los tipo de sensor', JSON.stringify(err));
        return res.status(500).json({ error: 'Error al obtener los tipo de sensor' });
      }
      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '002-004-200-001', "200", "GET", JSON.stringify(req.params),'Tipos de sensor recuperado', JSON.stringify(result));
      res.send(result);
    });
  });
  
  router.post("", verifyToken, (req, res) => {  /*/  POST  /*/
    
    const { type, metric, description, errorvalue, valuemax, valuemin, position, correction_general, correction_time_general, discard_value } = req.body;
    const newValuemin = valuemin !== null ? parseFloat(valuemin) : null;
    const newValuemax = valuemax !== null ? parseFloat(valuemax) : null;

    if (!type || !metric) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '002-005-400-001', "400", "POST", JSON.stringify(req.body),'Type y Metric son requeridos al crear el tipo de sensor', "");
      return res.status(400).json({ error: 'Type y Metric son requeridos al crear el tipo de sensor' });
    }
    const query = `INSERT INTO sensors_types (type, metric, description, errorvalue, valuemax, valuemin, position, correction_general, correction_time_general, discard_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    con.query(query, [type, metric, description, errorvalue, newValuemax, newValuemin, position, correction_general, correction_time_general, discard_value], (err, result) => {
      if (err) {
        // LOG - 500 //
        nsertLog(req.user.id, req.user.user, '002-004-500-001', "500", "POST", JSON.stringify(req.params),'Error 1 al crear el tipo de sensor', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 1) {
        const insertedId = result.insertId;
        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '002-005-200-001', "200", "POST", JSON.stringify(req.body),'Tipo de sensor creado', "");
        return res.status(200).json({ id: insertedId });
      }
    });
  });
  
  router.put("", verifyToken, (req, res) => {  /*/  UPDATE  /*/  
    
    const {
      type, metric, description, errorvalue, valuemin, valuemax, id, position, correction_general, correction_time_general, discard_value
    } = req.body;
    const newValuemin = valuemin !== null ? parseFloat(valuemin) : null;
    const newValuemax = valuemax !== null ? parseFloat(valuemax) : null;

    if (!type) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '002-006-400-001', "400", "PUT", JSON.stringify(req.body),'Error 2 al crear el tipo de sensor', "");
      return res.status(400).json({ error: 'Error 2 al crear el tipo de sensor' });
    }
    if (!metric) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '002-006-400-002', "400", "PUT", JSON.stringify(req.body),'Se requiere el ID del usuario y al menos un campo para editar el tipo de sensor', "");
      return res.status(400).json({ error: 'Se requiere el ID del usuario y al menos un campo para editar el tipo de sensor' });
    }
    const query = `
      UPDATE sensors_types
      SET position = ?,type = ?,metric = ?,description = ?,errorvalue = ?,valuemax = ?, valuemin = ?, correction_general = ?,correction_time_general = ?, discard_value= ?
      WHERE id = ?
    `;
    const values = [
      position,type,metric,description,errorvalue,newValuemax,newValuemin,correction_general,correction_time_general,discard_value,id,
    ];
    con.query(query, values, (err, result) => {
      if (err) {
        console.error("Error:", err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '002-006-500-001', "500", "PUT", JSON.stringify(req.body),'Error en la base de datosError al editar  el tipo de sensor', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datosError al editar  el tipo de sensor' });
      }
      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '002-006-200-001', "200", "PUT", JSON.stringify(req.body),'Tipo de sensor editado', "");
      res.send(result);
    });
  });

  router.delete("", verifyToken, (req, res) => {
    const id = req.body.id;

    con.query("DELETE FROM sensors_types WHERE id = ?", id, function (err, result) {
        if (err) {
          // LOG - 500 //
          insertLog(req.user.id, req.user.user, '002-007-500-001', "500", "DELETE", JSON.stringify(req.body), 'Registro no encontrado al editar la estructura de datos variable ', JSON.stringify(err));
          return res.status(500).json({ error: 'Registro no encontrado al editar la estructura de datos variable' });
        }
        if (result.affectedRows === 0) {
          // LOG - 400 //
          insertLog(req.user.id, req.user.user, '002-007-400-001', "400", "DELETE", JSON.stringify(req.body), 'ID no válido al borrar un tipo de sensor', "");
          return res.status(400).json({ error: 'ID no válido al borrar un tipo de sensor' });
        }
        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '002-007-200-001', "200", "DELETE", JSON.stringify(req.body), 'Tipo de sensor eliminado con éxito', "");
        res.json({ message: 'Tipo de sensor eliminado con éxito' });
    });
});


module.exports = router;
