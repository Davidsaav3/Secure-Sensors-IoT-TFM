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
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '003-001-500-001', "500", "GET", JSON.stringify(req.params),'Error al obtener las estructuras de datos ', JSON.stringify(err));
      }

      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '003-001-200-001', "200", "GET", JSON.stringify(req.params),'Estructuras de datos recuperadas', JSON.stringify(result));
      res.send(result);
    });
  });

  router.get("/GET", verifyToken, (req, res) => { /*/ GET LIST /*/
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
        insertLog(req.user.id, req.user.user, '003-002-200-001', "200", "GET", "",'Error al obtener la lista de estructura de datos ', JSON.stringify(results));
        res.send(responseObj);
      })
      .catch((err) => {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '003-002-500-001', "500", "GET", "",'Lista de estructura de datos recuperada', JSON.stringify(err));
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
        insertLog(req.user.id, req.user.user, '003-003-500-001', "500", "GET", JSON.stringify(req.params),'Error al duplicar la estructura de datos', JSON.stringify(err));
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
      insertLog(req.user.id, req.user.user, '003-003-200-001', "200", "GET", JSON.stringify(req.params),'Estructura de datos duplicada', "");
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
      insertLog(req.user.id, req.user.user, '003-004-400-001', "400", "POST", JSON.stringify(req.body),"Description es requerido al crear una estructura de datos", "");
      return res.status(400).json({ error: 'Id_variable_data_structure son requeridas' });
    }
    const query = "INSERT INTO data_estructure (description, configuration, identifier_code, id_variable_data_structure) VALUES (?, ?, ?, ?)";
    con.query(query, [description, configuration,identifier_code, id_variable_data_structure], (err, result) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '003-004-500-001', "500", "POST", JSON.stringify(req.body),'Error 1 al crear una estructura de datos ', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 1) {
        const insertedId = result.insertId;
        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '003-004-200-001', "200", "POST", JSON.stringify(req.body),"Estructura de datos creada", "");
        return res.status(200).json({ id: insertedId });
      }

      // LOG - 500 //
      insertLog(req.user.id, req.user.user, '003-004-500-002', "200", "POST", JSON.stringify(req.body),"Error 2 al crear una estructura de datos ", "");
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
      insertLog(req.user.id, req.user.user, '003-005-400-001', "400", "PUT", JSON.stringify(req.body),'Se requiere el ID del usuario y al menos un campo para editar la estructura de datos ', "");
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
        insertLog(req.user.id, req.user.user, '003-005-500-001', "500", "PUT", JSON.stringify(req.body),'Error al editar la estructura de datos ', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows > 0) {
        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '003-005-200-001', "200", "PUT", JSON.stringify(req.body),'Estructura de datos editada', "");
        return res.status(200).json({ message: 'Registro actualizado con éxito' });
      }

      // LOG - 404 //
      insertLog(req.user.id, req.user.user, '003-005-404-001', "404", "PUT", JSON.stringify(req.body),'Description es requerido al crear una estructura de datos ', "");
      return res.status(404).json({ error: 'Registro no encontrado' });
    });
  });

  router.delete("", verifyToken, (req, res) => {  /*/ DELETE  /*/
    const id_estructure = parseInt(req.body.id_estructure);
    if (isNaN(id_estructure)) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '003-006-400-001', "400", "DELETE", JSON.stringify(req.body),'ID no válido al borrar una estructura de datos', "");
      return res.status(400).json({ error: 'ID no válido' });
    }
    con.query("DELETE FROM data_estructure WHERE id_estructure = ?", id_estructure, function (err, result) {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '003-006-500-001', "500", "DELETE", JSON.stringify(req.body),'Error al eliminar la  estructura de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 0) {
        // LOG - 404 //
        insertLog(req.user.id, req.user.user, '003-006-404-001', "404", "DELETE", JSON.stringify(req.body),'Estructura de datos no encontrada al eliminarla', "");
        return res.status(404).json({ error: 'Estructura de datos no encontrada' });
      }

      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '003-006-200-001', "200", "DELETE", JSON.stringify(req.body),'Estructura de datos eliminada con éxito', "");
      res.json({ message: 'Datos eliminados con éxito' });
    });
  });

module.exports = router;