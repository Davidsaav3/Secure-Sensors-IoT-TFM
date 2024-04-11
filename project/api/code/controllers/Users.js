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
const cookieParser = require('cookie-parser');
router.use(cookieParser());

  router.get("/get/:type/:type1/:type2/:pag_tam/:pag_pag", verifyToken, (req, res) => {  /*/ GET  /*/
    const type0 = req.params.type;
    const type1 = req.params.type1;
    const type2 = req.params.type2;
    const tam = parseInt(req.params.pag_pag);
    const act = (req.params.pag_tam - 1) * parseInt(req.params.pag_pag);
    let query = ``;
    if (type0 === 'search') {
      query += `SELECT id, user, change_password, enabled, revoke_date, (SELECT COUNT(*) AS total FROM users) as total FROM users`;
      query += ` ORDER BY ${type1} ${type2}`;
    } 
    else {
      query += `SELECT id, user, change_password , enabled, revoke_date, (SELECT COUNT(*) AS total FROM users WHERE user LIKE '%${type0}%' OR password LIKE '%${type0}%') as total FROM users`;
      query += ` WHERE user LIKE '%${type0}%' OR password LIKE '%${type0}%' ORDER BY ${type1} ${type2}`;
    }
    query += ` LIMIT ? OFFSET ?`;
    con.query(query, [ tam, act], (err, result) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '005-001-500-001', "500", "GET", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
        console.error(err);
      }
      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '005-001-200-001', "200", "GET", JSON.stringify(req.params),'Datos recuperados', JSON.stringify(result));
      res.send(result);
    });
  });


  router.post("/login", (req, res) => { // LOGIN //
    const { user, password } = req.body;

    if (!user || !password) {
      // LOG - 400 //
      insertLog("", user, '005-002-400-001', "400", "POSTn", JSON.stringify(req.body),'El user y la contraseña son requeridos', "");
      return res.status(400).json({ error: 'El user y la contraseña son requeridos' });
    }

    const selectQuery = "SELECT * FROM users WHERE user = ? AND (SELECT enabled FROM users WHERE user = ?) = 1";
    con.query(selectQuery, [user, user], (err, result) => {
        if (err) {
          // LOG - 500 //
          insertLog("", user, '005-002-500-002', "500", "POSTn", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(err));
          return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (result.length === 1) {
            const user = result[0];

            // comp contraseñas
            bcrypt.compare(password, user.password, (bcryptErr, bcryptResult) => {
                if (bcryptErr) {
                    console.error("Error al comparar contraseñas:", bcryptErr);
                    // LOG - 500 //
                    insertLog(req.user.id, req.user.user, '005-002-500-003', "500", "POSTn", JSON.stringify(req.body),'Error al comparar contraseñas', JSON.stringify(bcryptErr));
                    return res.status(500).json({ error: 'Error al comparar contraseñas' });
                }

                if (bcryptResult) {
                    // Verificar si el token_refresh aún es válido
                    if (user.token) {
                        jwt.verify(user.token, REFRESH_SECRET_KEY, (verifyErr, decoded) => {
                            if (verifyErr) {
                                // El token ha caducado o es inválido, generar uno nuevo
                                const newRefreshToken = jwt.sign({ user: user.user, id: user.id }, REFRESH_SECRET_KEY, { expiresIn: process.env.REFRESH_TOKE_TIME });
                                
                                const currentDate = new Date();
                                const futureDate = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));
                                const formattedFutureDate = futureDate.toISOString().slice(0, 19).replace('T', ' ');

                                // Actualizar el nuevo token_refresh en la base de datos
                                const updateQuery = "UPDATE users SET token = ?, revoke_date = ? WHERE id = ?";
                                con.query(updateQuery, [newRefreshToken, formattedFutureDate, user.id], (updateErr, updateResult) => {
                                    if (updateErr) {
                                      console.error("Error al actualizar token_refresh en la base de datos:", updateErr);
                                      // LOG - 500 //
                                      insertLog(user.id, user.user, '005-002-500-004', "500", "POSTn", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(updateErr));
                                      return res.status(500).json({ error: 'Error en la base de datos' });
                                    }

                                    // Generar nuevo token de acceso
                                    const accessToken = jwt.sign({ user: user.user, id: user.id, date: new Date().toISOString() }, SECRET_KEY, { expiresIn: process.env.ACCES_TOKE_TIME });
                                    // LOG - 200 //
                                    insertLog(user.id, user.user, '005-002-200-001', "200", "POSTn", JSON.stringify(req.body),'Inicio de sesión exitoso', "");
                                    return res.status(200).json({
                                        id: user.id,
                                        user: user.user,
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
                                const accessToken = jwt.sign({ user: user.user, id: user.id, date: new Date().toISOString() }, SECRET_KEY, { expiresIn: process.env.ACCES_TOKE_TIME });
                                // LOG - 200 //
                                insertLog(user.id, user.user, '005-002-200-002', "200", "POSTn", JSON.stringify(req.body),'Inicio de sesión exitoso', "");
                                return res.status(200).json({
                                    id: user.id,
                                    user: user.user,
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
                        const refreshToken = jwt.sign({ user: user.user, id: user.id }, REFRESH_SECRET_KEY, { expiresIn: process.env.REFRESH_TOKE_TIME }); 

                        const currentDate = new Date();
                        const futureDate = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));
                        const formattedFutureDate = futureDate.toISOString().slice(0, 19).replace('T', ' ');

                        // Actualizar el nuevo token_refresh en la base de datos
                        const updateQuery = "UPDATE users SET token = ?, revoke_date = ? WHERE id = ?";
                        con.query(updateQuery, [refreshToken, formattedFutureDate, user.id], (updateErr, updateResult) => {
                            if (updateErr) {
                              console.error("Error al actualizar token_refresh en la base de datos:", updateErr);
                              // LOG - 500 //
                              insertLog(user.id, user.user, '005-002-500-005', "500", "POSTn", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(updateErr));                                
                              return res.status(500).json({ error: 'Error en la base de datos' });
                            }

                            // Generar nuevo token de acceso
                            const accessToken = jwt.sign({ user: user.user, id: user.id, date: new Date().toISOString() }, SECRET_KEY, { expiresIn: process.env.ACCES_TOKE_TIME });
                            
                            // LOG - 200 //
                            insertLog(user.id, user.user, '005-002-200-003', "200", "POSTn", JSON.stringify(req.body),'Inicio de sesión exitoso', "");
                            return res.status(200).json({
                                id: user.id,
                                user: user.user,
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
                    insertLog("", "", '005-002-401-001', "401", "POSTn", JSON.stringify(req.body),'Credenciales incorrectas', "");
                    return res.status(401).json({ error: 'Credenciales incorrectas' });
                }
            });
        } 
        else {
            console.warn("Usuario no encontrado");
            // LOG - 401 //
            insertLog("", "", '005-002-401-002', "401", "POSTn", JSON.stringify(req.body),'Credenciales incorrectas', "");
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }
    });
});
  
  router.get("/id/:id", verifyToken, (req, res) => {  /*/ ID  /*/
    const id = parseInt(req.params.id);
    const query = "SELECT id, user, change_password, enabled , revoke_date FROM users WHERE id = ?";
    con.query(query, [id,id], (err, result) => {
      if (err) {
        console.error("Error:", err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '005-003-500-001', "500", "GET", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '005-003-200-001', "200", "GET", JSON.stringify(req.params),'Datos recuperados', JSON.stringify(result));
      res.send(result);
    });
  });
  
  router.post("", verifyToken, (req, res) => {  /*/ POST  /*/
  const { user, password, change_password, enabled } = req.body;
  
  if (!user || !password) {
    return res.status(400).json({ error: 'User y password  son requeridas' });
  }
  //console.log("Lo que me llega:", password);
  bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
          // LOG - 500 //
          insertLog(req.user.id, req.user.user, '005-004-500-001', "500", "POST", "",'Error al cifrar la contraseña', JSON.stringify(err));
          return res.status(500).json({ error: 'Error al cifrar la contraseña' });
      }
      //console.log("Cifrada:", hashedPassword);
      const currentDate = new Date();
      const futureDate = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));
      const formattedFutureDate = futureDate.toISOString().slice(0, 19).replace('T', ' ');
      const query = "INSERT INTO users (user, password, change_password, enabled, revoke_date) VALUES (?, ?, ?, ?, ?)";
      con.query(query, [user, hashedPassword, change_password, enabled, formattedFutureDate], (err, result) => {
          if (err) {
              // LOG - 500 //
              insertLog(req.user.id, req.user.user, '005-004-500-002', "500", "POST", "",'Error en la base de datos', JSON.stringify(err));
              return res.status(500).json({ error: 'Error en la base de datos' });
          }
          if (result.affectedRows === 1) {
              const insertedId = result.insertId; // Obtiene el ID insertado
              // LOG - 201 //
              insertLog(req.user.id, req.user.user, '005-004-201-001', "201", "POST", "",'Datos guardados', "");
              return res.status(201).json({ id: insertedId }); // Devuelve el ID
          }
          // LOG - 500 //
          insertLog(req.user.id, req.user.user, '005-004-500-001', "500", "POST", "",'No se pudo insertar el registro', "");
          return res.status(500).json({ error: 'No se pudo insertar el registro' });
      });
  });
});

    
  router.put("/user", verifyToken, (req, res) => { // PUT EMAIL //
    const { user: newUser } = req.body;
    const tokenX = req.headers['authorization'];

    if (!newUser) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '005-006-401-001', "401", "PUT", JSON.stringify(req.body),'Se requiere el nuevo correo electrónico para actualizar', "");
      return res.status(400).json({ error: 'Se requiere el nuevo correo electrónico para actualizar' });
    }
  
    jwt.verify(tokenX, SECRET_KEY, (err, decodedToken) => {
      if (err) {
        // LOG - 401 //
        insertLog(req.user.id, req.user.user, '005-006-401-002', "401", "PUT", JSON.stringify(req.body),'Token no válido', JSON.stringify(err));
        return res.status(401).json({ error: 'Token no válido' });
      }
  
      const { id: userId, user: userUser } = decodedToken;
      const query = "UPDATE users SET user = ? WHERE id = ? AND user = ?";
      con.query(query, [newUser, userId, userUser], (err, result) => {
        if (err) {
          // LOG - 500 //
          insertLog(req.user.id, req.user.user, '005-006-401-003', "401", "PUT", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(err));
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
  
        if (result.affectedRows === 1) {

          // No hay token_refresh existente, generar uno nuevo
          const refreshToken = jwt.sign({ user: newUser, id: userId }, REFRESH_SECRET_KEY, { expiresIn: process.env.REFRESH_TOKE_TIME }); 

          const currentDate = new Date();
          const futureDate = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));
          const formattedFutureDate = futureDate.toISOString().slice(0, 19).replace('T', ' ');

          // Actualizar el nuevo token_refresh en la base de datos
          const updateQuery = "UPDATE users SET token = ?, revoke_date = ? WHERE id = ?";
          con.query(updateQuery, [refreshToken, formattedFutureDate, userId], (updateErr, updateResult) => {
              if (updateErr) {
                console.error("Error al actualizar token_refresh en la base de datos:", updateErr);
                // LOG - 500 //
                insertLog(user.id, user.user, '005-006-500-005', "500", "PUT", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(updateErr));                                
                return res.status(500).json({ error: 'Error en la base de datos' });
              }
              
              // LOG - 200 //
              insertLog(req.user.id, req.user.user, '005-006-200-004', "200", "PUT", JSON.stringify(req.body),'Datos actualizados', "");
              return res.status(200).json({ user: newUser }); // Devolver el nuevo correo
          });
        }
  
      });
    });
  });

  let token2= '';

  router.put("", verifyToken, (req, res) => {  /*/ UPDATE  /*/
  const { id, user, password, change_password, enabled, token } = req.body;
  const tokenX = req.headers['authorization'];

  const refreshToken = jwt.sign({ user: user, id: id }, REFRESH_SECRET_KEY, { expiresIn: process.env.REFRESH_TOKE_TIME }); 
  const currentDate = new Date();
  const futureDate = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));
  const formattedFutureDate = futureDate.toISOString().slice(0, 19).replace('T', ' ');

  if (!id && (user || password)) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '005-007-400-001', "400", "PUT", "",'Se requiere el ID del usuario y al menos un campo para actualizar', "");
      return res.status(400).json({ error: 'Se requiere el ID del usuario y al menos un campo para actualizar' });
  }
  let query = "UPDATE users SET";
  const values = [];
  let commaNeeded = false;

  if (user) {
      query += " user=?";
      values.push(user);
      commaNeeded = true;

      jwt.verify(tokenX, SECRET_KEY, (err, decodedToken) => {
        if (err) {
          // LOG - 401 //
          insertLog(req.user.id, req.user.user, '005-006-401-002', "401", "PUT", JSON.stringify(req.body),'Token no válido', JSON.stringify(err));
          return res.status(401).json({ error: 'Token no válido' });
        }
    
        const { id: userId, user: userUser } = decodedToken;
        console.log(userId+id)
        if(userId==id){
          // No hay token_refresh existente, generar uno nuevo

          // Actualizar el nuevo token_refresh en la base de datos
          const updateQuery = "UPDATE users SET token = ?, revoke_date = ? WHERE id = ?";
          con.query(updateQuery, [refreshToken, formattedFutureDate, userId], (updateErr, updateResult) => {
              if (updateErr) {
                console.error("Error al actualizar token_refresh en la base de datos:", updateErr);
                // LOG - 500 //
                insertLog(user.id, user.user, '005-006-500-005', "500", "PUT", JSON.stringify(req.body),'Error en la base de datos', JSON.stringify(updateErr));                                
                return res.status(500).json({ error: 'Error en la base de datos' });
              }
              
              // LOG - 200 //
              //insertLog(req.user.id, req.user.user, '005-006-200-004', "200", "PUT", JSON.stringify(req.body),'Datos actualizados', "");
              //return res.status(200).json({ user: user, refresh_token: refreshToken }); // Devolver el nuevo correo
          });
        }
      });
  }
  

  if (token && token==true) {
      if (commaNeeded) query += ",";
      query += " token=?";
      values.push('');
      commaNeeded = true;
  }

  if (enabled && enabled==true) {
      if (commaNeeded) query += ",";
      query += " enabled=?";
      values.push('');
      commaNeeded = true;
  }

  if (password) {
      // Cifrar la contraseña antes de almacenarla
      bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
              // LOG - 500 //
              insertLog(req.user.id, req.user.user, '005-007-500-002', "500", "PUT", "",'Error al cifrar la contraseña', JSON.stringify(err));
              return res.status(500).json({ error: 'Error al cifrar la contraseña' });
          }
          if (commaNeeded) query += ",";
          query += " password=?";
          values.push(hashedPassword); // Usar la contraseña cifrada
          commaNeeded = true;
          continueUpdateQuery();
      });
  } else {
      // Si no se proporciona una nueva contraseña, continuar sin cifrarla
      continueUpdateQuery();
  }

  function continueUpdateQuery() {
      if (change_password != null) {
          if (commaNeeded) query += ",";
          query += " change_password=?";
          values.push(change_password);
          commaNeeded = true;
      }
      if (enabled != null) {
          if (commaNeeded) query += ",";
          query += " enabled=?";
          values.push(enabled);
          commaNeeded = true;
      }
      query += " WHERE id=?";
      values.push(id);

      con.query(query, values, (err, result) => {
          if (err) {
              // LOG - 500 //
              insertLog(req.user.id, req.user.user, '005-007-401-003', "401", "PUT", "",'Error en la base de datos', JSON.stringify(err));
              return res.status(500).json({ error: 'Error en la base de datos xd' });
          }
          if (result.affectedRows > 0) {
              // LOG - 200 //
              insertLog(req.user.id, req.user.user, '005-007-200-001', "200", "PUT", "",'Registro actualizado con éxito', "");
              console.log(refreshToken)
              return res.status(200).json({ refresh_token: refreshToken, user: user });
          }
          // LOG - 404 //
          insertLog(req.user.id, req.user.user, '005-007-401-001', "401", "PUT", "",'Registro no encontrado', "");
          return res.status(404).json({ error: 'Registro no encontrado' });
      });
  }
});




  router.delete("", verifyToken, (req, res) => {  /*/ DELETE  /*/
    const id = parseInt(req.body.id);
    if (isNaN(id)) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '005-008-400-001', "400", "DELETE", JSON.stringify(req.params),'ID no válido', "");
      return res.status(400).json({ error: 'ID no válido' });
    }
    con.query("DELETE FROM users WHERE id = ?", id, function (err, result) {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '005-008-500-001', "500", "DELETE", JSON.stringify(req.params),'Error en la base de datos', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 0) {
        // LOG - 404 //
        insertLog(req.user.id, req.user.user, '005-008-404-003', "404", "DELETE", JSON.stringify(req.params),'Usuario no encontrado', "");
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '005-008-200-001', "200", "DELETE", JSON.stringify(req.params),'Usuario eliminado con éxito', "");
      res.json({ message: 'Usuario eliminado con éxito' });
    });
  });

  router.post('/refresh', (req, res) => {
    const { refreshToken } = req.body;    
    //const refreshToken = req.cookies.refresh_token;
    //npm install cookie-parser

    jwt.verify(refreshToken, SECRET_KEY, (err, decoded) => {
        if (err) {
            // LOG - 401 //
            //insertLog("", "", '005-009-401-001', "401", "POST", refreshToken,'Refresh token inválido', JSON.stringify(err));
            return res.status(401).json({ error: 'Refresh token inválido' });
        }

        //console.log(decoded.user)
        const query = "SELECT * FROM users WHERE id = ? AND (SELECT enabled FROM users WHERE id = ?) = 1 AND revoke_date IS NOT NULL AND revoke_date != ''";
        con.query(query, [decoded.id, decoded.id], (err, results) => {
            if (err || results.length === 0) {

                // LOG - 400 //
                insertLog("", "", '005-009-400-001', "400", "POST", refreshToken,'Los datos del JWT no existen en la base de datos', "");
                return res.status(400).json({ error: 'Los datos del JWT no existen en la base de datos' });
            }
            // LOG - 200 //
            //insertLog("", "", '005-009-200-001', "200", "POST", refreshToken,'Token refrescado', "");
            const newAccessToken = jwt.sign({ user: results[0].user, id: decoded.id }, SECRET_KEY, { expiresIn: process.env.ACCES_TOKE_TIME });
            res.status(200).json({ token: newAccessToken });
        });
    });
  });


  router.post("/revoke", verifyToken, (req, res) => {  /*/ REVOKE  /*/
    const { id } = req.body;
      const query = "UPDATE users SET token = ? , revoke_date = ? WHERE id = ?";
      con.query(query, ["", "", id], (err, result) => {
          if (err) {
              // LOG - 500 //
              insertLog(req.user.id, req.user.user, '005-010-500-002', "500", "POST", "",'Error en la base de datos', JSON.stringify(err));
              return res.status(500).json({ error: 'Error en la base de datos' });
          }
          if (result.affectedRows === 1) {
              const insertedId = result.insertId; // Obtiene el ID insertado
              // LOG - 201 //
              insertLog(req.user.id, req.user.user, '005-010-201-001', "201", "POST", "",'Datos guardados', "");
              return res.status(201).json({ id: insertedId }); // Devuelve el ID
          }
          // LOG - 500 //
          insertLog(req.user.id, req.user.user, '005-010-500-001', "500", "POST", "",'No se pudo insertar el registro', "");
          return res.status(500).json({ error: 'No se pudo insertar el registro' });
      });
  });


module.exports = router;