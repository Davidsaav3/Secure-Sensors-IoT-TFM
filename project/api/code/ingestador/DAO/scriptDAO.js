const express = require('express');
const router = express.Router();
let { con } = require('../../middleware/mysql');
let cors = require('cors');
router.use(express.json());

function getStatus(scriptId) {
    const query = `SELECT status FROM script WHERE id = ?`;
    return new Promise((resolve, reject) => {
      con.query(query, [scriptId], (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        if (result.length !== 1) {
          reject(new Error('Invalid script ID or multiple scripts with same ID'));
          return;
        }
        const status = result[0].status;
        resolve(status);
      });
    });
}

function updateDate(res) {
  const query = `UPDATE script SET date = NOW() WHERE id = 0`;
  con.query(query, [], (err, result) => {
    if (err) {
      return json({ error: 'Error en la base de datos 2' });
    }
    if (result.length === 1) {
      const status = 1; // Corrige el acceso a la propiedad 'status'
      return status;
    }
  });
}

module.exports = {
  getStatus,
  updateDate
};
