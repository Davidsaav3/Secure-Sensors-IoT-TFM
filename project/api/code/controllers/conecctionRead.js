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

  router.get("/get/:type/:type1/:type2/:pag_tam/:pag_pag", verifyToken, (req, res) => {  /*/ GET  /*/
    const type0 = req.params.type;
    const type1 = req.params.type1;
    const type2 = req.params.type2;
    const tam = parseInt(req.params.pag_pag);
    const act = (req.params.pag_tam - 1) * parseInt(req.params.pag_pag);
    let query = ``;
    if (type0 === 'search') {
      query += `SELECT *,(SELECT COUNT(*) AS total FROM conecction_read) as total FROM conecction_read`;
      query += ` ORDER BY ${type1} ${type2}`;
    } 
    else {
      query += `SELECT *,(SELECT COUNT(*) AS total FROM conecction_read) as total FROM conecction_read`;
      query += ` WHERE description LIKE '%${type0}%' OR mqttQeue LIKE '%${type0}%' OR appID LIKE '%${type0}%' OR subscribe LIKE '%${type0}%' OR enabled LIKE '%${type0}%' ORDER BY ${type1} ${type2}`;
    }
    query += ` LIMIT ? OFFSET ?`;
    con.query(query, [tam, act], (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.email, '006-001-500-001', "500", "coneccionRead-get", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      // Descifrar el accessKey antes de enviarlo en la respuesta
      const decryptedResult = result.map(row => ({
        ...row,
        //accessKey: decryptMessage(row.accessKey, secretKey)
      }));

      // LOG - 200 //
      insertLog(req.user.id, req.user.email, '006-001-200-001', "200", "coneccionRead-get", JSON.stringify(req.params),'Datos recuperados', JSON.stringify(decryptedResult));
      res.send(decryptedResult);
    });
  });

  router.get("/id/:id", verifyToken, (req, res) => {  /*/ ID  /*/
    const id = parseInt(req.params.id);
    const query = "SELECT * FROM conecction_read WHERE id = ?";
    con.query(query, [id, id], (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.email, '006-002-500-001', "500", "coneccionRead-id", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      // Descifrar el accessKey antes de enviarlo en la respuesta
      const decryptedResult = result.map(row => ({
        ...row,
        //accessKey: decryptMessage(row.accessKey, secretKey)
      }));
      // LOG - 200 //
      insertLog(req.user.id, req.user.email, '006-002-200-001', "200", "coneccionRead-id", JSON.stringify(req.params),'Datos recuperados', "Sin datos");
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
        insertLog(req.user.id, req.user.email, '006-003-500-001', "500", "coneccionRead-duplicate", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
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
      insertLog(req.user.id, req.user.email, '006-003-200-001', "200", "coneccionRead-duplicate", JSON.stringify(req.params),'Datos duplicados', "Sin datos");
      res.json({ duplicatedescription: description_2 });
    });
  });

  router.post("", verifyToken, (req, res) => {  /*/ POST  /*/
    const { description, mqttQeue, appID, subscribe, enabled } = req.body;
    
    if (!description || !mqttQeue) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.email, '006-004-400-001', "400", "coneccionRead-post", JSON.stringify(req.parabodyms),'Description es requerido', "Sin datos");
      return res.status(400).json({ error: 'Description es requerido' });
    }

    //const encryptedMessage = encryptMessage(accessKey, secretKey);
    const query = "INSERT INTO conecction_read (description, mqttQeue, appID, subscribe, enabled) VALUES ( ?, ?, ?, ?, ?)";
    con.query(query, [description, mqttQeue, appID, subscribe, enabled], (err, result) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.email, '006-004-500-001', "500", "coneccionRead-post", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 1) {
        const insertedId = result.insertId; // Obtiene el ID insertado
        // LOG - 201 //
        insertLog(req.user.id, req.user.email, '006-004-201-001', "201", "coneccionRead-post", JSON.stringify(req.body),'Datos guardados', "Sin datos");
        return res.status(201).json({ id: insertedId }); // Devuelve el ID en la respuesta
      }
      // LOG - 500 //
      insertLog(req.user.id, req.user.email, '006-004-500-002', "500", "coneccionRead-post", JSON.stringify(req.body),'No se pudo insertar el registro', "Sin datos");
      return res.status(500).json({ error: 'No se pudo insertar el registro' });
    });
  });

  router.put("", (req, res) => {  /*/ UPDATE  /*/
  const { id, description, mqttQeue, appID, subscribe, enabled } = req.body;
  if (!id || (!description && !mqttQeue)) {
    // LOG - 400 //
    insertLog(req.user.id, req.user.email, '006-005-400-001', "400", "coneccionRead-update", JSON.stringify(req.body),'Se requiere el ID del usuario y al menos un campo para actualizar', "Sin datos");
    return res.status(400).json({ error: 'Se requiere el ID del usuario y al menos un campo para actualizar' });
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
  query += " WHERE id=?";
  values.push(id);
  con.query(query, values, (err, result) => {
    if (err) {
      // LOG - 500 //
      insertLog(req.user.id, req.user.email, '006-005-500-001', "500", "coneccionRead-update", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(err));
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (result.affectedRows > 0) {
      // LOG - 200 //
      insertLog(req.user.id, req.user.email, '002-005-200-001', "200", "coneccionRead-update", JSON.stringify(req.body),"Registro actualizado con éxito", "Sin datos");
      return res.status(200).json({ message: 'Registro actualizado con éxito' });
    }
      // LOG - 404 //
      insertLog(req.user.id, req.user.email, '006-005-404-001', "404", "coneccionRead-update", JSON.stringify(req.body),'Registro no encontrado', "Sin datos");
      return res.status(404).json({ error: 'Registro no encontrado' });
  });
});

router.delete("", verifyToken, (req, res) => {  /*/ DELETE  /*/
  const id = parseInt(req.body.id);
    if (isNaN(id)) {
    // LOG - 400 //
    insertLog(req.user.id, req.user.email, '006-006-400-001', "400", "coneccionRead-delete", JSON.stringify(req.body),'ID no válido', "Sin datos");
    return res.status(400).json({ error: 'ID no válido' });
  }
  con.query("DELETE FROM conecction_read WHERE id = ?", id, function (err, result) {
    if (err) {
      // LOG - 500 //
      insertLog(req.user.id, req.user.email, '006-006-500-001', "500", "coneccionRead-delete", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(err));
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (result.affectedRows === 0) {
      // LOG - 404 //
      insertLog(req.user.id, req.user.email, '006-006-404-001', "404", "coneccionRead-delete", JSON.stringify(req.body),'Conexion no encontrada', "Sin datos");
      return res.status(404).json({ error: 'Conexion no encontrada' });
    }

    // LOG - 200 //
    insertLog(req.user.id, req.user.email, '006-006-200-001', "200", "coneccionRead-delete", JSON.stringify(req.body),'Conexion eliminada con éxito', "Sin datos");
    res.json({ message: 'Conexion eliminada con éxito' });
  });
});

// Function to encrypt a message
function encryptMessage(message, key) {
  const encryptedMessage = CryptoJS.AES.encrypt(message, key).toString();
  return encryptedMessage;
}

// Function to decrypt a message
function decryptMessage(encryptedMessage, key) {
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, key);
  const decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
  return decryptedMessage;
}

module.exports = router;