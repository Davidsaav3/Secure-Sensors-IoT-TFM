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
      query += `SELECT *,(SELECT COUNT(*) AS total FROM data_estructure) as total FROM data_estructure`;
      query += ` ORDER BY ${type1} ${type2}`;
    } else {
      query += `SELECT *,(SELECT COUNT(*) AS total FROM data_estructure WHERE description LIKE '%${type0}%' OR configuration LIKE '%${type0}%') as total FROM data_estructure`;
      query += ` WHERE description LIKE '%${type0}%' OR configuration LIKE '%${type0}%' ORDER BY ${type1} ${type2}`;
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
    let query = `SELECT id_structure, description FROM data_estructure ORDER BY description ASC`;
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
    let query = `SELECT description FROM data_estructure`;
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
    const { description, configuration } = req.body;
    if (!description || !configuration) {
      return res.status(400).json({ error: 'Descripción y configuración son requeridas' });
    }
    const query = "INSERT INTO data_estructure (description, configuration) VALUES (?, ?)";
    con.query(query, [description, configuration], (err, result) => {
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
    const { id_structure, description, configuration } = req.body;
    if (!id_structure || (!description && !configuration)) {
      return res.status(400).json({ error: 'Se requiere el ID de la estructura y al menos un campo para actualizar' });
    }
    let query = "UPDATE data_estructure SET";
    const values = [];
    if (description) {
      query += " description=?";
      values.push(description);
    }
    if (configuration) {
      if (description) {
        query += ",";
      }
      query += " configuration=?";
      values.push(configuration);
    }
    query += " WHERE id_structure=?";
    values.push(id_structure);
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
    const id_structure = parseInt(req.body.id_structure);
      if (isNaN(id_structure)) {
      return res.status(400).json({ error: 'ID no válido' });
    }
    con.query("DELETE FROM data_estructure WHERE id_structure = ?", id_structure, function (err, result) {
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