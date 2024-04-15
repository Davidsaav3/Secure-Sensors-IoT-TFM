const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())
const jwt = require('jsonwebtoken');
const verifyToken = require('./token');
const insertLog = require('./log');
const CryptoJS = require('crypto-js');
const secretKey = process.env.PASSWORD_CIFRADO;
const bcrypt = require('bcrypt');

  router.get("/get/:type/:type1/:type2/:pag_tam/:pag_pag", verifyToken, (req, res) => {  /*/ GET  /*/
    const type0 = req.params.type;
    const type1 = req.params.type1;
    const type2 = req.params.type2;
    const tam = parseInt(req.params.pag_pag);
    const act = (req.params.pag_tam - 1) * parseInt(req.params.pag_pag);
    let query = ``;
    if (type0 === 'search') {
      query += `SELECT id, description, mqttQeue, appID, subscribe, enabled, (SELECT COUNT(*) AS total FROM conecction_read) as total FROM conecction_read`;
      query += ` ORDER BY ${type1} ${type2}`;
    } 
    else {
      query += `SELECT id, description, mqttQeue, appID, subscribe, enabled, (SELECT COUNT(*) AS total FROM conecction_read) as total FROM conecction_read`;
      query += ` WHERE description LIKE '%${type0}%' OR mqttQeue LIKE '%${type0}%' OR appID LIKE '%${type0}%' OR subscribe LIKE '%${type0}%' OR enabled LIKE '%${type0}%' ORDER BY ${type1} ${type2}`;
    }
    query += ` LIMIT ? OFFSET ?`;
    con.query(query, [tam, act], (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '006-001-500-001', "500", "GET", JSON.stringify(req.params),'Error al obtener la conexión de lectura', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      // Descifrar el accessKey antes de enviarlo en la respuesta
      const decryptedResult = result.map(row => ({
        ...row,
        //accessKey: decryptMessage(row.accessKey, secretKey)
      }));

      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '006-001-200-001', "200", "GET", JSON.stringify(req.params),'Conexión de lectura recuperada', JSON.stringify(decryptedResult));
      res.send(decryptedResult);
    });
  });

  router.get("/id/:id", verifyToken, (req, res) => {  /*/ ID  /*/
    const id = parseInt(req.params.id);
    const query = "SELECT id, description, mqttQeue, appID, subscribe, enabled FROM conecction_read WHERE id = ?";
    con.query(query, [id, id], (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '006-002-500-001', "500", "GET", JSON.stringify(req.params),'Error al duplicar la conexión de lectura', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      // Descifrar el accessKey antes de enviarlo en la respuesta
      const decryptedResult = result.map(row => ({
        ...row,
        //accessKey: decryptMessage(row.accessKey, secretKey)
      }));
      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '006-002-200-001', "200", "GET", JSON.stringify(req.params),'Conexión de lectura duplicada', "");
      res.send(decryptedResult);
    });
  });

  router.get("/duplicate/:description", verifyToken, (req, res) => {  /*/ DUPLICATE  /*/
    const description = req.params.description;
    let query = `SELECT description FROM conecction_read`;
    con.query(query, (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '006-003-500-001', "500", "GET", JSON.stringify(req.params),'Error al duplicar la conexión de lectura', JSON.stringify(err));
        return res.status(500).send("Error en la base de datos");
      }

      let contador = 1;
      let nombresExistentes = new Set();
      for (let index = 0; index < result.length; index++) {
        nombresExistentes.add(result[index].description);
      }
      
      let description_2 = description;
      while (nombresExistentes.has(description_2)) {
        description_2 = `${description}_${contador}`;
        contador++;
      }

      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '006-003-200-001', "200", "GET", JSON.stringify(req.params),'Conexión de lectura duplicada', "");
      res.json({ duplicatedescription: description_2 });
    });
  });

  router.post("", verifyToken, (req, res) => {  /*/ POST  /*/
    const { description, mqttQeue, appID, subscribe, enabled, accessKey } = req.body;
    
    if (!description || !mqttQeue) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '006-004-400-001', "400", "POST", JSON.stringify(req.parabodyms),'Description es requerido al crear una conexión de lectura', "");
      return res.status(400).json({ error: 'Description es requerido' });
    }

    const encryptedMessage = encryptMessage(accessKey, secretKey);
    const query = "INSERT INTO conecction_read (description, mqttQeue, appID, subscribe, enabled, accessKey) VALUES ( ?, ?, ?, ?, ?, ?)";
    con.query(query, [description, mqttQeue, appID, subscribe, enabled, encryptedMessage], (err, result) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '006-004-500-001', "500", "POST", JSON.stringify(req.body),'Error 1 al crear una conexión de lectura', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 1) {
        const insertedId = result.insertId; // Obtiene el ID insertado
        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '006-004-200-001', "200", "POST", JSON.stringify(req.body),'Conexión de lectura creada', "");
        return res.status(200).json({ id: insertedId }); // Devuelve el ID en la respuesta
      }
      // LOG - 500 //
      insertLog(req.user.id, req.user.user, '006-004-500-002', "500", "POST", JSON.stringify(req.body),'Error 2 al crear una conexión de lectura', "");
      return res.status(500).json({ error: 'No se pudo insertar el registro' });
    });
  });

  router.put("", verifyToken, (req, res) => {  /*/ UPDATE  /*/
    const { id, description, mqttQeue, appID, subscribe, enabled, accessKey} = req.body;
    if (!id || (!description && !mqttQeue)) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '006-005-400-001', "400", "PUT", JSON.stringify(req.body),'Se requiere el ID del usuario y al menos un campo para editar la conexión de  lectura', "");
      return res.status(400).json({ error: 'Se requiere el ID del usuario y al menos un campo para editar la conexión de  lectura' });
    }
    let query = "UPDATE conecction_read SET";
    const values = [];
    if (description) {
      query += " description=?";
      values.push(description);
    }
    if (mqttQeue) {
      query += ", mqttQeue=?";
      values.push(mqttQeue);
    }
    if (mqttQeue) {
      query += ", mqttQeue=?";
      values.push(mqttQeue);
    }
    if (appID) {
      query += ", appID=?";
      values.push(appID);
    }
    if (subscribe) {
      query += ", subscribe=?";
      values.push(subscribe);
    }
    if (enabled) {
      query += ", enabled=?";
      values.push(enabled);
    }
    if (accessKey && accessKey!='') {
      const encryptedMessage = encryptMessage(accessKey, secretKey);
      query += ", accessKey=?";
      values.push(encryptedMessage);
    }
    query += " WHERE id=?";
    values.push(id);
    con.query(query, values, (err, result) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '006-005-500-001', "500", "PUT", JSON.stringify(req.body),'Error al editar la conexión de escritura', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows > 0) {
        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '002-005-200-001', "200", "PUT", JSON.stringify(req.body),"Conexión de  lectura editada", "");
        return res.status(200).json({ message: 'Registro actualizado con éxito' });
      }
        // LOG - 404 //
        insertLog(req.user.id, req.user.user, '006-005-404-001', "404", "PUT", JSON.stringify(req.body),'Registro no encontrado al editar las conexiones de  lectura', "");
        return res.status(404).json({ error: 'Registro no encontrado' });
    });
  });

  router.delete("", verifyToken, (req, res) => {  /*/ DELETE  /*/
    const id = parseInt(req.body.id);
      if (isNaN(id)) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '006-006-400-001', "400", "DELETE", JSON.stringify(req.body),'ID no válido al borrar una conexión de lectura', "");
      return res.status(400).json({ error: 'ID no válido' });
    }
    con.query("DELETE FROM conecction_read WHERE id = ?", id, function (err, result) {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '006-006-500-001', "500", "DELETE", JSON.stringify(req.body),'Error al eliminar la conexión de lectura', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 0) {
        // LOG - 404 //
        insertLog(req.user.id, req.user.user, '006-006-404-001', "404", "DELETE", JSON.stringify(req.body),'Conexion de lectura no encontrada al eliminarla', "");
        return res.status(404).json({ error: 'Conexion no encontrada' });
      }

      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '006-006-200-001', "200", "DELETE", JSON.stringify(req.body),'Conexión de lectura eliminada con éxito', "");
      res.json({ message: 'Conexion eliminada con éxito' });
    });
  });

  router.post("/secret", verifyToken, (req, res) => {  /*/ SECRET  /*/
  const { id, password } = req.body;
    const query = "SELECT password FROM users WHERE id = ?";
    con.query(query, [parseInt(req.user.id), parseInt(req.user.id)], (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '006-007-500-001', "500", "POST", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error 1 al obtener el secreto de lectura' });
      }
      else{
      bcrypt.compare(password, result[0].password, (bcryptErr, bcryptResult) => {
        if (bcryptErr) {
          console.error("Error al comparar contraseñas:", bcryptErr);
          // LOG - 500 //
          insertLog(req.user.id, req.user.user, '006-007-500-002', "500", "POST", JSON.stringify(req.body),'Error al comparar contraseñas', JSON.stringify(bcryptErr));
          return res.status(500).json({ error: 'Error 2 al obtener el secreto de lectura' });
        }
        if(bcryptResult){
          const query = "SELECT accessKey FROM conecction_read WHERE id = ?";
          con.query(query, [id, id], (err, result) => {
            if (err) {
              console.error(err);
              // LOG - 500 //
              insertLog(req.user.id, req.user.user, '006-007-500-003', "500", "POST", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
              return res.status(500).json({ error: 'Error 3 al obtener el secreto de lectura' });
            }
            // Descifrar el accessKey antes de enviarlo en la respuesta
            const decryptedResult = result.map(row => ({
              accessKey: decryptMessage(row.accessKey, secretKey)
            }));
              
            // LOG - 200 //
            insertLog(req.user.id, req.user.user, '006-007-200-001', "200", "POST", JSON.stringify(req.params),'Secreto de escritura obtenido', "");
            return res.send(decryptedResult);
          });
        }
      })
      }
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