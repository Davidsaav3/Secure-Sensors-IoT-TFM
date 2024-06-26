const express = require('express');
const router = express.Router();
let { con } = require('./mysql');
let cors = require('cors')
router.use(cors());
router.use(express.json())

var longitudMaxima = parseInt(process.env.LOG_SIZE);

function insertLog(user_id, username, log_code, log_status, log_method, log_parameters, log_message, log_trace, callback) {
  const log_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const query = "INSERT INTO log (user_id, username, log_date, log_code, log_status, log_method, log_parameters, log_message, log_trace) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  con.query(query, [user_id, username, log_date, log_code, log_status, log_method, truncarCadena(log_parameters, longitudMaxima), log_message, truncarCadena(log_trace, longitudMaxima)], (err, result) => {
    if (err) {
      // registra el error el propio log
      if (process.env.VERBOSE_ERROR) console.error("Error al insertar en el registro:", err);
    }
    if (callback) {
      callback(err, result);
    }
  });
}

function truncarCadena(cadena, longitudMaxima) {
  if (cadena.length > longitudMaxima) {
    return cadena.substring(0, longitudMaxima);
  }
  else {
    return cadena;
  }
}

module.exports = insertLog;
