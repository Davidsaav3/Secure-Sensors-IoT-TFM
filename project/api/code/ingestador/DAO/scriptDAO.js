const express = require('express');
const router = express.Router();
let { con } = require('../../middleware/mysql');
let cors = require('cors');
router.use(express.json());

function getStatus(res) {
  const query = `SELECT status FROM script`; // Corrige el error tipográfico en la consulta SQL
  con.query(query, [], (err, result) => {
    if (err) {
      return json({ error: 'Error en la base de datos 1' });
    }
    if (result.length === 1) {
      const status = result[0].status; // Corrige el acceso a la propiedad 'status'
      return status;
    }
  });
}

function updateDate(res) {
  const query = `UPDATE script SET date = NOW()`;
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
