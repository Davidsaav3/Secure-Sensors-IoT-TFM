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
        insertLog(req.user.id, req.user.email, '002-001-500-001', "500", "sensorsTypes-get", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      // LOG - 200 //
      insertLog(req.user.id, req.user.email, '002-001-200-001', "200", "sensorsTypes-get", JSON.stringify(req.params), 'Registro obtenido correctamente', JSON.stringify(result));
    });
  });

  router.get("/get_list", verifyToken, (req, res) => {  /*/ GET LIST /*/
    
    let query = `SELECT id, type, position FROM sensors_types ORDER BY type ASC`;
    con.query(query, (err, result) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.email, '002-001-500-001', "500", "sensorsTypes-get_list", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
        console.error(err);
      }
      // LOG - 200 //
      insertLog(req.user.id, req.user.email, '002-001-200-001', "200", "sensorsTypes-get_list", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(result));
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
        insertLog(req.user.id, req.user.email, '002-002-500-001', "500", "sensorsTypes-duplicate", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).send("Error en la base de datos");
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
      insertLog(req.user.id, req.user.email, '002-002-200-001', "200", "sensorsTypes-duplicate", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(result));
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
        insertLog(req.user.id, req.user.email, '002-003-500-001', "500", "sensorsTypes-id", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      // LOG - 200 //
      insertLog(req.user.id, req.user.email, '002-003-200-001', "200", "sensorsTypes-id", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(result));
      res.send(result);
    });
  });
  
  router.post("", verifyToken, (req, res) => {  /*/  POST  /*/
    
    const { type, metric, description, errorvalue, valuemax, valuemin, position, correction_general, correction_time_general, discard_value } = req.body;
    const newValuemin = valuemin !== null ? parseFloat(valuemin) : null;
    const newValuemax = valuemax !== null ? parseFloat(valuemax) : null;

    if (!type || !metric) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.email, '002-004-400-001', "400", "sensorsTypes-post", JSON.stringify(req.params),'Error en la base de datos', "0");
      return res.status(400).json({ error: 'Los campos type y metric son requeridos.' });
    }
    const query = `INSERT INTO sensors_types (type, metric, description, errorvalue, valuemax, valuemin, position, correction_general, correction_time_general, discard_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    con.query(query, [type, metric, description, errorvalue, newValuemax, newValuemin, position, correction_general, correction_time_general, discard_value], (err, result) => {
      if (err) {
        // LOG - 500 //
        nsertLog(req.user.id, req.user.email, '002-004-500-001', "500", "sensorsTypes-post", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 1) {
        const insertedId = result.insertId;
        // LOG - 200 //
        insertLog(req.user.id, req.user.email, '002-004-200-001', "200", "sensorsTypes-post", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(result));
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
      insertLog(req.user.id, req.user.email, '002-005-400-001', "400", "sensorsTypes-put", JSON.stringify(req.params),'Error en la base de datos', "0");
      return res.status(400).json({ error: 'El campo type es requerido.' });
    }
    if (!metric) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.email, '002-005-400-002', "400", "sensorsTypes-put", JSON.stringify(req.params),'Error en la base de datos', "0");
      return res.status(400).json({ error: 'El campo metric es requerido.' });
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
        insertLog(req.user.id, req.user.email, '002-005-500-001', "500", "sensorsTypes-put", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      // LOG - 200 //
      insertLog(req.user.id, req.user.email, '002-005-200-001', "200", "sensorsTypes-put", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(result));
      res.send(result);
    });
  });

  router.delete("", verifyToken, (req, res) => {
    

    con.query("DELETE FROM sensors_types WHERE id = ?", id, function (err, result) {
        if (err) {
          // LOG - 500 //
          insertLog(req.user.id, req.user.email, '002-006-500-001', "500", "sensorsTypes-delete", JSON.stringify(req.params), 'Error en la base de datos', "0");
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
        if (result.affectedRows === 0) {
          // LOG - 400 //
          insertLog(req.user.id, req.user.email, '002-006-400-001', "400", "sensorsTypes-delete", JSON.stringify(req.params), 'Elemento no encontrado', JSON.stringify(err));
          return res.status(400).json({ error: 'Elemento no encontrado' });
        }
        // LOG - 200 //
        insertLog(req.user.id, req.user.email, '002-006-200-001', "200", "Elemento eliminado con éxito", JSON.stringify(req.params), 'Elemento eliminado con éxito', JSON.stringify(result));
        res.json({ message: 'Elemento eliminado con éxito' });
    });
});


module.exports = router;
