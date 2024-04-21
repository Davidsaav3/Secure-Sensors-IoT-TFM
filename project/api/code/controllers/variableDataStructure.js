const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(express.json())
const verifyToken = require('../middleware/token');
const insertLog = require('../middleware/log');

  const corsOptions = {
    origin: ['http://localhost:4200', 'https://sensors.com:5500'],
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  router.use(cors(corsOptions));

  router.use((req, res, next) => {
    // Evita que el navegador realice "sniffing" del tipo MIME
    res.setHeader('X-Content-Type-Options', 'nosniff'); 
    // Obliga al uso de HTTPS durante un período de tiempo
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'); 
    // Especifica de dónde se pueden cargar los recursos
    res.setHeader('Content-Security-Policy', "default-src 'self'; geolocation 'self'");
    // Activa el filtro XSS en los navegadores
    res.setHeader('X-XSS-Protection', '1; mode=block'); 
    // Controla cómo se envía el referente en las solicitudes HTTP
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Controla qué recursos pueden ser compartidos entre diferentes orígenes
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin'); 
    // Indica al navegador que espere y reporte certificados de transparencia
    res.setHeader('Expect-CT', 'max-age=0, report-uri="https://sensors.com:5500/report"'); 
    // Controla qué funciones o características pueden ser usadas en la página
    res.setHeader('Feature-Policy', "geolocation 'self'");
    // Permite solicitudes CORS desde el dominio del frontend
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    //res.setHeader('Access-Control-Allow-Origin', 'https://sensors.com:5500');
    // Permitir el uso de credenciales en las solicitudes CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    // Indica los métodos permitidos en las solicitudes CORS
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // Indica los encabezados permitidos en las solicitudes CORS
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

  router.get("/get/:text_search/:order/:order_type/:pag_tam/:pag_pag", verifyToken, (req, res) => { /*/ GET /*/
    const { text_search, order, order_type, pag_tam, pag_pag } = req.params;
  
    const tam = parseInt(pag_pag);
    const act = (parseInt(pag_tam) - 1) * tam;
    let query = "";
    let queryParams = [];
  
    if (text_search === "search") {
      query = `SELECT *, (SELECT COUNT(*) AS total FROM variable_data_structure) as total FROM variable_data_structure ORDER BY ? ? LIMIT ? OFFSET ?`;
      queryParams = [order, order_type, tam, act];
    } 
    else {
      query = `SELECT *, (SELECT COUNT(*) AS total FROM variable_data_structure WHERE description LIKE ? OR structure LIKE ? OR initial_byte LIKE ?) as total FROM variable_data_structure WHERE description LIKE ? OR structure LIKE ? OR initial_byte LIKE ? ORDER BY ? ? LIMIT ? OFFSET ?`;
      const likePattern = `%${text_search}%`;
      queryParams = Array(6).fill(likePattern).concat([order, order_type, tam, act]);
    }
  
    con.query(query, queryParams, (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '004-001-500-001', "500", "GET", JSON.stringify(req.params), 'Error al obtener las estructuras de datos variables', JSON.stringify(err));
        return res.status(500).send("Error interno del servidor");
      }
      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '004-001-200-001', "200", "GET", JSON.stringify(req.params), 'Estructuras de datos variables recuperadas', JSON.stringify(result));
      res.send(result);
    });
  });
  
  
  router.get("/get_list", verifyToken, (req, res) => {  /*/ GET LIST /*/
    let query = `SELECT id, description, structure, initial_byte FROM variable_data_structure ORDER BY description ASC`;
    con.query(query, (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '004-002-500-001', "500", "GET", "",'Error al obtener la lista de estructura de datos variables', JSON.stringify(err));
        return res.status(500).json({ error: 'Error al obtener la lista de estructura de datos variables' });
      }
      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '004-002-200-001', "200", "GET", "",'Lista de estructura de datos variables recuperada', JSON.stringify(result));
      res.json(result);
    });
  });


  router.get("/duplicate/:description", verifyToken, (req, res) => {  /*/ DUPLICATE  /*/
    const description = req.params.description;
    if (!description) {
      // NUEVOLOG - 400 //
      insertLog(req.user.id, req.user.user, '004-003-400-001', "400", "GET", JSON.stringify(req.params),'Descripción es requerida para duplicar la estructura de datos variable', "");
      return res.status(400).json({ error: 'Descripción es requerida para duplicar la estructura de datos variable' });
    }
  
    const escapedDescription = con.escape(description);
    let query = `SELECT description FROM variable_data_structure WHERE description = ${escapedDescription}`;
    con.query(query, (err, result) => {
      if (err) {
        console.error(err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '004-003-500-001', "500", "GET", JSON.stringify(req.params),'Error al duplicar la estructura de datos variable', JSON.stringify(err));
        return res.status(500).send("Error al duplicar la estructura de datos variable");
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
      insertLog(req.user.id, req.user.user, '004-003-200-001', "200", "GET", JSON.stringify(req.params),'Estructura de datos variable duplicada', "");
      res.json({ duplicatedDescription: description_2 });
    });
  });


  router.post("", verifyToken, (req, res) => {  /*/ POST  /*/
    const { description, structure } = req.body;
    const initial_byte = parseInt(req.body.initial_byte);
    
    if (!description || !structure || isNaN(initial_byte)) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '004-004-400-001', "400", "POST", JSON.stringify(req.body),'Descripción y estructura son requeridos, e initial_byte debe ser un número válido', "");
      return res.status(400).json({ error: 'Descripción y estructura son requeridos, e initial_byte debe ser un número válido' });
    }
  
    const query = "INSERT INTO variable_data_structure (description, structure, initial_byte) VALUES (?, ?, ?)";
    con.query(query, [description, structure, initial_byte], (err, result) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '004-004-500-001', "500", "POST", JSON.stringify(req.body),'Error al crear una estructura de datos variable', JSON.stringify(err));
        return res.status(500).json({ error: 'Error al crear una estructura de datos variable' });
      }
      if (result.affectedRows === 1) {
        const insertedId = result.insertId; 
        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '004-004-200-001', "200", "POST", JSON.stringify(req.body),'Estructura de datos variable creada', "");
        return res.status(200).json({ id: insertedId });
      }
      // LOG - 500 //
      insertLog(req.user.id, req.user.user, '004-004-500-002', "500", "POST", JSON.stringify(req.body),'Error al crear una estructura de datos variable', "");
      return res.status(500).json({ error: 'Error al crear una estructura de datos variable' });
    });
  });
  

  router.put("", verifyToken, (req, res) => { /*/ PUT /*/
    const { id, description, structure, initial_byte } = req.body;
    if (!id || (!description && !structure && !initial_byte)) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '004-005-400-001', "400", "PUT", JSON.stringify(req.body),'Se requiere el ID del usuario y al menos un campo para editar la estructura de datos variable', "");
      return res.status(400).json({ error: 'Se requiere el ID del usuario y al menos un campo para editar la estructura de datos variable' });
    }
    const query = "UPDATE variable_data_structure SET description=?, structure=?, initial_byte=? WHERE id=?";
    const values = [description, structure, initial_byte, id];
    con.query(query, values, (err, result) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '004-005-500-001', "500", "PUT", JSON.stringify(req.body),'Error al editar la estructura de datos variable', "");
        return res.status(500).json({ error: 'Error al editar la estructura de datos variable' });
      }
      if (result.affectedRows > 0) {
        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '004-005-200-001', "200", "PUT", JSON.stringify(req.body),'Estructura de datos variable editada', "");
        return res.status(200).json({ message: 'Estructura de datos variable editada' });
      }
      // LOG - 404 //
      insertLog(req.user.id, req.user.user, '004-005-404-001', "404", "PUT", JSON.stringify(req.body),'Registro no encontrado al editar la estructura de datos variable', "");
      return res.status(404).json({ error: 'Registro no encontrado al editar la estructura de datos variable' });
    });
  });
  

  router.delete("", verifyToken, (req, res) => { /*/ DELETE /*/
    const id = parseInt(req.body.id);
    if (isNaN(id) || id < 0) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '004-006-400-001', "400", "DELETE", JSON.stringify(req.body),'ID no válido al borrar una estructura de datos variable', "");
      return res.status(400).json({ error: 'ID no válido al borrar una estructura de datos variable' });
    }
    con.query("SELECT * FROM variable_data_structure WHERE id = ?", id, function (err, rows) {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '004-006-500-001', "500", "DELETE", JSON.stringify(req.body),'Error al buscar la estructura de datos variable', "");
        return res.status(500).json({ error: 'Error al buscar la estructura de datos variable' });
      }
      if (rows.length === 0) {
        // LOG - 404 //
        insertLog(req.user.id, req.user.user, '004-006-404-001', "404", "DELETE", JSON.stringify(req.body),'Estructura de datos variable no encontrada al eliminarla', "");
        return res.status(404).json({ error: 'Estructura de datos variable no encontrada al eliminarla' });
      }
      con.query("DELETE FROM variable_data_structure WHERE id = ?", id, function (err, result) {
        if (err) {
          // NUEVOLOG - 500 //
          insertLog(req.user.id, req.user.user, '004-006-500-002', "500", "DELETE", JSON.stringify(req.body),'Error al eliminar la estructura de datos variable', "");
          return res.status(500).json({ error: 'Error al eliminar la estructura de datos variable' });
        }
        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '004-006-200-001', "200", "DELETE", JSON.stringify(req.body),'Estructura de datos variable eliminada con éxito', "");
        res.json({ message: 'Estructura de datos variable eliminada con éxito' });
      });
    });
  });
  
module.exports = router;