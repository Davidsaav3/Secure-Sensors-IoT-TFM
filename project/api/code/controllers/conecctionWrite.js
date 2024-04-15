const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())
const jwt = require('jsonwebtoken');
const verifyToken = require('./token');
const CryptoJS = require('crypto-js');
const insertLog = require('./log');
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
      query += `SELECT id, description, urlIngest, enabled, (SELECT COUNT(*) AS total FROM conecction_write) as total FROM conecction_write`;
      query += ` ORDER BY ${type1} ${type2}`;
    } 
    else {
      query += `SELECT id, description, urlIngest, enabled, (SELECT COUNT(*) AS total FROM conecction_write) as total FROM conecction_write`;
      query += ` WHERE description LIKE '%${type0}%' OR urLIngest LIKE '%${type0}%' ORDER BY ${type1} ${type2}`;
    }
    query += ` LIMIT ? OFFSET ?`;
    con.query(query, [tam, act], (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '007-001-500-001', "500", "GET", JSON.stringify(req.params),'Error al obtener la conexión de escritura', JSON.stringify(err));
        return res.status(500).json({ error: 'Error al obtener la conexión de escritura' });
      }
      // Descifrar el authorization antes de enviarlo en la respuesta
      const decryptedResult = result.map(row => ({
        ...row,
        //authorization: decryptMessage(row.authorization, secretKey)
      }));

      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '007-001-200-001', "200", "GET", JSON.stringify(req.params),'Conexión de escritura recuperada', JSON.stringify(decryptedResult));
      res.send(decryptedResult);
    });
  });

  router.get("/id/:id", verifyToken, (req, res) => {  /*/ ID  /*/
    
    const id = parseInt(req.params.id);
    const query = "SELECT id, description, urlIngest, enabled FROM conecction_write WHERE id = ?";
    con.query(query, [id, id], (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '007-002-500-001', "500", "GET", JSON.stringify(req.params),'Error al duplicar la conexión de escritura', JSON.stringify(err));
        return res.status(500).json({ error: 'Error al duplicar la conexión de escritura' });
      }
      // Descifrar el authorization antes de enviarlo en la respuesta
      const decryptedResult = result.map(row => ({
        ...row,
        //authorization: decryptMessage(row.authorization, secretKey)
      }));

      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '007-002-200-001', "200", "GET", JSON.stringify(req.params),'Conexión de escritura duplicada', "");
      res.send(decryptedResult);
    });
  });

  router.get("/duplicate/:description", verifyToken, (req, res) => {  /*/ DUPLICATE  /*/
    const description = req.params.description;
    let query = `SELECT description FROM conecction_write`;
    con.query(query, (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '007-003-500-001', "500", "GET", JSON.stringify(req.params),'Error al duplicar la conexión de escritura', JSON.stringify(err));
        return res.status(500).send("Error al duplicar la conexión de escritura");
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
      insertLog(req.user.id, req.user.user, '007-003-200-001', "500", "GET", JSON.stringify(req.body),'Conexión de escritura duplicada', "");
      res.json({ duplicatedescription: description_2 });
    });
  });

  router.post("", verifyToken, (req, res) => {  /*/ POST  /*/
    const { description, urlIngest, enabled, authorization } = req.body;
    
    if (!description || !urlIngest) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '007-004-400-001', "400", "POST", JSON.stringify(req.body),'Description es requerido al crear una conexión de escritura', "");
      return res.status(400).json({ error: 'Description es requerido al crear una conexión de escritura' });
    }

    const encryptedMessage = encryptMessage(authorization, secretKey);
    const query = "INSERT INTO conecction_write (description, urlIngest, enabled, authorization) VALUES (?, ?, ?, ?)";
    con.query(query, [description, urlIngest, enabled, encryptedMessage], (err, result) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '007-004-500-001', "500", "POST", JSON.stringify(req.body),'Error 1 al crear una conexión de escritura', JSON.stringify(err));
        return res.status(500).json({ error: 'Error 1 al crear una conexión de escritura' });
      }
      if (result.affectedRows === 1) {
        const insertedId = result.insertId; // Obtiene el ID insertado
        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '007-004-200-001', "200", "POST", JSON.stringify(req.body),'Conexión de escritura creada', "");
        return res.status(200).json({ id: insertedId }); // Devuelve el ID en la respuesta
      }

      // LOG - 500 //
      insertLog(req.user.id, req.user.user, '007-004-500-002', "500", "POST", JSON.stringify(req.body),'Error 2 al crear una conexión de escritura', "");
      return res.status(500).json({ error: 'Error 2 al crear una conexión de escritura' });
    });
  });

  router.put("", verifyToken, (req, res) => {  /*/ UPDATE  /*/
    const { id, description, urlIngest, enabled, authorization } = req.body;
    if (!id || (!description && !urlIngest)) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '007-005-400-001', "400", "PUT", JSON.stringify(req.body),'Se requiere el ID del usuario y al menos un campo para editar la conexión de escritura', "");
      return res.status(400).json({ error: 'Se requiere el ID del usuario y al menos un campo para editar la conexión de escritura' });
    }
    let query = "UPDATE conecction_write SET";
    const values = [];
    if (description) {
      query += " description=?";
      values.push(description);
    }
    if (urlIngest) {
      query += ", urlIngest=?";
      values.push(urlIngest);
    }
    if (enabled) {
      query += ", enabled=?";
      values.push(enabled);
    } 
    if (authorization && authorization!='') {
      const encryptedMessage = encryptMessage(authorization, secretKey);
      query += ", authorization=?";
      values.push(encryptedMessage);
    }
    query += " WHERE id=?";
    values.push(id);
    con.query(query, values, (err, result) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '007-005-500-001', "500", "PUT", JSON.stringify(req.body),'Error al editar la conexión de escritura', JSON.stringify(err));
        return res.status(500).json({ error: 'Error al editar la conexión de escritura' });
      }
      if (result.affectedRows > 0) {
        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '007-005-200-001', "200", "PUT", JSON.stringify(req.body),'Conexión de escritura editada', "");
        return res.status(200).json({ message: 'Conexión de escritura editada' });
      }

      // LOG - 404 //
      insertLog(req.user.id, req.user.user, '007-005-404-001', "404", "PUT", JSON.stringify(req.body),'Registro no encontrado al editar las conexiones de escritura', "");
      return res.status(404).json({ error: 'Registro no encontrado al editar las conexiones de escritura' });
    });
  });

  router.delete("", verifyToken, (req, res) => {  /*/ DELETE  /*/
    const id = parseInt(req.body.id);
    if (isNaN(id)) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '007-006-400-001', "400", "DELETE", JSON.stringify(req.body),'ID no válido al borrar una conexión de escritura', "");
      return res.status(400).json({ error: 'ID no válido al borrar una conexión de escritura' });
    }
    con.query("DELETE FROM conecction_write WHERE id = ?", id, function (err, result) {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '007-006-500-001', "500", "DELETE", JSON.stringify(req.body),'Error al eliminar la conexión de escritura', JSON.stringify(err));
        return res.status(500).json({ error: 'Error al eliminar la conexión de escritura' });
      }
      if (result.affectedRows === 0) {
        // LOG - 404 //
        insertLog(req.user.id, req.user.user, '007-006-404-001', "404", "DELETE", JSON.stringify(req.body),'Conexión de escritura no encontrada al eliminarla', "");
        return res.status(404).json({ error: 'Conexión de escritura no encontrada al eliminarla' });
      }

      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '007-006-200-001', "200", "DELETE", JSON.stringify(req.body),'Conexión de escritura eliminada', "");
      res.json({ message: 'Conexión de escritura eliminada' });
    });
  });

  router.post("/secret", verifyToken, (req, res) => {  /*/ SECRET  /*/
  const { id, password } = req.body;
  const query = "SELECT password FROM users WHERE id = ?";
    con.query(query, [parseInt(req.user.id), parseInt(req.user.id)], (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '007-007-500-001', "500", "POST", JSON.stringify(req.params),'Error 1 al obtener el secreto de escritura', JSON.stringify(err));
        return res.status(500).json({ error: 'Error 1 al obtener el secreto de escritura' });
      }
      else{
      bcrypt.compare(password, result[0].password, (bcryptErr, bcryptResult) => {
        if (bcryptErr) {
          console.error("Error al comparar contraseñas:", bcryptErr);
          // LOG - 500 //
          insertLog(req.user.id, req.user.user, '007-007-500-002', "500", "POST", JSON.stringify(req.body),'Error 2 al obtener el secreto de escritura', JSON.stringify(bcryptErr));
          return res.status(500).json({ error: 'Error 2 al obtener el secreto de escritura' });
        }
        if(bcryptResult){
          const query = "SELECT authorization FROM conecction_write WHERE id = ?";
          con.query(query, [id, id], (err, result) => {
            if (err) {
              console.error(err);
              // LOG - 500 //
              insertLog(req.user.id, req.user.user, '007-007-500-003', "500", "POST", JSON.stringify(req.params),'Error 3 al obtener el secreto de escritura', JSON.stringify(err));
              return res.status(500).json({ error: 'Error 3 al obtener el secreto de escritura' });
            }
            // Descifrar el accessKey antes de enviarlo en la respuesta
            const decryptedResult = result.map(row => ({
              authorization: decryptMessage(row.authorization, secretKey)
            }));
              
            // LOG - 200 //
            insertLog(req.user.id, req.user.user, '007-007-200-001', "200", "POST", JSON.stringify(req.params),'Secreto de escritura obtenido', "");
            return res.send(decryptedResult);
          });
        }
      })
      }
    });
  });

  // Function to encrypt a message
  function encryptMessage(message, key) {
    const encryptedMessage = CryptoJS.AES.encrypt(message, key).toString();
    return encryptedMessage;
  }

  // Function to decrypt a message
  function decryptMessage(encryptedMessage, key) {
    //console.log(encryptedMessage)
    //console.log(key)
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, key);
    const decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return decryptedMessage;
  }

module.exports = router;