const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
router.use(express.json())
const verifyToken = require('../middleware/token');
const insertLog = require('../middleware/log');
const CryptoJS = require('crypto-js');
const secretKey = process.env.PASSWORD_CIFRADO;
const bcrypt = require('bcrypt');

    const corsMiddleware = require('../middleware/corsMiddleware');
    const securityMiddleware = require('../middleware/securityMiddleware ');
    router.use(corsMiddleware);
    router.use(securityMiddleware);

  router.get("/:text_search/:order/:order_type/:pag_tam/:pag_pag", verifyToken, (req, res) => {  /*/ GET  /*/
    const { text_search, order, order_type, pag_tam, pag_pag } = req.params;
  
    const tam = parseInt(pag_pag);
    const act = (parseInt(pag_tam) - 1) * tam;
    let query = "";
    let values = [];
  
    if (text_search === 'search') {
      query = `SELECT id, description, mqttQeue, appID, subscribe, enabled, (SELECT COUNT(*) AS total FROM conecction_read) as total FROM conecction_read ORDER BY ? ? LIMIT ? OFFSET ?`;
      values = [order, order_type, tam, act];
    } 
    else {
      query = `SELECT id, description, mqttQeue, appID, subscribe, enabled, (SELECT COUNT(*) AS total FROM conecction_read) as total FROM conecction_read WHERE description LIKE ? OR mqttQeue LIKE ? OR appID LIKE ? OR subscribe LIKE ? OR enabled LIKE ? ORDER BY ? ? LIMIT ? OFFSET ?`;
      const likePattern = `%${text_search}%`;
      values = Array(5).fill(likePattern).concat([order, order_type, tam, act]);
    }
  
    con.query(query, values, (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '006-001-500-001', "500", "GET", JSON.stringify(req.params), 'Error al obtener la conexión de lectura', JSON.stringify(err));
        return res.status(500).json({ error: 'Error al obtener la conexión de lectura' });
      }
      const decryptedResult = result.map(row => ({
        ...row,
        //accessKey: decryptMessage(row.accessKey, secretKey)
      }));
  
      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '006-001-200-001', "200", "GET", JSON.stringify(req.params), 'Conexión de lectura recuperada', JSON.stringify(decryptedResult));
      res.send(decryptedResult);
    });
  });
  

  router.get("/id/:id", verifyToken, (req, res) => { /*/ ID  /*/
  const id = parseInt(req.params.id);

  const query = "SELECT id, description, mqttQeue, appID, subscribe, enabled FROM conecction_read WHERE id = ?";

  con.query(query, [id], (err, result) => {
      if (err) {
          console.error(err);
          // LOG - 500 //
          insertLog(req.user.id, req.user.user, '006-002-500-001', "500", "GET", JSON.stringify(req.params), 'Error al obtener la conexión de lectura por ID', JSON.stringify(err));
          return res.status(500).json({ error: 'Error en la base de datos' });
      }

      if (result.length > 0) {
          const decryptedResult = result.map(row => ({
              ...row,
              //accessKey: decryptMessage(row.accessKey, secretKey)
          }));
          // LOG - 200 - Conexión de lectura obtenida con éxito
          insertLog(req.user.id, req.user.user, '006-002-200-001', "200", "GET", JSON.stringify(req.params), 'Conexión de lectura obtenida por ID', "");
          res.json(decryptedResult);
      } 
      else {
          // LOG - 404 - Conexión de lectura no encontrada
          insertLog(req.user.id, req.user.user, '006-002-404-001', "404", "GET", JSON.stringify(req.params), 'Conexión de lectura no encontrada por ID', "");
          res.status(404).json({ error: 'Conexión de lectura no encontrada' });
      }
  });
});


  router.get("/duplicate/:description", verifyToken, (req, res) => { /*/ DUPLICATE  /*/
    const description = req.params.description;
    const query = `SELECT description FROM conecction_read`;

    con.query(query, (err, result) => {
        if (err) {
            console.error(err);
            // LOG - 500 - Error en la base de datos
            insertLog(req.user.id, req.user.user, '006-003-500-001', "500", "GET", JSON.stringify(req.params), 'Error al duplicar la conexión de lectura', JSON.stringify(err));
            return res.status(500).send("Error en la base de datos");
        }

        let existingDescriptions = new Set();
        result.forEach(row => {
            existingDescriptions.add(row.description);
        });
        let counter = 1;
        let duplicatedDescription = description;
        while (existingDescriptions.has(duplicatedDescription)) {
            duplicatedDescription = `${description}_${counter}`;
            counter++;
        }

        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '006-003-200-001', "200", "GET", JSON.stringify(req.params), 'Conexión de lectura duplicada', "");
        res.json({ duplicatedDescription });
    });
  });


  router.post("", verifyToken, (req, res) => {  /*/ POST  /*/
    const { description, mqttQeue, appID, subscribe, enabled, accessKey } = req.body;

    if (!description || !mqttQeue) {
        // LOG - 400 - Campos requeridos faltantes
        insertLog(req.user.id, req.user.user, '006-004-400-001', "400", "POST", JSON.stringify(req.body), 'Description y mqttQeue son requeridos al crear una conexión de lectura', "");
        return res.status(400).json({ error: 'Description y mqttQeue son requeridos' });
    }
    const encryptedMessage = encryptMessage(accessKey, secretKey);

    const query = "INSERT INTO conecction_read (description, mqttQeue, appID, subscribe, enabled, accessKey) VALUES (?, ?, ?, ?, ?, ?)";
    con.query(query, [description, mqttQeue, appID, subscribe, enabled, encryptedMessage], (err, result) => {
        if (err) {
            console.error(err);
            // LOG - 500 - Error en la base de datos
            insertLog(req.user.id, req.user.user, '006-004-500-001', "500", "POST", JSON.stringify(req.body), 'Error al crear una conexión de lectura', JSON.stringify(err));
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (result.affectedRows === 1) {
            const insertedId = result.insertId;
            // LOG - 200 - Conexión de lectura creada
            insertLog(req.user.id, req.user.user, '006-004-200-001', "200", "POST", JSON.stringify(req.body), 'Conexión de lectura creada', "");
            return res.status(200).json({ id: insertedId }); // Devolver el ID en la respuesta
        } 
        else {
            // LOG - 500 - No se pudo insertar el registro
            insertLog(req.user.id, req.user.user, '006-004-500-002', "500", "POST", JSON.stringify(req.body), 'Error al crear una conexión de lectura', "");
            return res.status(500).json({ error: 'No se pudo insertar el registro' });
        }
    });
    });


  router.put("", verifyToken, (req, res) => {  /*/ UPDATE  /*/
    const { id, description, mqttQeue, appID, subscribe, enabled, accessKey } = req.body;

    if (!id || !description || !mqttQeue) {
        // LOG - 400 - Campos requeridos faltantes
        insertLog(req.user.id, req.user.user, '006-005-400-001', "400", "PUT", JSON.stringify(req.body), 'Se requiere el ID del usuario y al menos un campo para editar la conexión de  lectura', "");
        return res.status(400).json({ error: 'Se requiere el ID del usuario, descripción y la cola de mqtt' });
    }

    let query = "UPDATE conecction_read SET";
    const values = [];

    if (description) {
        query += " description=?,";
        values.push(description);
    }
    if (mqttQeue) {
        query += " mqttQeue=?,";
        values.push(mqttQeue);
    }
    if (appID) {
        query += " appID=?,";
        values.push(appID);
    }
    if (subscribe) {
        query += " subscribe=?,";
        values.push(subscribe);
    }
    if (enabled) {
        query += " enabled=?,";
        values.push(enabled);
    }
    if (accessKey && accessKey !== '') {
        const encryptedMessage = encryptMessage(accessKey, secretKey);
        query += " accessKey=?,";
        values.push(encryptedMessage);
    }

    query = query.slice(0, -1); // Eliminar la coma extra al final
    query += " WHERE id=?";
    values.push(id);

    con.query(query, values, (err, result) => {
        if (err) {
            console.error(err);
            // LOG - 500 - Error en la base de datos
            insertLog(req.user.id, req.user.user, '006-005-500-001', "500", "PUT", JSON.stringify(req.body), 'Error al editar la conexión de escritura', JSON.stringify(err));
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        if (result.affectedRows > 0) {
            // LOG - 200 - Registro actualizado con éxito
            insertLog(req.user.id, req.user.user, '002-005-200-001', "200", "PUT", JSON.stringify(req.body), "Conexión de lectura editada", "");
            return res.status(200).json({ message: 'Registro actualizado con éxito' });
        } 
        else {
            // LOG - 404 - Registro no encontrado
            insertLog(req.user.id, req.user.user, '006-005-404-001', "404", "PUT", JSON.stringify(req.body), 'Registro no encontrado al editar las conexiones de  lectura', "");
            return res.status(404).json({ error: 'Registro no encontrado' });
        }
    });
  });


  router.delete("", verifyToken, (req, res) => {  /*/ DELETE  /*/
    const id = parseInt(req.body.id);
    if (isNaN(id)) {
        // LOG - 400 - ID no válido
        insertLog(req.user.id, req.user.user, '006-006-400-001', "400", "DELETE", JSON.stringify(req.body),'ID no válido al borrar una conexión de lectura', "");
        return res.status(400).json({ error: 'ID no válido' });
    }
    
    con.query("DELETE FROM conecction_read WHERE id = ?", id, function (err, result) {
        if (err) {
            console.error(err);
            // LOG - 500 - Error en la base de datos
            insertLog(req.user.id, req.user.user, '006-006-500-001', "500", "DELETE", JSON.stringify(req.body),'Error al eliminar la conexión de lectura', JSON.stringify(err));
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        if (result.affectedRows === 0) {
            // LOG - 404 - Conexión de lectura no encontrada
            insertLog(req.user.id, req.user.user, '006-006-404-001', "404", "DELETE", JSON.stringify(req.body),'Conexion de lectura no encontrada al eliminarla', "");
            return res.status(404).json({ error: 'Conexión no encontrada' });
        }

        // LOG - 200 - Conexión de lectura eliminada con éxito
        insertLog(req.user.id, req.user.user, '006-006-200-001', "200", "DELETE", JSON.stringify(req.body),'Conexión de lectura eliminada con éxito', "");
        res.json({ message: 'Conexion eliminada con éxito' });
    });
  });


  router.post("/secret", verifyToken, (req, res) => {  /*/ SECRET  /*/
      const { id, password } = req.body;
      if (!id || !password) {
          // LOG - 400 - Datos insuficientes
          insertLog(req.user.id, req.user.user, '006-007-400-001', "400", "POST", JSON.stringify(req.body),'Datos insuficientes para obtener el secreto de lectura', "");
          return res.status(400).json({ error: 'Datos insuficientes para obtener el secreto de lectura' });
      }
  
      const query = "SELECT password FROM users WHERE id = ?";
      con.query(query, [req.user.id], (err, result) => {
          if (err) {
              console.error(err);
              // LOG - 500 - Error en la base de datos
              insertLog(req.user.id, req.user.user, '006-007-500-001', "500", "POST", JSON.stringify(req.body),'Error en la base de datos al obtener la contraseña', JSON.stringify(err));
              return res.status(500).json({ error: 'Error al obtener el secreto de lectura' });
          }
          
          bcrypt.compare(password, result[0].password, (bcryptErr, bcryptResult) => {
              if (bcryptErr) {
                  console.error("Error al comparar contraseñas:", bcryptErr);
                  // LOG - 500 - Error al comparar contraseñas
                  insertLog(req.user.id, req.user.user, '006-007-500-002', "500", "POST", JSON.stringify(req.body),'Error al comparar contraseñas', JSON.stringify(bcryptErr));
                  return res.status(500).json({ error: 'Error al obtener el secreto de lectura' });
              }
              if (bcryptResult) {
                  const query = "SELECT accessKey FROM conecction_read WHERE id = ?";
                  con.query(query, [id], (err, result) => {
                      if (err) {
                          console.error(err);
                          // LOG - 500 - Error en la base de datos
                          insertLog(req.user.id, req.user.user, '006-007-500-003', "500", "POST", JSON.stringify(req.params),'Error en la base de datos al obtener el secreto de lectura', JSON.stringify(err));
                          return res.status(500).json({ error: 'Error al obtener el secreto de lectura' });
                      }
                      const decryptedResult = result.map(row => ({
                          accessKey: decryptMessage(row.accessKey, secretKey)
                      }));
                          
                      // LOG - 200 - Secreto de lectura obtenido
                      insertLog(req.user.id, req.user.user, '006-007-200-001', "200", "POST", JSON.stringify(req.params),'Secreto de lectura obtenido', "");
                      return res.send(decryptedResult);
                  });
              } 
              else {
                  // LOG - 401 - Contraseña incorrecta
                  insertLog(req.user.id, req.user.user, '006-007-401-001', "401", "POST", JSON.stringify(req.body),'Contraseña incorrecta', "");
                  return res.status(401).json({ error: 'Contraseña incorrecta' });
              }
          });
      });
  });
  

  // Cifrado
  function encryptMessage(message, key) {
    const encryptedMessage = CryptoJS.AES.encrypt(message, key).toString();
    return encryptedMessage;
  }


  // Descifrado
  function decryptMessage(encryptedMessage, key) {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, key);
    const decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return decryptedMessage;
  }

  
module.exports = router;