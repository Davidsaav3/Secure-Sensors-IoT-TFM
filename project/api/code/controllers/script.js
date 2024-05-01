const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
router.use(express.json())
const verifyToken = require('../middleware/token');
const insertLog = require('../middleware/log');
const { spawn } = require("child_process");

  const corsMiddleware = require('../middleware/corsMiddleware');
  const securityMiddleware = require('../middleware/securityMiddleware ');
  router.use(corsMiddleware);
  router.use(securityMiddleware);

  router.post("/script", verifyToken, (req, res) => {  // SCRIPT // bloq...
    const status = req.body.status;
    const { id, user } = req.user;

    if (status==1) { // nombres y servicios
      runScript(id, user, req.body);
    }

    //console.log(status)
    const query = "UPDATE script SET status = ?";
    con.query(query, [status], (err, result) => {
      if (err) {
        insertLog(id, user, '008-001-500-003', "500", "POST", JSON.stringify(req.body),'Error al activar o desactivar el script 3', "");
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
    });

  });
  function runScript(id, user, body) {
    const proceso = spawn('node', ['../code/ingestador/sensors']);
    proceso.stdout.on('data', (data) => {
      console.log(`[sensors.js]-> ${data}`);
    });
    proceso.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      insertLog(id, user, '008-001-500-004', "500", "", JSON.stringify(body),'Error al activar o desactivar el script (stderr)', data);
    });
    proceso.on('error', (error) => {
      console.error(`Error: ${error.message}`);
      insertLog(id, user, '008-001-500-005', "500", "", JSON.stringify(body),'Error al activar o desactivar el script (error)', error.message);
    });
    proceso.on('close', (code) => {
      console.log(`Proceso cerrado con código de salida ${code}`);
      insertLog(id, user, '008-001-500-006', "500", "", JSON.stringify(body),'`Error al activar o desactivar el script (salida con código)', code);
    }); // ver
    //proceso.kill();
    //iniciar off
  }


  router.get("/script-status", verifyToken, (req, res) => {  // STATUS
    const query = "SELECT date, status FROM script";
    const { id, user } = req.user;

    con.query(query, [], (err, result) => {
      if (err) {
        insertLog(id, user, '008-002-500-001', "500", "GET", '','Error al obtener el estado del script', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.length === 1) { 
        const date= result[0].date;
        const status= result[0].status;
        //insertLog(id, user, '008-002-200-001', "500", "GET", '','Estado del escript obtenido', result);
        return res.status(200).json({ status, date });
      }
    });
  });


  router.get("/:text_search/:order/:order_type/:pag_tam/:pag_pag", verifyToken, (req, res) => { // GET // *log
    const { text_search, order, order_type, pag_tam, pag_pag } = req.params;
    const { id, user } = req.user;

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
        insertLog(id, user, '008-003-500-001', "500", "GET", JSON.stringify(req.params),'Error al obtener el log del script', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }        
      insertLog(id, user, '008-003-200-001', "200", "GET", JSON.stringify(req.params),'Log del script obtenido', JSON.stringify(result));
      res.send(result);
    });
  });

  
module.exports = router;