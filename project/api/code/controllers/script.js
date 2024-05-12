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
  if (status === undefined) { // != 1 o 0
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
            if(process.env.verbose){
              //console.log('')
              //console.log('Estado ENTRANTE-> ' + status)
              //console.log('ESTADO ACTUAL -> ' + result[0].status)
              //console.log('')
            }

              // Llamar a la función auxiliar de script
              await script_aux(status, result, id, user, req.body.status); // Pasar req aquí
              
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



  async function script_aux(status, result, id, user, status2) { // Agregar req como parámetro
    return new Promise(async (resolve, reject) => {
      
      let aux = (new Date(result[0].date).getTime() + 5000) > Date.now() ? 1 : 0;
      console.log('')
      console.log('Estado ENTRANTE-> ' + status)
      console.log('ESTADO ACTUAL -> ' + aux)
      console.log('')
    
      if (status == 1 && aux==0) {
        proceso = await runScript(id, user, status2);
        if(process.env.verbose) console.log(proceso.status)
        if (proceso) { 
          if(process.env.verbose) console.log("--- SCRIPT ENCENDIDO ---");
          if(process.env.verbose) console.log("");
          insertLogScript(id, user, 1, '');
        }
        else{
          if(process.env.verbose) console.log("Error al arrancar el Script")
        }
      }

      if (status == 0 && aux==1) {
          try {
            proceso.kill();
            if (process.env.verbose) {
                console.log("--- SCRIPT APAGADO ---"); 
                console.log("");
            }
            insertLogScript(id, user, 0, '');
        } 
        catch (error) {
          insertLog(id, user, '009-001-600-006', "600", "", status2, 'Error al apagar el script', JSON.stringify(error));
          console.error("Ocurrió un error:", error);
        }
      }

      resolve();
    });
  }

  async function runScript(id, user, status2) { // RUN SCRIPT //
    return new Promise((resolve, reject) => {
      try {
        let proceso = spawn('node', ['../code/ingestador/sensors']); 
        if (!proceso) {
          if (process.env.verbose) console.log("CATCH")
          insertLog(id, user, '009-001-600-001', "600", "Ruta no encontrada en el script", status2, '', error);
          resolve(null);
          return;
        }
  
        proceso.stdout.on('data', (data) => {
          if (process.env.verbose) console.log(`[SALIDA]-> ${data}`);
        });
        proceso.stderr.on('stderr', (stderr) => {
          console.error(`stderr: ${stderr}`);
          insertLog(id, user, '009-001-600-002', "600", "", status2, 'STD-Error en el script (stderr): ', JSON.stringify(stderr));
        });
        proceso.on('error', (error) => {
          console.error(`Error: ${error.message}`);
          insertLog(id, user, '009-001-600-003', "600", "", status2, 'Error en el script (error): ', JSON.stringify(error));
          reject(error);
        });
        proceso.on('close', (code) => {
          if (process.env.verbose) console.log(`[APAGADO]`);
          insertLog(id, user, '009-001-600-004', "600", "", status2, 'Proceso recibe señal de cerrado (salida con código)', JSON.stringify(code));
        });
        resolve(proceso);
      } 
      catch (error) {
        console.error(`Error en la ejecución del script: ${error.message}`);
        insertLog(id, user, '009-001-600-005', "600", "", status2, 'Error en la ejecución del script', JSON.stringify(error));
        reject(error);
      }
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