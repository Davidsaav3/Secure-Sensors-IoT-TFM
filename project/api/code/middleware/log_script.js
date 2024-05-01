const express = require('express');
const router = express.Router();
let { con }= require('./mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())

  var longitudMaxima = process.env.LOG_SCRIPT_SIZE;
  
  function insertLogScript(user_id, username, log_status, log_trace, callback) {
    const log_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const query = "INSERT INTO log_script (user_id, username, log_date, log_status, log_trace) VALUES (?, ?, ?, ?, ?)";
    con.query(query, [user_id, username, log_date, log_status, truncarCadena(log_trace, longitudMaxima)], (err, result) => {
        if (err) {
            // registra el error el propio log
            console.error("Error al insertar en el registro:", err);
        }
        if (callback) {
            callback(err, result);
        }
    });
}

function truncarCadena(cadena, longitudMaxima) {
  if (typeof cadena !== 'string') {
    return '';
  }
  if (cadena.length > longitudMaxima) {
    return cadena.substring(0, longitudMaxima);
  } 
  else {
    return cadena;
  }
}

module.exports = insertLogScript;
