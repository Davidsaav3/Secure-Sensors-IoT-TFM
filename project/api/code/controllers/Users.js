const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())
const jwt = require('jsonwebtoken');
const verifyToken = require('./token');
const SECRET_KEY = process.env.TOKEN;
const saltRounds = 10; // Adjust based on security requirements
const bcrypt = require('bcrypt');

  router.get("/get/:type/:type1/:type2/:pag_tam/:pag_pag", verifyToken, (req, res) => {  /*/ GET  /*/
    const type0 = req.params.type;
    const type1 = req.params.type1;
    const type2 = req.params.type2;
    const tam = parseInt(req.params.pag_pag);
    const act = (req.params.pag_tam - 1) * parseInt(req.params.pag_pag);
    let query = ``;
    if (type0 === 'search') {
      query += `SELECT id, email, change_password ,(SELECT COUNT(*) AS total FROM users) as total FROM users`;
      query += ` ORDER BY ${type1} ${type2}`;
    } 
    else {
      query += `SELECT id, email, change_password ,(SELECT COUNT(*) AS total FROM users WHERE email LIKE '%${type0}%' OR password LIKE '%${type0}%') as total FROM users`;
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

  router.post("/login", (req, res) => { // LOGIN
      const { email, password } = req.body;
  
      if (!email || !password) {
          return res.status(400).json({ error: 'El email y la contraseña son requeridos' });
      }
  
      const query = "SELECT * FROM users WHERE email = ?";
      con.query(query, [email], (err, result) => {
          if (err) {
              return res.status(500).json({ error: 'Error en la base de datos' });
          }
          if (result.length === 1) {
              const user = result[0];
              //console.log("Contraseña cifrada dada:", password);
              //console.log("Contraseña cifrada almacenada:", user.password);
              // Compara la contraseña introducida con la contraseña cifrada almacenada
              bcrypt.compare(password, user.password, (bcryptErr, bcryptResult) => {
                  if (bcryptErr) {
                      console.error("Error al comparar contraseñas:", bcryptErr);
                      return res.status(500).json({ error: 'Error al comparar contraseñas' });
                  }
                  //console.log("Contraseña coincidente:", bcryptResult);
                  if (bcryptResult) {
                      // Si las contraseñas coinciden, genera y devuelve el token JWT
                      const token = jwt.sign({ email: user.email }, SECRET_KEY);
                      return res.status(200).json({
                          id: user.id,
                          email: user.email,
                          token: token,
                          change_password: user.change_password,
                          message: 'Inicio de sesión exitoso'
                      });
                  } 
                  else {
                      console.warn("Credenciales incorrectas");
                      return res.status(401).json({ error: 'Credenciales incorrectas' });
                  }
              });
          } 
          else {
              console.warn("Usuario no encontrado");
              return res.status(401).json({ error: 'Credenciales incorrectas' });
          }
      });
  });
  
  
  router.get("/id/:id", verifyToken, (req, res) => {  /*/ ID  /*/
    const id = parseInt(req.params.id);
    const query = "SELECT id, email, change_password FROM users WHERE id = ?";
    con.query(query, [id,id], (err, result) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.send(result);
    });
  });

  router.get("/duplicate/:email", verifyToken, (req, res) => {  /*/ DUPLICATE  /*/
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


  router.post("", verifyToken, (req, res) => {  /*/ POST  /*/
  const { email, password, change_password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password  son requeridas' });
  }
  //console.log("Lo que me llega:", password);

  // Genera un hash de la contraseña
  bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
          return res.status(500).json({ error: 'Error al cifrar la contraseña' });
      }
      //console.log("Cifrada:", hashedPassword);

      const query = "INSERT INTO users (email, password, change_password) VALUES (?, ?, ?)";
      con.query(query, [email, hashedPassword, change_password], (err, result) => {
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
});
    
  router.put("/email", verifyToken, (req, res) => {  // UPDATE EMAIL
    const { id, email } = req.body;
    if (!id || !email) {
        return res.status(400).json({ error: 'Se requiere el ID del usuario y el nuevo correo electrónico para actualizar' });
    }

    const query = "UPDATE users SET email = ? WHERE id = ?";
    //console.log([email, id])
    con.query(query, [email, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (result.affectedRows > 0) {
            return res.status(200).json({ email: email }); // Devolver el nuevo correo electrónico actualizado
        }

        return res.status(404).json({ error: 'Registro no encontrado' });
    });
  });

  router.put("", (req, res) => {  /*/ UPDATE  /*/
      const { id, email, password, change_password } = req.body;
      if (!id && (email || password)) {
          return res.status(400).json({ error: 'Se requiere el ID del usuario y al menos un campo para actualizar' });
      }
      let query = "UPDATE users SET";
      const values = [];
      if (email) {
          query += " email=?";
          values.push(email);
      }
      if (password) {
          // Aplicar bcrypt.hash para cifrar la contraseña antes de almacenarla
          bcrypt.hash(password, 10, (err, hashedPassword) => {
              if (err) {
                  return res.status(500).json({ error: 'Error al cifrar la contraseña' });
              }
              query += ", password=?";
              values.push(hashedPassword); // Usar la contraseña cifrada
              // Continuar con la ejecución de la consulta después de cifrar la contraseña
              continueUpdateQuery();
          });
      } 
      else {
          // Si no se proporciona una nueva contraseña, continuar sin cifrarla
          continueUpdateQuery();
      }
  
      function continueUpdateQuery() {
          if (change_password != null) {
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
      }
  });
  
  router.put("/password", verifyToken, (req, res) => { // EDIT PASSWORD
    const { id, password, newpassword1, newpassword2, email } = req.body;

    if (!id || !password || !newpassword1 || !newpassword2 || !email) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    if (newpassword1 !== newpassword2) {
       return res.status(400).json({ error: 'Las nuevas contraseñas no coinciden' });
    }

    // Buscar el usuario en la base de datos
    const query = "SELECT * FROM users WHERE id = ?";
    con.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = result[0];

        // Verificar si el email coincide
        if (user.email !== email) {
            return res.status(400).json({ error: 'El email proporcionado no coincide con el registrado' });
        }

        // Comparar la contraseña antigua con la contraseña almacenada
        bcrypt.compare(password, user.password, (compareErr, compareResult) => {
            if (compareErr) {
                return res.status(500).json({ error: 'Error al comparar contraseñas' });
            }
            if (!compareResult) {
                return res.status(400).json({ error: 'Contraseña antigua incorrecta' });
            }

            // Cifrar la nueva contraseña
            bcrypt.hash(newpassword1, 10, (hashErr, hashedPassword) => {
                if (hashErr) {
                    return res.status(500).json({ error: 'Error al cifrar la nueva contraseña' });
                }

                const updateQuery = "UPDATE users SET password = ?, change_password = 0 WHERE id = ?";
                con.query(updateQuery, [hashedPassword, id], (updateErr, updateResult) => {
                    if (updateErr) {
                        return res.status(500).json({ error: 'Error al actualizar la contraseña' });
                    }
                    return res.status(200).json({ message: 'Contraseña actualizada con éxito' });
                });
            });
        });
    });
});


  
  

router.delete("", verifyToken, (req, res) => {  /*/ DELETE  /*/
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