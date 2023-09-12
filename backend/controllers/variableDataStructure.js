const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())

  /* structure //////////////////////////////////////////*/
  router.get("/get/:type/:type1/:type2/:pag_tam/:pag_pag", (req, res) => {  /*/ GET  /*/
    const type0 = req.params.type;
    const type1 = req.params.type1;
    const type2 = req.params.type2;
    const tam = parseInt(req.params.pag_pag);
    const act = (req.params.pag_tam - 1) * parseInt(req.params.pag_pag);
    let query = ``;
    if (type0 === 'Buscar') {
      query += `SELECT *,(SELECT COUNT(*) AS total FROM variable_data_structure) as total FROM variable_data_structure`;
      query += ` ORDER BY ${type1} ${type2}`;
    } else {
      query += `SELECT *,(SELECT COUNT(*) AS total FROM variable_data_structure WHERE description LIKE '%${type0}%' OR structure LIKE '%${type0}%' OR initial_byte LIKE '%${type0}%') as total FROM variable_data_structure`;
      query += ` WHERE description LIKE '%${type0}%' OR structure LIKE '%${type0}%' OR initial_byte LIKE '%${type0}%' ORDER BY ${type1} ${type2}`;
    }
    query += ` LIMIT ? OFFSET ?`;
    con.query(query, [ tam, act], (err, result) => {
      if (err) {
        console.error(err);
      }
      res.send(result);
    });
  });

  router.get("/get_list", (req, res) => {  /*/ GET LIST /*/
    let query = `SELECT id, description, structure, initial_byte FROM variable_data_structure ORDER BY description ASC`;
    con.query(query, (err, result) => {
      if (err) {
        console.error(err);
      }
      res.send(result);
    });
  });

  
  /* structure //////////////////////////////////////////*/
  router.get("/duplicate/:description", (req, res) => {  /*/ DUPLICATE  /*/
    const description = req.params.description;
    let query = `SELECT description FROM variable_data_structure`;
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
      res.send(description_2);
    });
  });

  router.post("/post", (req, res) => {  /*/ POST  /*/
    const { description, structure, initial_byte } = req.body;
    if (!description || !structure || !initial_byte) {
      return res.status(400).json({ error: 'Descripción y configuración son requeridas' });
    }
    const query = "INSERT INTO variable_data_structure (description, structure, initial_byte) VALUES (?, ?,?)";
    con.query(query, [description, structure, initial_byte], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 1) {
        const insertedId = result.insertId;
        return res.status(201).json({ id: insertedId });
      }
      return res.status(500).json({ error: 'No se pudo insertar el registro' });
    });
  });
  
  router.put("/update", (req, res) => {  /*/ UPDATE  /*/
    const { id, description, structure, initial_byte } = req.body;
    if (!id || (!description && !structure && !initial_byte)) {
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
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows > 0) {
        return res.status(200).json({ message: 'Registro actualizado con éxito' });
      }
        return res.status(404).json({ error: 'Registro no encontrado' });
    });
  });

  router.delete("/delete", (req, res) => {  /*/ DELETE  /*/
    const id = parseInt(req.body.id);
      if (isNaN(id)) {
      return res.status(400).json({ error: 'ID no válido' });
    }
    con.query("DELETE FROM variable_data_structure WHERE id = ?", id, function (err, result) {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Estructura de datos no encontrada' });
      }
      res.json({ message: 'Estructura de datos eliminada con éxito' });
    });
  });

module.exports = router;