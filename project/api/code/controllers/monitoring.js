const express = require('express');
const router = express.Router();
const { con } = require('../middleware/mysql');
router.use(express.json());
const verifyToken = require('../middleware/token');
const insertLog = require('../middleware/log');

const corsMiddleware = require('../middleware/corsMiddleware');
const securityMiddleware = require('../middleware/securityMiddleware ');
router.use(corsMiddleware);
router.use(securityMiddleware);

  router.get("/:text_search/:order/:order_type/:pag_tam/:pag_pag", verifyToken, (req, res) => { // GET //
    const { text_search, order, order_type, pag_tam, pag_pag } = req.params;
    const tam = parseInt(pag_pag);
    const act = (parseInt(pag_tam) - 1) * tam;
    let query = "";
    let queryParams = [];

    // Validación de parámetros de entrada
    if (!text_search || !order || !order_type || !pag_tam || !pag_pag || isNaN(tam) || isNaN(act)) {
      insertLog(req.user.id, req.user.user, '008-001-400-001', "400", "GET", JSON.stringify(req.params), 'Parámetros de entrada inválidos al obtener el log', '');
      return res.status(400).json({ error: 'Parámetros de entrada inválidos al obtener el log' });
    }

    if (text_search === 'search') {
      query = `SELECT *, (SELECT COUNT(*) AS total FROM log) as total FROM log ORDER BY ${order} ${order_type} LIMIT ? OFFSET ?`;
      queryParams = [tam, act];
    }
    else {
      query = `SELECT *, (SELECT COUNT(*) AS total FROM log WHERE id LIKE ? OR user_id LIKE ? OR username LIKE ? OR log_date LIKE ? OR log_code LIKE ? OR log_message LIKE ? OR log_trace LIKE ?) as total FROM log WHERE id LIKE ? OR user_id LIKE ? OR username LIKE ? OR log_date LIKE ? OR log_code LIKE ? OR log_message LIKE ? OR log_trace LIKE ? ORDER BY ${order} ${order_type} LIMIT ? OFFSET ?`;
      const likePattern = `%${text_search}%`;
      // Cambio de la condición LIKE para coincidir con los parámetros en la consulta
      queryParams = Array(14).fill(likePattern).concat([tam, act]);
    }

    con.query(query, queryParams, (err, result) => {
      if (err) {
        insertLog(req.user.id, req.user.user, '008-001-500-001', "500", "GET", JSON.stringify(req.params), 'Error en la base de datos al obtener el log', '');
        return res.status(500).json({ error: 'Error en la base de datos al obtener el log' });
      }
      // Validación de resultados de consulta
      if (!result || result.length === 0) {
        insertLog(req.user.id, req.user.user, '008-001-404-001', "404", "GET", JSON.stringify(req.params), 'No se encontraron resultados al obtener el log', '');
        return res.status(404).json({ error: 'No se encontraron resultados al obtener el log' });
      }
      //insertLog(req.user.id, req.user.user, '008-001-200-001', "200", "GET", JSON.stringify(req.params), 'Log obtenido', '');
      res.send(result);
    });
  });



module.exports = router;
