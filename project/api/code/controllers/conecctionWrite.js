const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())
const jwt = require('jsonwebtoken');
const verifyToken = require('./token');
const SECRET_KEY = process.env.TOKEN; 

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
      query += ` WHERE description LIKE '%${type0}%' OR authorization LIKE '%${type0}%' OR urLIngest LIKE '%${type0}%' ORDER BY ${type1} ${type2}`;
    }
    query += ` LIMIT ? OFFSET ?`;
    con.query(query, [ tam, act], (err, result) => {
      if (err) {
        console.error(err);
      }
      res.send(result);
    });
  });

  router.get("/id/:id", verifyToken, (req, res) => {  /*/ ID  /*/
    const id = parseInt(req.params.id);
    const query = "SELECT * FROM conecction_write WHERE id = ?";
    con.query(query, [id,id], (err, result) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.send(result);
    });
  });

  router.get("/duplicate/:description", verifyToken, (req, res) => {  /*/ DUPLICATE  /*/
    const description = req.params.description;
    let query = `SELECT description FROM conecction_write`;
    con.query(query, (err, result) => {
      if (err) {
        console.error(err);
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
      res.json({ duplicatedescription: description_2 });
    });
  });

  router.post("", verifyToken, (req, res) => {  /*/ POST  /*/
    const { description, authorization, urlIngest } = req.body;
    
    if (!description || !authorization || !urlIngest) {
      return res.status(400).json({ error: 'Description es requerido' });
    }

    const query = "INSERT INTO conecction_write (description, authorization, urlIngest) VALUES (?, ?, ?)";
    con.query(query, [description, authorization, urlIngest], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 1) {
        const insertedId = result.insertId; // Obtiene el ID insertado
        return res.status(201).json({ id: insertedId }); // Devuelve el ID en la respuesta
      }
      return res.status(500).json({ error: 'No se pudo insertar el registro' });
    });
  });

  router.put("", (req, res) => {  /*/ UPDATE  /*/
  const { id, description, mqttQeue, appID, accessKey, subscribe, enabled } = req.body;
  if (!id || (!description && !mqttQeue)) {
    return res.status(400).json({ error: 'Se requiere el ID del usuario y al menos un campo para actualizar' });
  }
  let query = "UPDATE conecction_write SET";
  const values = [];
  if (description) {
    query += " description=?";
    values.push(description);
  }
  if (authorization) {
    query += ", authorization=?";
    values.push(authorization);
  }
  if (urlIngest) {
    query += ", urlIngest=?";
    values.push(urlIngest);
  }
 
  query += " WHERE id=?";
  values.push(id);
  con.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: 'Registro actualizado con éxito' });
    }
      return res.status(404).json({ error: 'Registro no encontrado' });
  });
});

router.delete("", verifyToken, (req, res) => {  /*/ DELETE  /*/
  const id = parseInt(req.body.id);
    if (isNaN(id)) {
    return res.status(400).json({ error: 'ID no válido' });
  }
  con.query("DELETE FROM conecction_write WHERE id = ?", id, function (err, result) {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Conexion no encontrada' });
    }
    res.json({ message: 'Conexion eliminada con éxito' });
  });
});

module.exports = router;