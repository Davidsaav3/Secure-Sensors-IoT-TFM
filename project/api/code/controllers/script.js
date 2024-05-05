const express = require('express');
const router = express.Router();
let { con } = require('../middleware/mysql');
router.use(express.json())
const verifyToken = require('../middleware/token');
const insertLog = require('../middleware/log');
const insertLogScript = require('../middleware/log_script');

const { spawn } = require("child_process");

const corsMiddleware = require('../middleware/corsMiddleware');
const securityMiddleware = require('../middleware/securityMiddleware ');
router.use(corsMiddleware);
router.use(securityMiddleware);

let proceso;


router.post("/script", verifyToken, (req, res) => { // ON - OFF : SCRIPT //
  const status = req.body.status;
  const { id, user } = req.user;

  let query = "SELECT status, date FROM script WHERE id = 0";
  con.query(query, [status], async (err, result) => {
    if (err) {
      // Insertar registro de error en la base de datos
      insertLog(id, user, '008-001-500-003', "500", "POST", JSON.stringify(req.body), 'Error al activar o desactivar el script 3', "");
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    else {
      try {
        console.log('')
        console.log('OREDEN ENTRANTE-> ' + status)
        console.log('ESTADO ACTUAL -> ' + result[0].status)
        console.log('')

        // Llamar a la función auxiliar de script
        await script_aux(status, result, id, user, req); // Pasar req aquí
        res.status(200).json({ message: "Operación exitosa" });
      }
      catch (error) {
        res.status(500).json({ error: error });
      }
    }
  });
});


async function script_aux(status, result, id, user, req) { // Agregar req como parámetro
  return new Promise(async (resolve, reject) => {

    // Imprimir la última fecha almacenada + 5 segundos
    let date = new Date();
    const date_now = await formatearFecha(date);
    console.log('FECHA ACTUAL -> ' + date_now)

    // Imprimir la fecha actual
    date = new Date(result[0].date);
    date.setMilliseconds(date.getMilliseconds() + 5000);
    const date_script = await formatearFecha(date);
    console.log('ULTIMA FECHA SCRIPT +5-> ' + date_script)
    console.log('')

    // Si la fecha actual es mayor que la última fecha de encendido + 5 segundos -> se puede encender porque está apagado
    if (status == 1 && date_now > date_script) {
      proceso = await runScript(id, user, req.body);
      //console.log(proceso.status)
      //if (proceso.status) { 
      console.log("--- SCRIPT ENCENDIDO ---");
      console.log("");
      insertLogScript(id, user, 1, '');
      //}
    }

    // Si la fecha actual es menor que la última fecha de encendido + 5 segundos -> se puede apagar porque está encendido
    if (status == 0 && date_now < date_script) {
      proceso.kill();
      if (!proceso.status) {
        console.log("--- SCRIPT APAGADO ---");
        console.log("");
        insertLogScript(id, user, 0, '');
      }
    }

    resolve();
  });
}


async function formatearFecha(fecha) { // Formato de la fecha
  let anio = fecha.getFullYear();
  let mes = String(fecha.getMonth() + 1).padStart(2, '0');
  let dia = String(fecha.getDate()).padStart(2, '0');
  let horas = String(fecha.getHours()).padStart(2, '0');
  let minutos = String(fecha.getMinutes()).padStart(2, '0');
  let segundos = String(fecha.getSeconds()).padStart(2, '0');
  return `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
}

async function runScript(id, user, body) { // RUN SCRIPT //
  return new Promise((resolve, reject) => {
    let proceso = spawn('node', ['../code/ingestador/sensors']);
    proceso.stdout.on('data', (data) => {
      console.log(`[SALIDA]-> ${data}`);
    });
    proceso.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      insertLog(id, user, '008-001-500-004', "500", "", JSON.stringify(body), 'Error al activar o desactivar el script (stderr)', '');
    });
    proceso.on('error', (error) => {
      console.error(`Error: ${error.message}`);
      insertLog(id, user, '008-001-500-005', "500", "", JSON.stringify(body), 'Error al activar o desactivar el script (error)', '');
      reject(error);
    });
    proceso.on('close', (code) => {
      console.log(`[APAGADO]-> ${code}`);
      insertLog(id, user, '008-001-500-006', "500", "", JSON.stringify(body), '`Error al activar o desactivar el script (salida con código)', '');
    });
    resolve(proceso);
  });
}


router.get("/script-status", verifyToken, (req, res) => {  // SCRIPT STATUS //
  const query = "SELECT date, status FROM script";
  const { id, user } = req.user;

  con.query(query, [], (err, result) => {
    if (err) {
      insertLog(id, user, '008-002-500-001', "500", "GET", '', 'Error al obtener el estado del script', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (result.length === 1) {
      const date = result[0].date;
      const status = result[0].status;
      //insertLog(id, user, '008-002-200-001', "500", "GET", '','Estado del escript obtenido', result);
      return res.status(200).json({ status, date });
    }
  });
});


router.get("/:text_search/:order/:order_type/:pag_tam/:pag_pag", verifyToken, (req, res) => { // GET LOGS //
  const { text_search, order, order_type, pag_tam, pag_pag } = req.params;
  const { id, user } = req.user;

  const tam = parseInt(pag_pag);
  const act = (parseInt(pag_tam) - 1) * tam;
  let query = "";
  let queryParams = [];

  if (text_search === 'search') {
    query = `SELECT *, (SELECT COUNT(*) AS total FROM log_script) as total FROM log_script ORDER BY ${order} ${order_type} LIMIT ? OFFSET ?`;
    queryParams = [tam, act];
  }
  else {
    query = `SELECT *, (SELECT COUNT(*) AS total FROM log_script WHERE id LIKE ? OR user_id LIKE ? OR username LIKE ? OR log_date LIKE ? OR log_trace LIKE ? OR log_status LIKE ?) as total FROM log WHERE id LIKE ? OR user_id LIKE ? OR username LIKE ? OR log_date LIKE ? OR log_trace LIKE ? OR log_status LIKE ? ORDER BY ${order} ${order_type} LIMIT ? OFFSET ?`;
    const likePattern = `%${text_search}%`;
    queryParams = Array(12).fill(likePattern).concat([tam, act]);
  }

  con.query(query, queryParams, (err, result) => {
    if (err) {
      console.error(err);
      insertLog(id, user, '008-003-500-001', "500", "GET", JSON.stringify(req.params), 'Error al obtener el log del script', JSON.stringify(err));
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    insertLog(id, user, '008-003-200-001', "200", "GET", JSON.stringify(req.params), 'Log del script obtenido', JSON.stringify(result));
    res.send(result);
  });
});


module.exports = router;