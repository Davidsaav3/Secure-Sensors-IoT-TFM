const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())

var longitudMaxima = 247;

function insertLog(user_id, username, log_code, log_status, log_method, log_parameters, log_message, log_trace, callback) {
  const log_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const query = "INSERT INTO log (user_id, username, log_date, log_code, log_status, log_method, log_parameters, log_message, log_trace) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  con.query(query, [user_id, username, log_date, log_code, log_status, log_method, truncarCadena(log_parameters, longitudMaxima), log_message, truncarCadena(log_trace, longitudMaxima)], (err, result) => {
    if (err) {
      //return callback(err, null);
    }
    //if (result.affectedRows === 1) {
      //const insertedId = result.insertId;
      //return callback(null, insertedId);
    //}
    //return callback('No se pudo insertar el registro', null);
  });
}

function truncarCadena(cadena, longitudMaxima) {
  if (cadena.length > longitudMaxima) {
      return cadena.substring(0, longitudMaxima) + "...";
  } else {
      return cadena;
  }
}

module.exports = insertLog;
