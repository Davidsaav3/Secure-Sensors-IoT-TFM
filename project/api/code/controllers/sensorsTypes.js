const express = require('express');
const router = express.Router();
let { con } = require('../middleware/mysql');
router.use(express.json())
const verifyToken = require('../middleware/token');
const insertLog = require('../middleware/log');

const corsMiddleware = require('../middleware/corsMiddleware');
const securityMiddleware = require('../middleware/securityMiddleware ');
router.use(corsMiddleware);
router.use(securityMiddleware);

router.get("/:text_search/:order/:order_type/:pag_tam/:pag_pag", verifyToken, (req, res) => {
  const { text_search, order, order_type, pag_tam, pag_pag } = req.params;
  const tam = parseInt(pag_pag);
  const act = (parseInt(pag_tam) - 1) * tam;
  let query;
  let values;

  if (text_search === 'search') {
    query = `SELECT id, type, metric, description, position, correction_general, correction_time_general, (SELECT COUNT(*) AS total FROM sensors_types) as total FROM sensors_types ORDER BY ${order} ${order_type} LIMIT ? OFFSET ?`;
    values = [tam, act];
  }
  else {
    query = `SELECT id, type, metric, description, position, correction_general, correction_time_general, discard_value, (SELECT COUNT(*) AS total FROM sensors_types WHERE type LIKE ? OR metric LIKE ? OR description LIKE ? OR errorvalue LIKE ? OR valuemax LIKE ? OR valuemin LIKE ?) as total FROM sensors_types
      WHERE type LIKE ? OR metric LIKE ? OR description LIKE ? OR errorvalue LIKE ? OR valuemax LIKE ? OR valuemin LIKE ?
      ORDER BY ${order} ${order_type} LIMIT ? OFFSET ?`;
    const likePattern = `%${text_search}%`;
    values = Array(12).fill(likePattern).concat([tam, act]);
  }
  con.query(query, values, (err, result) => {
    if (err) {
      console.error("Error:", err);
      // LOG - 500 //
      insertLog(req.user.id, req.user.user, '002-001-500-001', "500", "GET", JSON.stringify(req.params), 'Error al obtener los tipos de sensores', JSON.stringify(err));
      return res.status(500).json({ error: 'Error al obtener los tipos de sensores' });
    }
    // LOG - 200 //
    insertLog(req.user.id, req.user.user, '002-001-200-001', "200", "GET", JSON.stringify(req.params), 'Tipos de sensores recuperados', JSON.stringify(result));
    res.send(result);
  });
});


router.get("/get_list", verifyToken, (req, res) => {  /*/ GET LIST /*/
  let query = `SELECT id, type, position FROM sensors_types ORDER BY type ASC`;

  con.query(query, (err, result) => {
    if (err) {
      console.error("Error:", err);
      // LOG - 500 //
      insertLog(req.user.id, req.user.user, '002-002-500-001', "500", "GET", "", 'Error al obtener la lista de tipos de sensores ', JSON.stringify(err));
      return res.status(500).json({ error: 'Error al obtener la lista de tipos de sensores' });
    }
    // LOG - 200 //
    insertLog(req.user.id, req.user.user, '002-002-200-001', "200", "GET", "", 'Lista de tipos de sensores recuperada', JSON.stringify(result));
    res.json(result);
  });
});


router.get("/duplicate/:type", verifyToken, (req, res) => {  /*/ DUPLICATE  /*/
  const type = req.params.type;

  if (!type) {
    // NUEVOLOG - 400 //
    insertLog(req.user.id, req.user.user, '002-003-400-001', "400", "GET", JSON.stringify(req.params), 'Tipo de sensor no válido al duplicar', "");
    return res.status(400).json({ error: 'Tipo de sensor no válido al duplicar' });
  }

  let query = `SELECT type FROM sensors_types`;
  con.query(query, (err, result) => {
    if (err) {
      console.error("Error:", err);
      // LOG - 500 //
      insertLog(req.user.id, req.user.user, '002-003-500-001', "500", "GET", JSON.stringify(req.params), 'Error al duplicar el tipo de sensor', JSON.stringify(err));
      return res.status(500).json({ error: 'Error al duplicar el tipo de sensor' });
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
    insertLog(req.user.id, req.user.user, '002-003-200-001', "200", "GET", JSON.stringify(req.params), 'Tipo de sensor duplicado', "");
    res.json({ duplicatedSensor: type_2 });
  });
});


router.get("/id/:id", verifyToken, (req, res) => {  /*/ ID  /*/
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    // LOG - 400 //
    insertLog(req.user.id, req.user.user, '002-004-400-001', "400", "GET", JSON.stringify(req.params), 'ID no válido al obtener el tipo de sensor', "");
    return res.status(400).json({ error: 'ID no válido al obtener el tipo de sensor' });
  }

  const query = "SELECT * FROM sensors_types WHERE id = ?";
  con.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error:", err);
      // LOG - 500 //
      insertLog(req.user.id, req.user.user, '002-004-500-001', "500", "GET", JSON.stringify(req.params), 'Error al obtener los tipo de sensor', JSON.stringify(err));
      return res.status(500).json({ error: 'Error al obtener los tipo de sensor' });
    }
    if (result.length === 0) {
      // NUEVOLOG - 404 //
      insertLog(req.user.id, req.user.user, '002-004-404-001', "404", "GET", JSON.stringify(req.params), 'Tipo de sensor no encontrado', "");
      return res.status(404).json({ error: 'Tipo de sensor no encontrado' });
    }
    // LOG - 200 //
    insertLog(req.user.id, req.user.user, '002-004-200-001', "200", "GET", JSON.stringify(req.params), 'Tipo de sensor recuperado', JSON.stringify(result));
    res.json(result);
  });
});


