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
      query += `SELECT *,(SELECT COUNT(*) AS total FROM script) as total FROM script`;
      query += ` ORDER BY ${type1} ${type2}`;
    } 
    else {
      query += `SELECT *,(SELECT COUNT(*) AS total FROM script WHERE user LIKE '%${type0}%' OR password LIKE '%${type0}%') as total FROM script`;
      query += ` WHERE user LIKE '%${type0}%' OR password LIKE '%${type0}%' ORDER BY ${type1} ${type2}`;
    }
    query += ` LIMIT ? OFFSET ?`;
    con.query(query, [ tam, act], (err, result) => {
      if (err) {
        console.error(err);
      }
      res.send(result);
    });
  });

  router.post("/login", (req, res) => {  // POST LOGIN
    const { user, password } = req.body;
    //console.log(req.body)
    if (!user || !password) {
      return res.status(400).json({ error: 'User y Password son requeridas' });
    }

    const query = "SELECT * FROM script WHERE user = ? AND password = ?";
    //console.log(query)
    con.query(query, [user, password], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.length === 1) { 
        const user = result[0];
        const token = jwt.sign({ user }, SECRET_KEY);
        return res.status(200).json({ id: user.id, user: user.user, token: token });
      }
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    });
});


  router.get("/id/:id", verifyToken, (req, res) => {  /*/ ID  /*/
    const id = parseInt(req.params.id);
    const query = "SELECT * FROM script WHERE id = ?";
    con.query(query, [id,id], (err, result) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.send(result);
    });
  });

  router.get("/duplicate/:user", verifyToken, (req, res) => {  /*/ DUPLICATE  /*/
    const user = req.params.user;
    let query = `SELECT user FROM script`;
    con.query(query, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error en la base de datos");
      }

      let contador = 1;
      let nombresExistentes = new Set();
      for (let index = 0; index < result.length; index++) {
        nombresExistentes.add(result[index].user);
      }
      
      let user_2 = user;
      while (nombresExistentes.has(user_2)) {
        user_2 = `${user}_${contador}`;
        contador++;
      }
      res.json({ duplicateUser: user_2 });
    });
  });

  router.post("", verifyToken, (req, res) => {  /*/ POST  /*/
    const { user, password, change_password } = req.body;
    
    if (!user || !password) {
      return res.status(400).json({ error: 'User y password  son requeridas' });
    }

    const query = "INSERT INTO script (user, password, change_password) VALUES (?, ?, ?)";
    con.query(query, [user, password, change_password], (err, result) => {
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
    
  router.put("/user", verifyToken, (req, res) => {  // UPDATE EMAIL
    const { id, user } = req.body;
    if (!id || !user) {
        return res.status(400).json({ error: 'Se requiere el ID del usuario y el nuevo correo electrónico para actualizar' });
    }

    const query = "UPDATE script SET user = ? WHERE id = ?";
    con.query(query, [user, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (result.affectedRows > 0) {
            return res.status(200).json({ user: user }); // Devolver el nuevo correo electrónico actualizado
        }

        return res.status(404).json({ error: 'Registro no encontrado' });
    });
  });

  router.put("", (req, res) => {  /*/ UPDATE  /*/
  const { id, user, password, change_password } = req.body;
  if (!id || (!user && !password)) {
    return res.status(400).json({ error: 'Se requiere el ID del usuario y al menos un campo para actualizar' });
  }
  let query = "UPDATE script SET";
  const values = [];
  if (user) {
    query += " user=?";
    values.push(user);
  }
  if (password) {
    query += ", password=?";
    values.push(password);
  }
  if (password) {
    query += ", password=?";
    values.push(password);
  }
  if (change_password) {
    query += ", change_password=?";
    values.push(change_password);
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


  router.put("/password", verifyToken, (req, res) => {  // UPDATE PASSWORD
    const { id, password, newpassword1, newpassword2 } = req.body;

    if (!id || !password || !newpassword1 || !newpassword2) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    if (newpassword1 !== newpassword2) {
       return res.status(400).json({ error: 'Las nuevas contraseñas no coinciden' });
    }

    const query = "SELECT * FROM script WHERE id = ? AND password = ?";
    con.query(query, [id, password], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado o contraseña antigua incorrecta' });
      }

      const updateQuery = "UPDATE script SET password = ? WHERE id = ?";
      con.query(updateQuery, [newpassword1, id], (updateErr, updateResult) => {
        if (updateErr) {
          return res.status(500).json({ error: 'Error al actualizar la contraseña' });
        }
        return res.status(200).json({ message: 'Contraseña actualizada con éxito' });
      });
    });
});

router.delete("", verifyToken, (req, res) => {  /*/ DELETE  /*/
  const id = parseInt(req.body.id);
    if (isNaN(id)) {
    return res.status(400).json({ error: 'ID no válido' });
  }
  con.query("DELETE FROM script WHERE id = ?", id, function (err, result) {
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