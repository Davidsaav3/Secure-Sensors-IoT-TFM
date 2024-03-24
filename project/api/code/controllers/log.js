const express = require('express');
const router = express.Router();
const { con } = require('../middleware/mysql');
const cors = require('cors');
router.use(cors());
router.use(express.json());
const jwt = require('jsonwebtoken');
const verifyToken = require('./token');

router.get("/get/:type/:type1/:type2/:pag_tam/:pag_pag", verifyToken, (req, res) => { // GET //
  const type0 = req.params.type;
  const type1 = req.params.type1;
  const type2 = req.params.type2;
  const tam = parseInt(req.params.pag_pag);
  const act = (req.params.pag_tam - 1) * parseInt(req.params.pag_pag);
  let query = ``;

  if (type0 === 'search') {
    query += `SELECT *, (SELECT COUNT(*) AS total FROM log) as total FROM log`;
    query += ` ORDER BY ${type1} ${type2}`;
  } 
  else {
    query += `SELECT *, (SELECT COUNT(*) AS total FROM log) as total FROM log`;
    query += ` WHERE log_message LIKE '%${type0}%' ORDER BY ${type1} ${type2}`;
  }
  query += ` LIMIT ? OFFSET ?`;
  con.query(query, [tam, act], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    res.send(result);
  });
});

function insertLog(user_id, username, log_code, log_message, callback) {
  const log_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const query = "INSERT INTO log (user_id, username, log_date, log_code, log_message) VALUES (?, ?, ?, ?, ?)";
  con.query(query, [user_id, username, log_date, log_code, log_message], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    if (result.affectedRows === 1) {
      const insertedId = result.insertId;
      return callback(null, insertedId);
    }
    return callback('No se pudo insertar el registro', null);
  });
}

module.exports = insertLog;