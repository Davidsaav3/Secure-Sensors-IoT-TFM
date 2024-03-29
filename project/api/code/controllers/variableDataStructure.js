const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())
const verifyToken = require('./token');
const insertLog = require('./log');

  router.get("/get/:type/:type1/:type2/:pag_tam/:pag_pag", verifyToken, (req, res) => {  /*/ GET  /*/
    const type0 = req.params.type;
    const type1 = req.params.type1;
    const type2 = req.params.type2;
    const tam = parseInt(req.params.pag_pag);
    const act = (req.params.pag_tam - 1) * parseInt(req.params.pag_pag);
    let query = ``;
    if (type0 === 'search') {
      query += `SELECT *,(SELECT COUNT(*) AS total FROM variable_data_structure) as total FROM variable_data_structure`;
      query += ` ORDER BY ${type1} ${type2}`;
    } 
    else {
      query += `SELECT *,(SELECT COUNT(*) AS total FROM variable_data_structure WHERE description LIKE '%${type0}%' OR structure LIKE '%${type0}%' OR initial_byte LIKE '%${type0}%') as total FROM variable_data_structure`;
      query += ` WHERE description LIKE '%${type0}%' OR structure LIKE '%${type0}%' OR initial_byte LIKE '%${type0}%' ORDER BY ${type1} ${type2}`;
    }
    query += ` LIMIT ? OFFSET ?`;
    con.query(query, [ tam, act], (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '004-001-500-001', "500", "variableDataStructure-get", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
      }

      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '004-001-200-001', "200", "variableDataStructure-get", JSON.stringify(req.params),'Datos recuperados', JSON.stringify(result));
      res.send(result);
    });
  });

  router.get("/get_list", verifyToken, (req, res) => {  /*/ GET LIST /*/
    let query = `SELECT id, description, structure, initial_byte FROM variable_data_structure ORDER BY description ASC`;
    con.query(query, (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '004-002-500-001', "500", "variableDataStructure-get_list", "Sin datos",'Datos recuperados', JSON.stringify(err));
      }

      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '004-002-200-001', "200", "variableDataStructure-get_list", "Sin datos",'Datos recuperados', JSON.stringify(result));
      res.send(result);
    });
  });

  router.get("/duplicate/:description", verifyToken, (req, res) => {  /*/ DUPLICATE  /*/
    const description = req.params.description;
    let query = `SELECT description FROM variable_data_structure`;
    con.query(query, (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '004-003-500-001', "500", "variableDataStructure-duplicate", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
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
      insertLog(req.user.id, req.user.user, '004-003-200-001', "200", "variableDataStructure-duplicate", JSON.stringify(req.params),'Inicio de sesión exitoso', "Sin datos");
      res.json({ duplicatedDescription: description_2 });
    });
  });

  router.post("", verifyToken, (req, res) => {  /*/ POST  /*/
    const { description, structure } = req.body;
    const initial_byte = parseInt(req.body.initial_byte);
    
    if (!description || !structure) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '004-004-400-001', "400", "variableDataStructure-post", JSON.stringify(req.body),'Faltan parámetros de entrada', "Sin datos");
      return res.status(400).json({ error: 'Faltan parámetros de entrada' });
    }

    const query = "INSERT INTO variable_data_structure (description, structure, initial_byte) VALUES (?, ?, ?)";
    con.query(query, [description, structure, initial_byte], (err, result) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '004-004-500-001', "500", "variableDataStructure-post", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 1) {
        const insertedId = result.insertId; // Obtiene el ID insertado
        // LOG - 201 //
        insertLog(req.user.id, req.user.user, '004-004-201-001', "201", "variableDataStructure-post", JSON.stringify(req.body),'Datos guardados', "Sin datos");
        return res.status(201).json({ id: insertedId }); // Devuelve el ID en la respuesta
      }
      // LOG - 500 //
      insertLog(req.user.id, req.user.user, '004-004-500-002', "500", "variableDataStructure-post", JSON.stringify(req.body),'No se pudo insertar el registro', "Sin datos");
      return res.status(500).json({ error: 'No se pudo insertar el registro' });
    });
  });
    
  router.put("", verifyToken, (req, res) => {  /*/ UPDATE  /*/
    const { id, description, structure, initial_byte } = req.body;
    if (!id || (!description && !structure && !initial_byte)) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '004-005-400-001', "400", "variableDataStructure-update", JSON.stringify(req.body),'Se requiere el ID de la estructura y al menos un campo para actualizar', "Sin datos");
      return res.status(400).json({ error: 'Se requiere el ID de la estructura y al menos un campo para actualizar' });
    }
    let query = "UPDATE variable_data_structure SET";
    const values = [];
    if (description) {
      query += " description=?";
      values.push(description);
    }
    if (structure) {
      if (description) {
        query += ",";
      }
      query += " structure=?";
      values.push(structure);
    }
    if (initial_byte) {
      if (description) {
        query += ",";
      }
      query += " initial_byte=?";
      values.push(initial_byte);
    }
    query += " WHERE id=?";
    values.push(id);
    con.query(query, values, (err, result) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '004-005-500-001', "500", "variableDataStructure-update", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows > 0) {
        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '004-005-200-001', "200", "variableDataStructure-update", JSON.stringify(req.body),'Registro actualizado con éxito', "Sin datos");
        return res.status(200).json({ message: 'Registro actualizado con éxito' });
      }

      // LOG - 404 //
      insertLog(req.user.id, req.user.user, '004-005-404-001', "404", "variableDataStructure-update", JSON.stringify(req.body),'Registro no encontrado', "Sin datos");
      return res.status(404).json({ error: 'Registro no encontrado' });
    });
  });

  router.delete("", verifyToken, (req, res) => {  /*/ DELETE  /*/
    const id = parseInt(req.body.id);
    if (isNaN(id)) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '004-006-400-001', "400", "variableDataStructure-delete", JSON.stringify(req.body),'Faltan parámetros de entrada', "Sin datos");
      return res.status(400).json({ error: 'ID no válido' });
    }
    con.query("DELETE FROM variable_data_structure WHERE id = ?", id, function (err, result) {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '004-006-500-001', "500", "variableDataStructure-delete", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 0) {
        // LOG - 404 //
        insertLog(req.user.id, req.user.user, '004-006-404-001', "404", "variableDataStructure-delete", JSON.stringify(req.body),'Estructura de datos no encontrada', "Sin datos");
        return res.status(404).json({ error: 'Estructura de datos no encontrada' });
      }
      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '004-006-200-001', "200", "variableDataStructure-delete", JSON.stringify(req.body),'Datos eliminados', "Sin datos");
      res.json({ message: 'Datos eliminados' });
    });
  });

module.exports = router;