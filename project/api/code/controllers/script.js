const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(express.json())
const verifyToken = require('../middleware/token');
const insertLog = require('../middleware/log');
const { spawn } = require("child_process");
const insertLogScript = require('../middleware/log_script');

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
    res.setHeader('Strict-Transport-Security', 'max-age=${process.env.TRANSPORT_SECURITY_AGE}; includeSubDomains'); 
    // Especifica de dónde se pueden cargar los recursos
    res.setHeader('Content-Security-Policy', "default-src 'self'; geolocation 'self'");
    // Activa el filtro XSS en los navegadores
    res.setHeader('X-XSS-Protection', '1; mode=block'); 
    // Controla cómo se envía el referente en las solicitudes HTTP
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Controla qué recursos pueden ser compartidos entre diferentes orígenes
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin'); 
    // Indica al navegador que espere y reporte certificados de transparencia
    res.setHeader('Expect-CT', `max-age=${process.env.REPORT_AGE}, report-uri="${process.env.REPORT_URL}"`); 
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

//ejecutarSensors();

router.post("/script", (req, res) => {  // SCRIPT
  const status = req.body.status;
  const status2 = req.body.status2;

  //console.log(status)
  const query = "UPDATE script SET status = ?";
  con.query(query, [status], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
  });

  if (status==1 && status2!=1) {
    insertLogScript('x', 'x', 1, 'x');
    ejecutarSensors();
  }
  if(status==0){
    insertLogScript('x', 'x', 0, 'x');
  }

});

function ejecutarSensors() {
  const proceso = spawn('node', ['../code/ingestador/sensors']);
  proceso.stdout.on('data', (data) => {
    console.log(`[sensors.js]-> ${data}`);
  });
  proceso.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  proceso.on('error', (error) => {
    console.error(`Error: ${error.message}`);
  });
  proceso.on('close', (code) => {
    console.log(`Proceso cerrado con código de salida ${code}`);
  });
}


router.get("/script-status", (req, res) => {  // STATUS
  const query = "SELECT date, status FROM script";
  con.query(query, [], (err, result) => { // Cambio de nombre a 'result'
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (result.length === 1) { 
      const date= result[0].date;
      const status= result[0].status;
      return res.status(200).json({ status: status, date: date });
    }
  });
});

router.get("/get/:text_search/:order/:order_type/:pag_tam/:pag_pag", verifyToken, (req, res) => { // GET //
  const { text_search, order, order_type, pag_tam, pag_pag } = req.params;
  const tam = parseInt(pag_pag);
  const act = (parseInt(pag_tam) - 1) * tam;
  let query = "";
  let queryParams = [];

  if (text_search === 'search') {
    query = `SELECT *, (SELECT COUNT(*) AS total FROM log_script) as total FROM log_script ORDER BY ? ? LIMIT ? OFFSET ?`;
    queryParams = [order, order_type, tam, act];
  } 
  else {
    query = `SELECT *, (SELECT COUNT(*) AS total FROM log_script WHERE id LIKE ? OR user_id LIKE ? OR username LIKE ? OR log_date LIKE ? OR log_trace LIKE ? OR log_status LIKE ?) as total FROM log WHERE id LIKE ? OR user_id LIKE ? OR username LIKE ? OR log_date LIKE ? OR log_trace LIKE ? OR log_status LIKE ? ORDER BY ? ? LIMIT ? OFFSET ?`;
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