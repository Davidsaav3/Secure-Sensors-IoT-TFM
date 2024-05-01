const express = require('express');
const router = express.Router();
const { con } = require('../middleware/mysql');
router.use(express.json());
const verifyToken = require('../middleware/token');

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
    
      if (text_search === 'search') {
        query = `SELECT *, (SELECT COUNT(*) AS total FROM log) as total FROM log ORDER BY ? ? LIMIT ? OFFSET ?`;
        queryParams = [order, order_type, tam, act];
      } 
      else {
        query = `SELECT *, (SELECT COUNT(*) AS total FROM log WHERE id LIKE ? OR user_id LIKE ? OR username LIKE ? OR log_date LIKE ? OR log_code LIKE ? OR log_message LIKE ? OR log_trace LIKE ?) as total FROM log WHERE id LIKE ? OR user_id LIKE ? OR username LIKE ? OR log_date LIKE ? OR log_code LIKE ? OR log_message LIKE ? OR log_trace LIKE ? ORDER BY ? ? LIMIT ? OFFSET ?`;
        const likePattern = `%${text_search}%`;
        queryParams = Array(14).fill(likePattern).concat([order, order_type, tam, act]);
      }
    
      con.query(query, queryParams, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.send(result);
      });
    });
    

module.exports = router;
