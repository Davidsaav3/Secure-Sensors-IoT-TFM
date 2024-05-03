const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
router.use(express.json())
const verifyToken = require('../middleware/token');
const CryptoJS = require('crypto-js');
const insertLog = require('../middleware/log');
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
      query = `SELECT id, description, urlIngest, enabled, (SELECT COUNT(*) AS total FROM conecction_write) as total FROM conecction_write ORDER BY ${order} ${order_type} LIMIT ? OFFSET ?`;
      values = [tam, act];
    } 
    else {
      query = `SELECT id, description, urlIngest, enabled, (SELECT COUNT(*) AS total FROM conecction_write) as total FROM conecction_write WHERE description LIKE ? OR urLIngest LIKE ? ORDER BY ${order} ${order_type} LIMIT ? OFFSET ?`;
      const likePattern = `%${text_search}%`;
      values = [likePattern, likePattern, tam, act];
    }
  
    con.query(query, values, (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '007-001-500-001', "500", "GET", JSON.stringify(req.params), 'Error al obtener la conexión de escritura', JSON.stringify(err));
        return res.status(500).json({ error: 'Error al obtener la conexión de escritura' });
      }
      const decryptedResult = result.map(row => ({
        ...row,
        //authorization: decryptMessage(row.authorization, secretKey)
      }));
  
      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '007-001-200-001', "200", "GET", JSON.stringify(req.params), 'Conexión de escritura recuperada', JSON.stringify(decryptedResult));
      res.send(decryptedResult);
    });
  });
  

  router.get("/id/:id", verifyToken, (req, res) => { /*/ ID  /*/
    const id = parseInt(req.params.id);

    const query = "SELECT id, description, urlIngest, enabled FROM conecction_write WHERE id = ?";
    con.query(query, [id, id], (err, result) => {
        if (err) {
            console.error(err);
            // LOG - 500 - Error al obtener la conexión de escritura
            insertLog(req.user.id, req.user.user, '007-002-500-001', "500", "GET", JSON.stringify(req.params), 'Error al obtener la conexión de escritura', JSON.stringify(err));
            return res.status(500).json({ error: 'Error al obtener la conexión de escritura' });
        }
    
        const decryptedResult = result.map(row => ({
            ...row,
            //authorization: decryptMessage(row.authorization, secretKey)
        }));
        // LOG - 200 - Conexión de escritura obtenida
        insertLog(req.user.id, req.user.user, '007-002-200-001', "200", "GET", JSON.stringify(req.params), 'Conexión de escritura obtenida', "");
        res.send(decryptedResult);
    });
  });

  router.get("/duplicate/:description", verifyToken, (req, res) => { /*/ DUPLICATE  /*/
    const description = req.params.description;

    let query = `SELECT description FROM conecction_write`;
    con.query(query, (err, result) => {
        if (err) {
            console.error(err);
            // LOG - 500 - Error al duplicar la conexión de escritura
            insertLog(req.user.id, req.user.user, '007-003-500-001', "500", "GET", JSON.stringify(req.params), 'Error al duplicar la conexión de escritura', JSON.stringify(err));
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

        // LOG - 200 - Conexión de escritura duplicada
        insertLog(req.user.id, req.user.user, '007-003-200-001', "200", "GET", JSON.stringify(req.params), 'Conexión de escritura duplicada', "");
        res.json({ duplicatedescription: description_2 });
    });
  });



  router.post("", verifyToken, (req, res) => { /*/ POST  /*/
    const { description, urlIngest, enabled, authorization } = req.body;

    if (!description || !urlIngest) {
        // LOG - 400 - Description es requerido al crear una conexión de escritura
        insertLog(req.user.id, req.user.user, '007-004-400-001', "400", "POST", JSON.stringify(req.body), 'Description es requerido al crear una conexión de escritura', "");
        return res.status(400).json({ error: 'Description es requerido al crear una conexión de escritura' });
    }

    const encryptedMessage = encryptMessage(authorization, secretKey);
    const query = "INSERT INTO conecction_write (description, urlIngest, enabled, authorization) VALUES (?, ?, ?, ?)";
    con.query(query, [description, urlIngest, enabled, encryptedMessage], (err, result) => {
        if (err) {
            // LOG - 500 - Error al crear una conexión de escritura
            insertLog(req.user.id, req.user.user, '007-004-500-001', "500", "POST", JSON.stringify(req.body), 'Error al crear una conexión de escritura', JSON.stringify(err));
            return res.status(500).json({ error: 'Error al crear una conexión de escritura' });
        }
        if (result.affectedRows === 1) {
            const insertedId = result.insertId; 
            // LOG - 200 - Conexión de escritura creada
            insertLog(req.user.id, req.user.user, '007-004-200-001', "200", "POST", JSON.stringify(req.body), 'Conexión de escritura creada', "");
            return res.status(200).json({ id: insertedId });
        }
        // LOG - 500 - Error al crear una conexión de escritura
        insertLog(req.user.id, req.user.user, '007-004-500-002', "500", "POST", JSON.stringify(req.body), 'Error al crear una conexión de escritura', "");
        return res.status(500).json({ error: 'Error al crear una conexión de escritura' });
    });
  });


  router.put("", verifyToken, (req, res) => { /*/ UPDATE  /*/
    const { id, description, urlIngest, enabled, authorization } = req.body;
    
    if (!id || !description || !urlIngest) {
        // LOG - 400 - Se requiere el ID del usuario y al menos un campo para editar la conexión de escritura
        insertLog(req.user.id, req.user.user, '007-005-400-001', "400", "PUT", JSON.stringify(req.body), 'Se requiere el ID del usuario y al menos un campo para editar la conexión de escritura', "");
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
    if (authorization && authorization != '') {
        const encryptedMessage = encryptMessage(authorization, secretKey);
        query += ", authorization=?";
        values.push(encryptedMessage);
    }
    
    query += " WHERE id=?";
    values.push(id);
    con.query(query, values, (err, result) => {
        if (err) {
            // LOG - 500 - Error al editar la conexión de escritura
            insertLog(req.user.id, req.user.user, '007-005-500-001', "500", "PUT", JSON.stringify(req.body), 'Error al editar la conexión de escritura', JSON.stringify(err));
            return res.status(500).json({ error: 'Error al editar la conexión de escritura' });
        }
        if (result.affectedRows > 0) {
            // LOG - 200 - Conexión de escritura editada
            insertLog(req.user.id, req.user.user, '007-005-200-001', "200", "PUT", JSON.stringify(req.body), 'Conexión de escritura editada', "");
            return res.status(200).json({ message: 'Conexión de escritura editada' });
        }
        // LOG - 404 - Registro no encontrado al editar las conexiones de escritura
        insertLog(req.user.id, req.user.user, '007-005-404-001', "404", "PUT", JSON.stringify(req.body), 'Registro no encontrado al editar las conexiones de escritura', "");
        return res.status(404).json({ error: 'Registro no encontrado al editar las conexiones de escritura' });
    });
  });


  router.delete("", verifyToken, (req, res) => { /*/ DELETE  /*/
    const id = parseInt(req.body.id);
    if (isNaN(id)) {
        // LOG - 400 - ID no válido al borrar una conexión de escritura
        insertLog(req.user.id, req.user.user, '007-006-400-001', "400", "DELETE", JSON.stringify(req.body), 'ID no válido al borrar una conexión de escritura', "");
        return res.status(400).json({ error: 'ID no válido al borrar una conexión de escritura' });
    }
    
    const query = "DELETE FROM conecction_write WHERE id = ?";
    con.query(query, [id], function (err, result) {
        if (err) {
            // LOG - 500 - Error al eliminar la conexión de escritura
            insertLog(req.user.id, req.user.user, '007-006-500-001', "500", "DELETE", JSON.stringify(req.body), 'Error al eliminar la conexión de escritura', JSON.stringify(err));
            return res.status(500).json({ error: 'Error al eliminar la conexión de escritura' });
        }
        if (result.affectedRows === 0) {
            // LOG - 404 - Conexión de escritura no encontrada al eliminarla
            insertLog(req.user.id, req.user.user, '007-006-404-001', "404", "DELETE", JSON.stringify(req.body), 'Conexión de escritura no encontrada al eliminarla', "");
            return res.status(404).json({ error: 'Conexión de escritura no encontrada al eliminarla' });
        }
        // LOG - 200 - Conexión de escritura eliminada
        insertLog(req.user.id, req.user.user, '007-006-200-001', "200", "DELETE", JSON.stringify(req.body), 'Conexión de escritura eliminada', "");
        res.json({ message: 'Conexión de escritura eliminada' });
    });
    });


  router.post("/secret", verifyToken, (req, res) => { /*/ SECRET  /*/
  const { id, password } = req.body;
  const query = "SELECT password FROM users WHERE id = ?";

  con.query(query, [parseInt(req.user.id)], (err, result) => {
      if (err) {
          console.error(err);
          // LOG - 500 - Error al obtener la contraseña del usuario
          insertLog(req.user.id, req.user.user, '007-007-500-001', "500", "POST", JSON.stringify(req.params), 'Error al obtener la contraseña del usuario', JSON.stringify(err));
          return res.status(500).json({ error: 'Error al obtener la contraseña del usuario' });
      } 
      else {
          bcrypt.compare(password, result[0].password, (bcryptErr, bcryptResult) => {
              if (bcryptErr) {
                  console.error("Error al comparar contraseñas:", bcryptErr);
                  // LOG - 500 - Error al comparar contraseñas
                  insertLog(req.user.id, req.user.user, '007-007-500-002', "500", "POST", JSON.stringify(req.body), 'Error al comparar contraseñas', JSON.stringify(bcryptErr));
                  return res.status(500).json({ error: 'Error al comparar contraseñas' });
              }
              if (bcryptResult) {
                  const query = "SELECT authorization FROM conecction_write WHERE id = ?";
                  con.query(query, [id], (err, result) => {
                      if (err) {
                          console.error(err);
                          // LOG - 500 - Error al obtener la autorización de escritura
                          insertLog(req.user.id, req.user.user, '007-007-500-003', "500", "POST", JSON.stringify(req.params), 'Error al obtener la autorización de escritura', JSON.stringify(err));
                          return res.status(500).json({ error: 'Error al obtener la autorización de escritura' });
                      }
                      const decryptedResult = result.map(row => ({
                          authorization: decryptMessage(row.authorization, secretKey)
                      }));
                      // LOG - 200 - Autorización de escritura obtenida con éxito
                      insertLog(req.user.id, req.user.user, '007-007-200-001', "200", "POST", JSON.stringify(req.params), 'Autorización de escritura obtenida', "");
                      return res.send(decryptedResult);
                  });
              }
          });
      }
  });
});


  function encryptMessage(message, key) {
    const encryptedMessage = CryptoJS.AES.encrypt(message, key).toString();
    return encryptedMessage;
  }


  function decryptMessage(encryptedMessage, key) {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, key);
    const decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return decryptedMessage;
  }

module.exports = router;