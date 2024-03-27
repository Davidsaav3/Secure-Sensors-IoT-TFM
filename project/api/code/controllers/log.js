const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())

function insertLog(user_id, username, log_code, log_status, log_name, log_parameters, log_message, log_trace, callback) {
  const log_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const query = "INSERT INTO log (user_id, username, log_date, log_code, log_status, log_name, log_parameters, log_message, log_trace) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  con.query(query, [user_id, username, log_date, log_code, log_status, log_name, log_parameters, log_message, log_trace], (err, result) => {
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

module.exports = insertLog;
