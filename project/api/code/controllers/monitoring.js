const express = require('express');
const router = express.Router();
const { con } = require('../middleware/mysql');
const cors = require('cors');
router.use(express.json());
const verifyToken = require('../middleware/token');

  const corsOptions = {
    origin: ['http://localhost:4200', 'https://sensors.com:5500'],
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  router.use(cors(corsOptions));

  router.use((req, res, next) => {
    // Evita que el navegador realice "sniffing" del tipo MIME
    res.setHeader('X-Content-Type-Options', 'nosniff'); 
    // Obliga al uso de HTTPS durante un período de tiempo
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'); 
    // Especifica de dónde se pueden cargar los recursos
    res.setHeader('Content-Security-Policy', "default-src 'self'; geolocation 'self'");
    // Activa el filtro XSS en los navegadores
    res.setHeader('X-XSS-Protection', '1; mode=block'); 
    // Controla cómo se envía el referente en las solicitudes HTTP
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Controla qué recursos pueden ser compartidos entre diferentes orígenes
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin'); 
    // Indica al navegador que espere y reporte certificados de transparencia
    res.setHeader('Expect-CT', 'max-age=0, report-uri="https://sensors.com:5500/report"'); 
    // Controla qué funciones o características pueden ser usadas en la página
    res.setHeader('Feature-Policy', "geolocation 'self'");
    // Permite solicitudes CORS desde el dominio del frontend
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    //res.setHeader('Access-Control-Allow-Origin', 'https://sensors.com:5500');
    // Permitir el uso de credenciales en las solicitudes CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    // Indica los métodos permitidos en las solicitudes CORS
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // Indica los encabezados permitidos en las solicitudes CORS
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

  router.get("/get/:text_search/:order/:order_type/:pag_tam/:pag_pag", verifyToken, (req, res) => { // GET //
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
