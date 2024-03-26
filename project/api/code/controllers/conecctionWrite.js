const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())
const jwt = require('jsonwebtoken');
const verifyToken = require('./token');
const CryptoJS = require('crypto-js');
const secretKey = process.env.PASSWORD_CIFRADO;
const insertLog = require('./log');

  router.get("/get/:type/:type1/:type2/:pag_tam/:pag_pag", verifyToken, (req, res) => {  /*/ GET  /*/
    
    const type0 = req.params.type;
    const type1 = req.params.type1;
    const type2 = req.params.type2;
    const tam = parseInt(req.params.pag_pag);
    const act = (req.params.pag_tam - 1) * parseInt(req.params.pag_pag);
    let query = ``;
    if (type0 === 'search') {
      query += `SELECT *,(SELECT COUNT(*) AS total FROM conecction_write) as total FROM conecction_write`;
      query += ` ORDER BY ${type1} ${type2}`;
    } 
    else {
      query += `SELECT *,(SELECT COUNT(*) AS total FROM conecction_write) as total FROM conecction_write`;
      query += ` WHERE description LIKE '%${type0}%' OR urLIngest LIKE '%${type0}%' ORDER BY ${type1} ${type2}`;
    }
    query += ` LIMIT ? OFFSET ?`;
    con.query(query, [tam, act], (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.email, '007-001-500-001', "500", "conecctionWrite-get", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      // Descifrar el accessKey antes de enviarlo en la respuesta
      const decryptedResult = result.map(row => ({
        ...row,
        //authorization: decryptMessage(row.authorization, secretKey)
      }));

      // LOG - 200 //
      insertLog(req.user.id, req.user.email, '007-001-200-001', "200", "conecctionWrite-get", JSON.stringify(req.params),'Datos obtenidos', decryptedResult);
      res.send(decryptedResult);
    });
  });

  router.get("/id/:id", verifyToken, (req, res) => {  /*/ ID  /*/
    
    const id = parseInt(req.params.id);
    const query = "SELECT * FROM conecction_write WHERE id = ?";
    con.query(query, [id, id], (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.email, '007-002-500-001', "500", "conecctionWrite-id", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      // Descifrar el accessKey antes de enviarlo en la respuesta
      const decryptedResult = result.map(row => ({
        ...row,
        //authorization: decryptMessage(row.authorization, secretKey)
      }));

      // LOG - 200 //
      insertLog(req.user.id, req.user.email, '007-002-200-001', "200", "conecctionWrite-id", JSON.stringify(req.params),'Error en la base de datos', "0");
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
        insertLog(req.user.id, req.user.email, '007-003-500-001', "500", "conecctionWrite-duplicate", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
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
      insertLog(req.user.id, req.user.email, '007-003-200-001', "500", "conecctionWrite-duplicate", JSON.stringify(req.body),'Error en la base de datos', "0");
      res.json({ duplicatedescription: description_2 });
    });
  });

  router.post("", verifyToken, (req, res) => {  /*/ POST  /*/
    const { description, urlIngest, enabled } = req.body;
    
    if (!description || !urlIngest || !enabled) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.email, '007-004-400-001', "400", "conecctionWrite-post", JSON.stringify(req.body),'Error en la base de datos', "0");
      return res.status(400).json({ error: 'Description es requerido' });
    }

    //const encryptedMessage = encryptMessage(authorization, secretKey);
    const query = "INSERT INTO conecction_write (description, urlIngest, enabled) VALUES (?, ?, ?)";
    con.query(query, [description, urlIngest, enabled], (err, result) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.email, '007-004-500-001', "500", "conecctionWrite-post", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 1) {
        const insertedId = result.insertId; // Obtiene el ID insertado
        // LOG - 201 //
        insertLog(req.user.id, req.user.email, '007-004-201-001', "201", "conecctionWrite-post", JSON.stringify(req.body),'Error en la base de datos', "0");
        return res.status(201).json({ id: insertedId }); // Devuelve el ID en la respuesta
      }

      // LOG - 500 //
      insertLog(req.user.id, req.user.email, '007-004-500-001', "500", "conecctionWrite-post", JSON.stringify(req.body),'Error en la base de datos', "0");
      return res.status(500).json({ error: 'No se pudo insertar el registro' });
    });
  });

  router.put("", (req, res) => {  /*/ UPDATE  /*/
  const { id, description, urlIngest, enabled } = req.body;
  if (!id || (!description && !urlIngest && !enabled)) {
    // LOG - 400 //
    insertLog(req.user.id, req.user.email, '007-005-400-001', "400", "conecctionWrite-update", JSON.stringify(req.body),'Se requiere el ID del usuario y al menos un campo para actualizar', "0");
    return res.status(400).json({ error: 'Se requiere el ID del usuario y al menos un campo para actualizar' });
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
 
  query += " WHERE id=?";
  values.push(id);
  con.query(query, values, (err, result) => {
    if (err) {
      // LOG - 500 //
      insertLog(req.user.id, req.user.email, '007-005-500-001', "500", "conecctionWrite-update", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(err));
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (result.affectedRows > 0) {
      // LOG - 200 //
      insertLog(req.user.id, req.user.email, '007-005-200-001', "200", "conecctionWrite-update", JSON.stringify(req.body),'Registro actualizado con éxito', "0");
      return res.status(200).json({ message: 'Registro actualizado con éxito' });
    }

    // LOG - 404 //
    insertLog(req.user.id, req.user.email, '007-005-404-001', "404", "conecctionWrite-update", JSON.stringify(req.body),'Registro no encontrado', "0");
    return res.status(404).json({ error: 'Registro no encontrado' });
  });
});

router.delete("", verifyToken, (req, res) => {  /*/ DELETE  /*/
  const id = parseInt(req.body.id);
  if (isNaN(id)) {
    // LOG - 400 //
    insertLog(req.user.id, req.user.email, '007-006-400-001', "400", "ID no válido", JSON.stringify(req.body),'ID no válido', "0");
    return res.status(400).json({ error: 'ID no válido' });
  }
  con.query("DELETE FROM conecction_write WHERE id = ?", id, function (err, result) {
    if (err) {
      // LOG - 500 //
      insertLog(req.user.id, req.user.email, '007-006-500-001', "500", "conecctionWrite-delete", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(err));
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (result.affectedRows === 0) {
      // LOG - 404 //
      insertLog(req.user.id, req.user.email, '007-006-404-001', "404", "conecctionWrite-delete", JSON.stringify(req.body),'Conexion no encontrada', "0");
      return res.status(404).json({ error: 'Conexion no encontrada' });
    }

    // LOG - 200 //
    insertLog(req.user.id, req.user.email, '007-006-200-001', "200", "conecctionWrite-delete", JSON.stringify(req.body),'Conexion eliminada con éxito', "0");
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
  //console.log(encryptedMessage)
  //console.log(key)
  
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, key);
  const decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
  return decryptedMessage;
}

module.exports = router;