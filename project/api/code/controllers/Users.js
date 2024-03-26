const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())
const jwt = require('jsonwebtoken');
const verifyToken = require('./token');
const SECRET_KEY = process.env.TOKEN;
const REFRESH_SECRET_KEY = process.env.TOKEN_REFRESH;
const bcrypt = require('bcrypt');
const insertLog = require('./log');

  router.get("/get/:type/:type1/:type2/:pag_tam/:pag_pag", verifyToken, (req, res) => {  /*/ GET  /*/
    const type0 = req.params.type;
    const type1 = req.params.type1;
    const type2 = req.params.type2;
    const tam = parseInt(req.params.pag_pag);
    const act = (req.params.pag_tam - 1) * parseInt(req.params.pag_pag);
    let query = ``;
    if (type0 === 'search') {
      query += `SELECT id, email, change_password, enabled,(SELECT COUNT(*) AS total FROM users) as total FROM users`;
      query += ` ORDER BY ${type1} ${type2}`;
    } 
    else {
      query += `SELECT id, email, change_password , enabled, (SELECT COUNT(*) AS total FROM users WHERE email LIKE '%${type0}%' OR password LIKE '%${type0}%') as total FROM users`;
      query += ` WHERE email LIKE '%${type0}%' OR password LIKE '%${type0}%' ORDER BY ${type1} ${type2}`;
    }
    query += ` LIMIT ? OFFSET ?`;
    con.query(query, [ tam, act], (err, result) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.email, '005-001-500-001', "500", "users-get", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
        console.error(err);
      }
      // LOG - 200 //
      insertLog(req.user.id, req.user.email, '005-001-200-001', "200", "users-get", JSON.stringify(req.params),'Datos obtenidos', JSON.stringify(result));
      res.send(result);
    });
  });


  router.post("/login", (req, res) => { // LOGIN //
    const { email, password } = req.body;

    if (!email || !password) {
      // LOG - 400 //
      insertLog("0", email, '005-002-400-001', "400", "users-login", JSON.stringify(req.body),'El email y la contraseña son requeridos', "0");
      return res.status(400).json({ error: 'El email y la contraseña son requeridos' });
    }

    const selectQuery = "SELECT * FROM users WHERE email = ?";
    con.query(selectQuery, [email], (err, result) => {
        if (err) {
          // LOG - 500 //
          insertLog("0", email, '005-002-500-002', "500", "users-login", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(err));
          return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (result.length === 1) {
            const user = result[0];

            // comp contraseñas
            bcrypt.compare(password, user.password, (bcryptErr, bcryptResult) => {
                if (bcryptErr) {
                    console.error("Error al comparar contraseñas:", bcryptErr);
                    // LOG - 500 //
                    insertLog(req.user.id, req.user.email, '005-002-500-003', "500", "users-login", JSON.stringify(req.body),'Error al comparar contraseñas', JSON.stringify(bcryptErr));
                    return res.status(500).json({ error: 'Error al comparar contraseñas' });
                }

                if (bcryptResult) {
                    // Verificar si el token_refresh aún es válido
                    if (user.token) {
                        jwt.verify(user.token, REFRESH_SECRET_KEY, (verifyErr, decoded) => {
                            if (verifyErr) {
                                // El token ha caducado o es inválido, generar uno nuevo
                                const newRefreshToken = jwt.sign({ email: user.email, id: user.id }, REFRESH_SECRET_KEY, { expiresIn: process.env.REFRESH_TOKE_TIME });

                                // Actualizar el nuevo token_refresh en la base de datos
                                const updateQuery = "UPDATE users SET token = ? WHERE id = ?";
                                con.query(updateQuery, [newRefreshToken, user.id], (updateErr, updateResult) => {
                                    if (updateErr) {
                                      console.error("Error al actualizar token_refresh en la base de datos:", updateErr);
                                      // LOG - 500 //
                                      insertLog(user.id, user.email, '005-002-500-004', "500", "users-login", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(updateErr));
                                      return res.status(500).json({ error: 'Error en la base de datos' });
                                    }

                                    // Generar nuevo token de acceso
                                    const accessToken = jwt.sign({ email: user.email, id: user.id, date: new Date().toISOString() }, SECRET_KEY, { expiresIn: process.env.ACCES_TOKE_TIME });
                                    // LOG - 200 //
                                    insertLog(user.id, user.email, '005-002-200-001', "200", "users-login", JSON.stringify(req.body),'Inicio de sesión exitoso', "0");
                                    return res.status(200).json({
                                        id: user.id,
                                        email: user.email,
                                        token: accessToken,
                                        refresh_token: newRefreshToken,
                                        change_password: user.change_password,
                                        enabled: user.enabled,
                                        message: 'Inicio de sesión exitoso'
                                    });
                                });
                            } 
                            else {
                                // El token_refresh aún es válido, usar el token actual
                                const accessToken = jwt.sign({ email: user.email, id: user.id, date: new Date().toISOString() }, SECRET_KEY, { expiresIn: process.env.ACCES_TOKE_TIME });
                                // LOG - 200 //
                                insertLog(user.id, user.email, '005-002-200-002', "200", "users-login", JSON.stringify(req.body),'Inicio de sesión exitoso', "0");
                                return res.status(200).json({
                                    id: user.id,
                                    email: user.email,
                                    token: accessToken,
                                    refresh_token: user.token,
                                    change_password: user.change_password,
                                    message: 'Inicio de sesión exitoso'
                                });
                            }
                        });
                    } 
                    else {
                        // No hay token_refresh existente, generar uno nuevo
                        const refreshToken = jwt.sign({ email: user.email, id: user.id }, REFRESH_SECRET_KEY, { expiresIn: process.env.REFRESH_TOKE_TIME }); 

                        // Actualizar el nuevo token_refresh en la base de datos
                        const updateQuery = "UPDATE users SET token = ? WHERE id = ?";
                        con.query(updateQuery, [refreshToken, user.id], (updateErr, updateResult) => {
                            if (updateErr) {
                              console.error("Error al actualizar token_refresh en la base de datos:", updateErr);
                              // LOG - 500 //
                              insertLog(user.id, user.email, '005-002-500-005', "500", "users-login", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(updateErr));                                
                              return res.status(500).json({ error: 'Error en la base de datos' });
                            }

                            // Generar nuevo token de acceso
                            const accessToken = jwt.sign({ email: user.email, id: user.id, date: new Date().toISOString() }, SECRET_KEY, { expiresIn: process.env.ACCES_TOKE_TIME });
                            
                            // LOG - 200 //
                            insertLog(user.id, user.email, '005-002-200-003', "200", "users-login", JSON.stringify(req.body),'Inicio de sesión exitoso', "0");
                            return res.status(200).json({
                                id: user.id,
                                email: user.email,
                                token: accessToken,
                                refresh_token: refreshToken,
                                change_password: user.change_password,
                                enabled: user.enabled,
                                message: 'Inicio de sesión exitoso'
                            });
                        });
                    }
                } 
                else {
                    console.warn("Credenciales incorrectas");
                    // LOG - 401 //
                    insertLog("0", "0", '005-002-401-001', "401", "users-login", JSON.stringify(req.body),'Credenciales incorrectas', "0");
                    return res.status(401).json({ error: 'Credenciales incorrectas' });
                }
            });
        } 
        else {
            console.warn("Usuario no encontrado");
            // LOG - 401 //
            insertLog("0", "0", '005-002-401-002', "401", "users-login", JSON.stringify(req.body),'Credenciales incorrectas', "0");
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }
    });
});
  
  router.get("/id/:id", verifyToken, (req, res) => {  /*/ ID  /*/
    const id = parseInt(req.params.id);
    const query = "SELECT id, email, change_password, enabled FROM users WHERE id = ?";
    con.query(query, [id,id], (err, result) => {
      if (err) {
        console.error("Error:", err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.email, '005-003-500-001', "500", "users-id", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      // LOG - 200 //
      insertLog(req.user.id, req.user.email, '005-003-200-001', "200", "users-id", JSON.stringify(req.params),'Datos obtenidos', JSON.stringify(result));
      res.send(result);
    });
  });

  
  router.put("/password", verifyToken, (req, res) => { // PUT PASSWORD //
    const { newpassword, password } = req.body;
    const tokenX = req.headers['authorization'];
  
    if (!newpassword || !password) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.email, '005-004-400-001', "400", "users-password", JSON.stringify(req.body),'Nuevo password y password actual son requeridos', "0");
      return res.status(400).json({ error: 'Nuevo password y password actual son requeridos' });
    }
  
    jwt.verify(tokenX, SECRET_KEY, (err, decodedToken) => {
      if (err) {
        // LOG - 401 //
        insertLog(req.user.id, req.user.email, '005-004-401-001', "401", "users-password", JSON.stringify(req.body),'Token no válido', JSON.stringify(err));
        return res.status(401).json({ error: 'Token no válido' });
      }
  
      const { id: userId, email: userEmail } = decodedToken;
      // Verificar la contraseña actual
      const queryCheckPassword = "SELECT password FROM users WHERE id = ? AND email = ?";
      con.query(queryCheckPassword, [userId, userEmail], (err, resultCheckPassword) => {
        if (err) {
          // LOG - 401 //
          insertLog(req.user.id, req.user.email, '005-004-401-002', "401", "users-password", JSON.stringify(req.body),'Error en la base de datos', "0");
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
  
        if (resultCheckPassword.length === 1) {
          const hashedCurrentPassword = resultCheckPassword[0].password;
  
          // Comparar la contraseña actual con la proporcionada
          bcrypt.compare(password, hashedCurrentPassword, (err, passwordMatch) => {
            if (err || !passwordMatch) {
              // LOG - 401 //
              insertLog(req.user.id, req.user.email, '005-004-401-001', "401", "users-password", JSON.stringify(req.body),'La contraseña actual no es válida', JSON.stringify(err));
              return res.status(401).json({ error: 'La contraseña actual no es válida' });
            }
  
            // La contraseña actual coincide, proceder con la actualización de la contraseña
            bcrypt.hash(newpassword, 10, (err, hashedPassword) => {
              if (err) {
                // LOG - 401 //
                insertLog(req.user.id, req.user.email, '005-004-401-001', "401", "users-password", JSON.stringify(req.body),'Error al cifrar la nueva contraseña', JSON.stringify(err));
                return res.status(500).json({ error: 'Error al cifrar la nueva contraseña' });
              }
  
              const queryUpdatePassword = "UPDATE users SET password = ?, change_password = ? WHERE id = ? AND email = ?";
              con.query(queryUpdatePassword, [hashedPassword, 1, userId, userEmail], (err, result) => {
                if (err) {
                  // LOG - 401 //
                  insertLog(req.user.id, req.user.email, '005-004-401-002', "401", "users-password", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(err));
                  return res.status(500).json({ error: 'Error en la base de datos' });
                }
                if (result.affectedRows === 1) {
                  // LOG - 401 //
                  insertLog(req.user.id, req.user.email, '005-004-401-003', "401", "users-password", JSON.stringify(req.body),'Contraseña actualizada correctamente', "0");
                  return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
                }
                // LOG - 401 //
                insertLog(req.user.id, req.user.email, '005-004-401-004', "401", "users-password", JSON.stringify(req.body),'No se pudo actualizar el registro', "0");
                return res.status(500).json({ error: 'No se pudo actualizar el registro' });
              });
            });
          });
        } 
        else {
          // LOG - 401 //
          insertLog(req.user.id, req.user.email, '005-004-401-005', "401", "users-password", JSON.stringify(req.body),'Usuario no encontrado', "0");
          return res.status(401).json({ error: 'Usuario no encontrado' });
        }
      });
    });
  });
  
  
    
  router.put("/email", verifyToken, (req, res) => { // PUT EMAIL //
    const { email: newEmail } = req.body;
    const tokenX = req.headers['authorization'];

    if (!newEmail) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.email, '005-004-401-001', "401", "users-email", JSON.stringify(req.body),'Se requiere el nuevo correo electrónico para actualizar', "0");
      return res.status(400).json({ error: 'Se requiere el nuevo correo electrónico para actualizar' });
    }
  
    jwt.verify(tokenX, SECRET_KEY, (err, decodedToken) => {
      if (err) {
        // LOG - 401 //
        insertLog(req.user.id, req.user.email, '005-004-401-002', "401", "users-email", JSON.stringify(req.body),'Token no válido', JSON.stringify(err));
        return res.status(401).json({ error: 'Token no válido' });
      }
  
      const { id: userId, email: userEmail } = decodedToken;
      const query = "UPDATE users SET email = ? WHERE id = ? AND email = ?";
      con.query(query, [newEmail, userId, userEmail], (err, result) => {
        if (err) {
          // LOG - 500 //
          insertLog(req.user.id, req.user.email, '005-004-401-003', "401", "users-email", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(err));
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
  
        if (result.affectedRows > 0) {
          // LOG - 200 //
          insertLog(req.user.id, req.user.email, '005-004-401-004', "401", "users-email", JSON.stringify(req.body),'Datos actualizados', "0");
          return res.status(200).json({ email: newEmail }); // Devolver el nuevo correo
        }
  
        // LOG - 404 //
        insertLog(req.user.id, req.user.email, '005-004-401-005', "401", "users-email", JSON.stringify(req.body),'Registro no encontrado', "0");
        return res.status(404).json({ error: 'Registro no encontrado' });
      });
    });
  });

  router.put("", (req, res) => {  /*/ UPDATE  /*/
      const { id, email, password, change_password, enabled, token } = req.body;
      if (!id && (email || password)) {
        // LOG - 400 //
        insertLog(req.user.id, req.user.email, '005-004-400-001', "400", "users-update", JSON.stringify(req.params),'Se requiere el ID del usuario y al menos un campo para actualizar', "0");
        return res.status(400).json({ error: 'Se requiere el ID del usuario y al menos un campo para actualizar' });
      }
      let query = "UPDATE users SET";
      const values = [];
      if (email) {
          query += " email=?";
          values.push(email);
      }
      if (token && token==true) {
        query += ", token=?";
        values.push('');
      }
      if (enabled && enabled==true) {
        query += ", enabled=?";
        values.push('');
      }
      if (password) {
          // Cifrar la contraseña antes de almacenarla
          bcrypt.hash(password, 10, (err, hashedPassword) => {
              if (err) {
                // LOG - 500 //
                insertLog(req.user.id, req.user.email, '005-004-500-002', "500", "users-update", JSON.stringify(req.params),'Error al cifrar la contraseña', JSON.stringify(err));
                return res.status(500).json({ error: 'Error al cifrar la contraseña' });
              }
              query += ", password=?";
              values.push(hashedPassword); // Usar la contraseña cifrada
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
          if (enabled != null) {
            query += ", enabled=?";
            values.push(enabled);
        }
          query += " WHERE id=?";
          values.push(id);

          con.query(query, values, (err, result) => {
              if (err) {
                // LOG - 500 //
                insertLog(req.user.id, req.user.email, '005-004-401-003', "401", "users-update", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
                return res.status(500).json({ error: 'Error en la base de datos' });
              }
              if (result.affectedRows > 0) {
                // LOG - 200 //
                insertLog(req.user.id, req.user.email, '005-004-401-001', "401", "users-update", JSON.stringify(req.params),'Registro actualizado con éxito', "0");
                return res.status(200).json({ message: 'Registro actualizado con éxito' });
              }
              // LOG - 404 //
              insertLog(req.user.id, req.user.email, '005-004-401-001', "401", "users-update", JSON.stringify(req.params),'Registro no encontrado', "0");
              return res.status(404).json({ error: 'Registro no encontrado' });
          });
      }
  });
  
  /*router.put("/password", verifyToken, (req, res) => { // EDIT PASSWORD
    const { id, password, newpassword, email } = req.body;

    if (!id || !password || !newpassword || !email) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.email, '005-004-401-001', "401", "users-password", JSON.stringify(req.params),'Inicio de sesión exitoso', JSON.stringify(err));
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Buscar el usuario en la base de datos
    const query = "SELECT * FROM users WHERE id = ?";
    con.query(query, [id], (err, result) => {
        if (err) {
          // LOG - 500 //
          insertLog(req.user.id, req.user.email, '005-004-401-001', "401", "users-password", JSON.stringify(req.params),'Inicio de sesión exitoso', JSON.stringify(err));
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
        if (result.length === 0) {
          // LOG - 404 //
          insertLog(req.user.id, req.user.email, '005-004-401-001', "401", "users-password", JSON.stringify(req.params),'Inicio de sesión exitoso', JSON.stringify(err));
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const user = result[0];

        // Verificar si el email coincide
        if (user.email !== email) {
          // LOG - 400 //
          insertLog(req.user.id, req.user.email, '005-004-401-001', "401", "users-password", JSON.stringify(req.params),'Inicio de sesión exitoso', JSON.stringify(err));
          return res.status(400).json({ error: 'El email proporcionado no coincide con el registrado' });
        }

        // Comparar la contraseña antigua con la contraseña almacenada
        bcrypt.compare(password, user.password, (compareErr, compareResult) => {
            if (compareErr) {
              // LOG - 500 //
              insertLog(req.user.id, req.user.email, '005-004-401-001', "401", "users-password", JSON.stringify(req.params),'Inicio de sesión exitoso', JSON.stringify(err));
              return res.status(500).json({ error: 'Error al comparar contraseñas' });
            }
            if (!compareResult) {
              // LOG - 400 //
              insertLog(req.user.id, req.user.email, '005-004-401-001', "401", "users-password", JSON.stringify(req.params),'Inicio de sesión exitoso', JSON.stringify(err));
              return res.status(400).json({ error: 'Contraseña antigua incorrecta' });
            }

            // Cifrar la nueva contraseña
            bcrypt.hash(newpassword, 10, (hashErr, hashedPassword) => {
                if (hashErr) {
                  // LOG - 500 //
                  insertLog(req.user.id, req.user.email, '005-004-401-001', "401", "users-password", JSON.stringify(req.params),'Inicio de sesión exitoso', JSON.stringify(err));
                  return res.status(500).json({ error: 'Error al cifrar la nueva contraseña' });
                }

                const updateQuery = "UPDATE users SET password = ?, change_password = 0 WHERE id = ?";
                con.query(updateQuery, [hashedPassword, id], (updateErr, updateResult) => {
                    if (updateErr) {
                      // LOG - 500 //
                      insertLog(req.user.id, req.user.email, '005-004-401-001', "401", "users-password", JSON.stringify(req.params),'Inicio de sesión exitoso', JSON.stringify(err));
                      return res.status(500).json({ error: 'Error al actualizar la contraseña' });
                    }
                    // LOG - 200 //
                    insertLog(req.user.id, req.user.email, '005-004-401-001', "401", "users-password", JSON.stringify(req.params),'Inicio de sesión exitoso', JSON.stringify(err));
                    return res.status(200).json({ message: 'Contraseña actualizada con éxito' });
                });
            });
        });
    });
  });*/


router.delete("", verifyToken, (req, res) => {  /*/ DELETE  /*/
  const id = parseInt(req.body.id);
  if (isNaN(id)) {
    // LOG - 400 //
    insertLog(req.user.id, req.user.email, '005-005-400-001', "400", "users-delete", JSON.stringify(req.params),'ID no válido', "0");
    return res.status(400).json({ error: 'ID no válido' });
  }
  con.query("DELETE FROM users WHERE id = ?", id, function (err, result) {
    if (err) {
      // LOG - 500 //
      insertLog(req.user.id, req.user.email, '005-005-401-001', "401", "users-delete", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (result.affectedRows === 0) {
      // LOG - 404 //
      insertLog(req.user.id, req.user.email, '005-005-401-003', "401", "users-delete", JSON.stringify(req.params),'Usuario no encontrado', "0");
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // LOG - 200 //
    insertLog(req.user.id, req.user.email, '005-005-401-001', "401", "users-delete", JSON.stringify(req.params),'Usuario eliminado con éxito', "0");
    res.json({ message: 'Usuario eliminado con éxito' });
  });
});

router.post('/refresh', (req, res) => {
  const { refreshToken, oldToken } = req.body;
  jwt.verify(refreshToken, SECRET_KEY, (err, decoded) => {
      if (err) {
        // LOG - 401 //
        //insertLog("0", "0", '005-006-401-001', "401", "users-refresh", refreshToken,'Refresh token inválido', JSON.stringify(err));
        return res.status(401).json({ error: 'Refresh token inválido' });
      }
      const newAccessToken = jwt.sign({ email: decoded.email, id: decoded.id }, SECRET_KEY, { expiresIn: process.env.ACCES_TOKE_TIME });
      
      // LOG - 200 //
      //insertLog("0", "0", '005-006-200-001', "200", "users-refresh", refreshToken,'Token refrescado', "0");
      res.status(200).json({ token: newAccessToken });
  });
});


module.exports = router;