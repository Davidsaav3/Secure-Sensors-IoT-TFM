const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())

  router.get("/get/:type/:type1/:type2/:pag_tam/:pag_pag", (req, res) => {  /*/ GET  /*/
    const type0 = req.params.type;
    const type1 = req.params.type1;
    const type2 = req.params.type2;
    const tam = parseInt(req.params.pag_pag);
    const act = (parseInt(req.params.pag_tam) - 1) * parseInt(req.params.pag_pag);
  
    let query;
    let values;
  
    if (type0 == 'search') {
      query = `SELECT id, type, metric, description, position, correction_general, correction_time_general,(SELECT COUNT(*) AS total FROM sensors_types) as total FROM sensors_types ORDER BY ${type1} ${type2} LIMIT ? OFFSET ?`;
    } else {
      query = `
        SELECT id, type, metric, description, position, correction_general, correction_time_general,discard_value,(SELECT COUNT(*) AS total FROM sensors_types WHERE type LIKE '%${type0}%' OR metric LIKE '%${type0}%' OR description LIKE '%${type0}%' OR errorvalue LIKE '%${type0}%' OR valuemax LIKE '%${type0}%' OR valuemin LIKE '%${type0}%') as total FROM sensors_types
        WHERE type LIKE '%${type0}%' OR metric LIKE '%${type0}%' OR description LIKE '%${type0}%' OR errorvalue LIKE '%${type0}%' OR valuemax LIKE '%${type0}%' OR valuemin LIKE '%${type0}%'
        ORDER BY ${type1} ${type2} LIMIT ? OFFSET ?
      `;
    }
    values = [tam, act];
    con.query(query, values, (err, result) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.send(result);
    });
  });

  router.get("/get_list", (req, res) => {  /*/ GET LIST /*/
    let query = `SELECT id, type, position FROM sensors_types ORDER BY type ASC`;
    con.query(query, (err, result) => {
      if (err) {
        console.error(err);
      }
      res.send(result);
    });
  });

  router.get("/duplicate/:type", (req, res) => {  /*/ DUPLICATE  /*/
    const type = req.params.type;
    let query = `SELECT type FROM sensors_types`;
    con.query(query, (err, result) => {
      if (err) {
        console.error(err);
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

      res.send(type_2);
    });
  });
  
  router.get("/id/:id", (req, res) => {  /*/ ID  /*/
    const id = parseInt(req.params.id);
    const query = "SELECT * FROM sensors_types WHERE id = ?";
    con.query(query, [id,id], (err, result) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.send(result);
    });
  });
  
  router.post("", (req, res) => {  /*/  POST  /*/
    const { type, metric, description, errorvalue, valuemax, valuemin, position, correction_general, correction_time_general, discard_value } = req.body;
    if (!type || !metric) {
      return res.status(400).json({ error: 'Los campos type y metric son requeridos.' });
    }
    const query = `INSERT INTO sensors_types (type, metric, description, errorvalue, valuemax, valuemin, position, correction_general, correction_time_general, discard_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    con.query(query, [type, metric, description, errorvalue, valuemax, valuemin, position, correction_general, correction_time_general, discard_value], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 1) {
        const insertedId = result.insertId;
        return res.status(201).json({ id: insertedId });
      }
      return res.status(500).json({ error: 'No se pudo insertar el registro' });
    });
  });
  
  router.put("", (req, res) => {  /*/  UPDATE  /*/
    const {
      type,metric,description,errorvalue,valuemax,valuemin,id,position,correction_general,correction_time_general,discard_value
    } = req.body;
    if (!type) {
      return res.status(400).json({ error: 'El campo type es requerido.' });
    }
    if (!metric) {
      return res.status(400).json({ error: 'El campo metric es requerido.' });
    }
    const query = `
      UPDATE sensors_types
      SET position = ?,type = ?,metric = ?,description = ?,errorvalue = ?,valuemax = ?, valuemin = ?, correction_general = ?,correction_time_general = ?, discard_value= ?
      WHERE id = ?
    `;
    const values = [
      position,type,metric,description,errorvalue,valuemax,valuemin,correction_general,correction_time_general,discard_value,id,
    ];
    con.query(query, values, (err, result) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.send(result);
    });
  });

  router.delete("", (req, res) => {  /*/ DELETE  /*/
    const id = req.body.id;
      if (isNaN(id)) {
      return res.status(400).json({ error: 'ID no válido' });
    }
    con.query("DELETE FROM sensors_types WHERE id = ?", id, function (err, result) {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Elemento no encontrado' });
      }
      res.json({ message: 'Elemento eliminado con éxito' });
    });
  });

module.exports = router;
