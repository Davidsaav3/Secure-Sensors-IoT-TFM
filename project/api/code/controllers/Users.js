const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())

  router.get("/get/:type/:type1/:type2/:pag_tam/:pag_pag", (req, res) => {  /*/ GET  /*/
    const type0 = req.params.type;
    const type1 = req.params.type1;
    const type2 = req.params.type2;
    const tam = parseInt(req.params.pag_pag);
    const act = (req.params.pag_tam - 1) * parseInt(req.params.pag_pag);
    let query = ``;
    if (type0 === 'search') {
      query += `SELECT *,(SELECT COUNT(*) AS total FROM users) as total FROM users`;
      query += ` ORDER BY ${type1} ${type2}`;
    } else {
      query += `SELECT *,(SELECT COUNT(*) AS total FROM users WHERE email LIKE '%${type0}%' OR password LIKE '%${type0}%') as total FROM users`;
      query += ` WHERE email LIKE '%${type0}%' OR password LIKE '%${type0}%' ORDER BY ${type1} ${type2}`;
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
    let query = `SELECT id, email, password FROM users ORDER BY email ASC`;
    con.query(query, (err, result) => {
      if (err) {
        console.error(err);
      }
      res.send(result);
    });
  });

  router.get("/duplicate/:email", (req, res) => {  /*/ DUPLICATE  /*/
    const email = req.params.email;
    let query = `SELECT email FROM users`;
    con.query(query, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error en la base de datos");
      }

      let contador = 1;
      let nombresExistentes = new Set();
      for (let index = 0; index < result.length; index++) {
        nombresExistentes.add(result[index].email);
      }
      
      let email_2 = email;
      while (nombresExistentes.has(email_2)) {
        email_2 = `${email}_${contador}`;
        contador++;
      }
      res.json({ duplicateEmail: email_2 });
    });
  });

  router.post("", (req, res) => {  /*/ POST  /*/
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password  son requeridas' });
    }

    const query = "INSERT INTO users (email, password) VALUES (?, ?)";
    con.query(query, [email, password], (err, result) => {
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
    const { id, email, password } = req.body;
    if (!id || (!email && !password)) {
      return res.status(400).json({ error: 'Se requiere el ID del usuario y al menos un campo para actualizar' });
    }
    let query = "UPDATE users SET";
    const values = [];
    if (email) {
      query += " email=?";
      values.push(email);
    }
    if (password) {
      query += " password=?";
      values.push(password);
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

  router.delete("", (req, res) => {  /*/ DELETE  /*/
    const id = parseInt(req.body.id);
      if (isNaN(id)) {
      return res.status(400).json({ error: 'ID no válido' });
    }
    con.query("DELETE FROM users WHERE id = ?", id, function (err, result) {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Uusario no encontrado' });
      }
      res.json({ message: 'Uusario eliminado con éxito' });
    });
  });

module.exports = router;