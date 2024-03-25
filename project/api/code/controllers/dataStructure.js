const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())
const verifyToken = require('./token');

function insertLog(user_id, username, log_code, log_status, log_name, log_parameters, log_message, log_trace, callback) {
  const log_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const query = "INSERT INTO log (user_id, username, log_date, log_code, log_status, log_name, log_parameters, log_message, log_trace) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  con.query(query, [user_id, username, log_date, log_code, log_status, log_name, log_parameters, log_message, log_trace], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    if (result.affectedRows === 1) {
      const insertedId = result.insertId;
      return callback(null, insertedId);
    }
    return callback('No se pudo insertar el registro', null);
  });
}

  router.get("/get/:type/:type1/:type2/:pag_tam/:pag_pag", verifyToken, (req, res) => {  /*/ GET  /*/
    const type0 = req.params.type;
    const type1 = req.params.type1;
    const type2 = req.params.type2;
    const tam = parseInt(req.params.pag_pag);
    const act = (req.params.pag_tam - 1) * parseInt(req.params.pag_pag);
    let query = ``;
    if (type0 === 'search') {
      query += `SELECT *,(SELECT description FROM variable_data_structure WHERE id=id_variable_data_structure LIMIT 1) as variable_description,(SELECT COUNT(*) AS total FROM data_estructure) as total FROM data_estructure`;
      query += ` ORDER BY ${type1} ${type2}`;
    } 
    else {
      query += `SELECT *,(SELECT description FROM variable_data_structure WHERE id=id_variable_data_structure LIMIT 1) as variable_description,(SELECT COUNT(*) AS total FROM data_estructure WHERE description LIKE '%${type0}%' OR configuration LIKE '%${type0}%') OR identifier_code LIKE '%${type0}%' OR id_variable_data_structure LIKE '%${type0}%' as total FROM data_estructure`;
      query += ` WHERE description LIKE '%${type0}%' OR configuration LIKE '%${type0}%' OR identifier_code LIKE '%${type0}%' OR id_variable_data_structure LIKE '%${type0}%' ORDER BY ${type1} ${type2}`;
    }
    query += ` LIMIT ? OFFSET ?`;
    con.query(query, [ tam, act], (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 200 //
        insertLog(req.user.id, req.user.username, '003-001-500-001', "500", "", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
      }

      // LOG - 200 //
      insertLog(req.user.id, req.user.username, '003-001-200-001', "200", "", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
      res.send(result);
    });
  });

  router.get("/get_list", verifyToken, (req, res) => { /*/ GET LIST /*/
    let query = `SELECT id_estructure, description FROM data_estructure ORDER BY description ASC`;
    let query_2 = `SELECT id as id_estructure, description FROM variable_data_structure ORDER BY description ASC`;

    function queryDatabase(query) {
      return new Promise((resolve, reject) => {
        con.query(query, (err, result) => {
          if (err) {
            reject(err);
          } 
          else {
            resolve(result);
          }
        });
      });
    }

    Promise.all([queryDatabase(query), queryDatabase(query_2)])
      .then((results) => {
        const [result1, result2] = results;
        
        const responseObj = {
          data_estructure: result1,
          variable_data_structure: result2,
        };

        // LOG - 200 //
        insertLog(req.user.id, req.user.username, '003-002-200-001', "200", "", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
        res.send(responseObj);
      })
      .catch((err) => {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.username, '003-002-500-001', "500", "Error en la base de datos", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
        res.status(500).json({ error: 'Error en la base de datos' });
      });
  });

  
  router.get("/duplicate/:description", verifyToken, (req, res) => {  /*/ DUPLICATE  /*/
    const description = req.params.description;
    let query = `SELECT description FROM data_estructure`;
    con.query(query, (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.username, '003-004-500-001', "500", "Error en la base de datos", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
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
      insertLog(req.user.id, req.user.username, '003-004-200-001', "200", "Elemento eliminado con éxito", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
      res.json({ duplicatedDescription: description_2 });
    });
  });

  router.post("", verifyToken, (req, res) => {  /*/ POST  /*/
    const description = req.body.description === "" ? null : req.body.description;
    const configuration = req.body.configuration === "" ? null : req.body.configuration;
    const identifier_code = req.body.identifier_code === "" ? null : req.body.identifier_code;
    const id_variable_data_structure = req.body.id_variable_data_structure === "" ? null : req.body.id_variable_data_structure;

    if (!id_variable_data_structure) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.username, '003-005-400-001', "400", "Id_variable_data_structure son requeridas", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
      return res.status(400).json({ error: 'Id_variable_data_structure son requeridas' });
    }
    const query = "INSERT INTO data_estructure (description, configuration, identifier_code, id_variable_data_structure) VALUES (?, ?, ?, ?)";
    con.query(query, [description, configuration,identifier_code, id_variable_data_structure], (err, result) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.username, '003-005-500-001', "500", "Error en la base de datos", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 1) {
        const insertedId = result.insertId;
        // LOG - 201 //
        insertLog(req.user.id, req.user.username, '003-005-201-001', "201", "", JSON.stringify(req.params),'', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
        return res.status(201).json({ id: insertedId });
      }

      // LOG - 500 //
      insertLog(req.user.id, req.user.username, '003-005-500-001', "200", "No se pudo insertar el registro", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
      return res.status(500).json({ error: 'No se pudo insertar el registro' });
    });
  });
  
  router.put("", verifyToken, (req, res) => {  /*/ UPDATE  /*/
  const id_estructure = req.body.id_estructure === "" ? null : req.body.id_estructure;
    const description = req.body.description === "" ? null : req.body.description;
    const configuration = req.body.configuration === "" ? null : req.body.configuration;
    const identifier_code = req.body.identifier_code === "" ? null : req.body.identifier_code;
    const id_variable_data_structure = req.body.id_variable_data_structure === "" ? null : req.body.id_variable_data_structure;

    if ((!id_estructure)) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.username, '003-006-400-001', "400", "Se requiere el ID de la estructura y al menos un campo para actualizar", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
      return res.status(400).json({ error: 'Se requiere el ID de la estructura y al menos un campo para actualizar' });
    }
    let query = "UPDATE data_estructure SET description=?, configuration=?, identifier_code=?, id_variable_data_structure=?";
    const values = [];
    values.push(description);
    values.push(configuration);
    values.push(identifier_code);
    values.push(id_variable_data_structure);

    query += " WHERE id_estructure=?";
    values.push(id_estructure);
    con.query(query, values, (err, result) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.username, '003-006-500-001', "500", "Error en la base de datos", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows > 0) {
        // LOG - 200 //
        insertLog(req.user.id, req.user.username, '003-006-200-001', "200", "Registro actualizado con éxito", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
        return res.status(200).json({ message: 'Registro actualizado con éxito' });
      }

      // LOG - 404 //
      insertLog(req.user.id, req.user.username, '003-006-404-001', "404", "Registro no encontrado", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
      return res.status(404).json({ error: 'Registro no encontrado' });
    });
  });

  router.delete("", verifyToken, (req, res) => {  /*/ DELETE  /*/
    const id_estructure = parseInt(req.body.id_estructure);
    if (isNaN(id_estructure)) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.username, '003-007-400-001', "400", "ID no válido", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
      return res.status(400).json({ error: 'ID no válido' });
    }
    con.query("DELETE FROM data_estructure WHERE id_estructure = ?", id_estructure, function (err, result) {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.username, '003-007-500-001', "500", "Error en la base de datos", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 0) {
        // LOG - 404 //
        insertLog(req.user.id, req.user.username, '003-007-404-001', "404", "Estructura de datos no encontrada", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
        return res.status(404).json({ error: 'Estructura de datos no encontrada' });
      }

      // LOG - 200 //
      insertLog(req.user.id, req.user.username, '003-007-200-001', "200", "", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
      res.json({ message: 'Estructura de datos eliminada con éxito' });
    });
  });

module.exports = router;