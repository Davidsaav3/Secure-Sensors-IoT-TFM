const express = require('express');
const router = express.Router();
let { con } = require('../middleware/mysql');
router.use(express.json())
const verifyToken = require('../middleware/token');
const insertLogScript = require('../middleware/log_script');
const insertLog = require('../middleware/log');

const { spawn } = require("child_process");

const corsMiddleware = require('../middleware/corsMiddleware');
const securityMiddleware = require('../middleware/securityMiddleware ');
router.use(corsMiddleware);
router.use(securityMiddleware);

let proceso;


  router.get("/:text_search/:order/:order_type/:pag_tam/:pag_pag", verifyToken, (req, res) => { // GET LOGS //
    const { text_search, order, order_type, pag_tam, pag_pag } = req.params;
    const { id, user } = req.user;

    const tam = parseInt(pag_pag);
    const act = (parseInt(pag_tam) - 1) * tam;
    let query = "";
    let queryParams = [];

    // Validación de parámetros de entrada
    if (!text_search || !order || !order_type || !pag_tam || !pag_pag || isNaN(tam) || isNaN(act)) {
        insertLog(req.user.id, req.user.user, '009-001-400-001', "400", "GET", JSON.stringify(req.params), 'Parámetros de entrada inválidos al obtener el log de script', '');
        return res.status(400).json({ error: 'Parámetros de entrada inválidos al obtener el log de script' });
    }

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
          console.error("Error en la consulta:", err);
          insertLog(req.user.id, req.user.user, '009-001-500-001', "500", "GET", JSON.stringify(req.params), 'Error en la base de datos al obtener el log de script', '');
          return res.status(500).json({ error: 'Error en la base de datos al obtener el log de script' });
        }
        // Validación de resultados de consulta
        if (!result || result.length === 0) {
          insertLog(req.user.id, req.user.user, '009-001-404-001', "404", "GET", JSON.stringify(req.params), 'No se encontraron resultados al obtener el log de script', '');
          return res.status(404).json({ error: 'No se encontraron resultados al obtener el log de script' });
        }
      //insertLog(req.user.id, req.user.user, '009-001-200-001', "200", "GET", JSON.stringify(req.params), 'Log de script obtenido', '');
      res.send(result);
    });
});


router.post("/script", verifyToken, (req, res) => { // ON - OFF : SCRIPT //
  const status = req.body.status;
  const { id, user } = req.user;

  // Validación de entrada
  if (status === undefined) {
    insertLog(req.user.id, req.user.user, '009-002-400-001', "400", "POST", JSON.stringify(req.body), 'Se requiere un estado para activar o desactivar el script', '');
    return res.status(400).json({ error: 'Se requiere un estado para activar o desactivar el script' });
  }

  let query = "SELECT status, date FROM script WHERE id = 0";
  con.query(query, [status], async (err, result) => {
      if (err) {
          console.error("Error en la consulta:", err);
          // Insertar registro de error en la base de datos
          insertLog(req.user.id, req.user.user, '009-002-500-001', "500", "POST", JSON.stringify(req.body), 'Error en la base de datos al activar o desactivar el script', JSON.stringify(err));
          return res.status(500).json({ error: 'Error en la base de datos al activar o desactivar el script' });
      } 
      else {
          try {
              console.log('')
              console.log('OREDEN ENTRANTE-> ' + status)
              console.log('ESTADO ACTUAL -> ' + result[0].status)
              console.log('')

              // Llamar a la función auxiliar de script
              await script_aux(status, result, id, user, req); // Pasar req aquí
              
              //insertLog(req.user.id, req.user.user, '009-002-200-001', "200", "POST", JSON.stringify(req.body), 'Estado cambiado con exito', JSON.stringify(err));
              res.status(200).json({ message: "Estado cambiado con exito" });
          } 
          catch (error) {
            insertLog(req.user.id, req.user.user, '009-002-500-002', "500", "POST", JSON.stringify(req.body), 'Error en la ejecución del script_aux en el script', JSON.stringify(err));
            res.status(500).json({ error: 'Error en la ejecución del script_aux en el script' });
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
        insertLog(id, user, '009-001-500-004', "500", "", JSON.stringify(body), 'Error al activar o desactivar el script (stderr)', '');
      });
      proceso.on('error', (error) => {
        console.error(`Error: ${error.message}`);
        insertLog(id, user, '009-001-500-005', "500", "", JSON.stringify(body), 'Error al activar o desactivar el script (error)', '');
        reject(error);
      });
      proceso.on('close', (code) => {
        console.log(`[APAGADO]-> ${code}`);
        insertLog(id, user, '009-001-500-006', "500", "", JSON.stringify(body), '`Error al activar o desactivar el script (salida con código)', '');
      });
      resolve(proceso);
    });
  }


  router.get("/script-status", verifyToken, (req, res) => {  // SCRIPT STATUS //
    const query = "SELECT date, status FROM script";
    const { id, user } = req.user;

    con.query(query, [], (err, result) => {
        if (err) {
            console.error("Error en la consulta:", err);
            // Registrar el error en el sistema de logs
            insertLog(id, user, '009-003-500-001', "500", "GET", '', 'Error al obtener el estado del script', JSON.stringify(err));
            return res.status(500).json({ error: 'Error al obtener el estado del script' });
        }
        if (result.length === 1) {
            const date = result[0].date;
            const status = result[0].status;
            // Enviar la respuesta exitosa junto con el estado y la fecha del script
            //insertLog(id, user, '009-003-500-001', "500", "GET", '', 'Error al obtener el estado del script', JSON.stringify(err));
            return res.status(200).json({ status, date });
        } 
        else {
            // Si no se encuentra el registro del script, devolver un error 404
            insertLog(id, user, '009-003-404-001', "500", "GET", '', 'No se encontró información sobre el estado del script', '');
            return res.status(404).json({ error: 'No se encontró información sobre el estado del script' });
        }
    });
});


module.exports = router;