router.post("", verifyToken, (req, res) => {  /*/  POST  /*/
  const { type, metric, description, errorvalue, valuemax, valuemin, position, correction_general, correction_time_general, discard_value } = req.body;

  if (!type || !metric) {
    // LOG - 400 //
    insertLog(req.user.id, req.user.user, '002-005-400-001', "400", "POST", JSON.stringify(req.body), 'Type y Metric son requeridos al crear el tipo de sensor', "");
    return res.status(400).json({ error: 'Type y Metric son requeridos al crear el tipo de sensor' });
  }

  // Conversión 
  const newValuemin = valuemin !== null ? parseFloat(valuemin) : null;
  const newValuemax = valuemax !== null ? parseFloat(valuemax) : null;

  const query = `
      INSERT INTO sensors_types (type, metric, description, errorvalue, valuemax, valuemin, position, correction_general, correction_time_general, discard_value)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  const values = [
    type, metric, description, errorvalue, newValuemax, newValuemin, position, correction_general, correction_time_general, discard_value
  ];

  con.query(query, values, (err, result) => {
    if (err) {
      console.error("Error:", err);
      // LOG - 500 //
      insertLog(req.user.id, req.user.user, '002-004-500-001', "500", "POST", JSON.stringify(req.params), 'Error en la base de datos al crear el tipo de sensor', JSON.stringify(err));
      return res.status(500).json({ error: 'Error en la base de datos al crear el tipo de sensor' });
    }
    if (result.affectedRows === 1) {
      const insertedId = result.insertId;
      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '002-005-200-001', "200", "POST", JSON.stringify(req.body), 'Tipo de sensor creado', "");
      return res.status(200).json({ id: insertedId });
    }
  });
});


router.put("", verifyToken, (req, res) => {  /*/  UPDATE  /*/
  const {
    type, metric, description, errorvalue, valuemin, valuemax, id, position, correction_general, correction_time_general, discard_value
  } = req.body;

  if (!type || !metric || !id) {
    // LOG - 400 //
    insertLog(req.user.id, req.user.user, '002-006-400-001', "400", "PUT", JSON.stringify(req.body), 'Faltan campos obligatorios para editar el tipo de sensor', "");
    return res.status(400).json({ error: 'Faltan campos obligatorios para editar el tipo de sensor' });
  }

  // Conversión
  const newValuemin = valuemin !== null ? parseFloat(valuemin) : null;
  const newValuemax = valuemax !== null ? parseFloat(valuemax) : null;

  const query = `
      UPDATE sensors_types
      SET position = ?, type = ?, metric = ?, description = ?, errorvalue = ?, valuemin = ?, valuemax = ?, correction_general = ?, correction_time_general = ?, discard_value = ?
      WHERE id = ?
    `;
  const values = [
    position, type, metric, description, errorvalue, newValuemin, newValuemax, correction_general, correction_time_general, discard_value, id
  ];

  con.query(query, values, (err, result) => {
    if (err) {
      console.error("Error:", err);
      // LOG - 500 //
      insertLog(req.user.id, req.user.user, '002-006-500-001', "500", "PUT", JSON.stringify(req.body), 'Error en la base de datos al editar el tipo de sensor', JSON.stringify(err));
      return res.status(500).json({ error: 'Error en la base de datos al editar el tipo de sensor' });
    }
    // LOG - 200 //
    insertLog(req.user.id, req.user.user, '002-006-200-001', "200", "PUT", JSON.stringify(req.body), 'Tipo de sensor editado', "");
    res.json(result);
  });
});


router.delete("", verifyToken, (req, res) => {  /*/  DELETE  /*/
  const id = req.body.id;

  if (!id || isNaN(id)) {
    // LOG - 400 //
    insertLog(req.user.id, req.user.user, '002-007-400-001', "400", "DELETE", JSON.stringify(req.body), 'ID no válido al borrar un tipo de sensor', "");
    return res.status(400).json({ error: 'ID no válido al borrar un tipo de sensor' });
  }

  con.query("DELETE FROM sensors_types WHERE id = ?", id, function (err, result) {
    if (err) {
      console.error(err);
      // LOG - 500 //
      insertLog(req.user.id, req.user.user, '002-007-500-001', "500", "DELETE", JSON.stringify(req.body), 'Error al eliminar el tipo de sensor', JSON.stringify(err));
      return res.status(500).json({ error: 'Error al eliminar el tipo de sensor' });
    }
    if (result.affectedRows === 0) {
      // LOG - 404 //
      insertLog(req.user.id, req.user.user, '002-007-404-001', "404", "DELETE", JSON.stringify(req.body), 'Tipo de sensor no encontrado para eliminar', "");
      return res.status(404).json({ error: 'Tipo de sensor no encontrado para eliminar' });
    }
    // LOG - 200 //
    insertLog(req.user.id, req.user.user, '002-007-200-001', "200", "DELETE", JSON.stringify(req.body), 'Tipo de sensor eliminado con éxito', "");
    res.json({ message: 'Tipo de sensor eliminado con éxito' });
  });
});


module.exports = router;
