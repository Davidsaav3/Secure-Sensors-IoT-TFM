const express = require('express');
const router = express.Router();
let { con } = require('../../middleware/mysql');
router.use(express.json());

function getStatus() { // OBTENER STATUS
  const query = `SELECT status FROM script WHERE id = 0`;
  return new Promise((resolve, reject) => {
    con.query(query, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      if (result.length !== 1) {
        reject(new Error('Error getStatus()'));
        return;
      }
      const status = result[0].status;
      resolve(status);
    });
  });
}

function updateDate() { // ACTUALIZAR FECHA
  const query = `UPDATE script SET date = NOW(), status = 1 WHERE id = 0`;
  con.query(query, [], (err, result) => {
    if (err) {
      return json({ error: 'Error updateDate()' });
    }
    if (result.length === 1) {
      return true;
    }
  });
}

module.exports = {
  getStatus, updateDate
};
