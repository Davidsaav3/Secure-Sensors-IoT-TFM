const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/token');
const SECRET_KEY = process.env.TOKEN;
const REFRESH_SECRET_KEY = process.env.TOKEN_REFRESH;
const bcrypt = require('bcrypt');
const insertLog = require('../middleware/log');
const cookieParser = require('cookie-parser');
router.use(cookieParser());

  // NO
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
        insertLog(req.user.id, req.user.user, '005-001-500-001', "500", "GET", JSON.stringify(req.params),'Error al obtener los usuarios', JSON.stringify(err));
        console.error(err);
      }
      // LOG - 200 //
      insertLog(req.user.id, req.user.user, '005-001-200-001', "200", "GET", JSON.stringify(req.params),'Usuarios recuperados', JSON.stringify(result));
      res.send(result);
    });
  });

  // NO
  router.post("/login", (req, res) => { // LOGIN //
    const { user, password } = req.body;

    if (!user || !password) {
      // LOG - 400 //
      insertLog("", user, '005-002-400-001', "400", "POST", JSON.stringify(req.body),'Faltan datos para hacer login 1', "");
      return res.status(400).json({ error: 'Faltan datos para hacer login 1' });
    }

    const selectQuery = "SELECT * FROM users WHERE user = ? AND (SELECT enabled FROM users WHERE user = ?) = 1";
    con.query(selectQuery, [user, user], (err, result) => {
        if (err) {
          // LOG - 500 //
          insertLog("", user, '005-002-500-001', "500", "POST", JSON.stringify(req.body),'Error 1 al hacer login', JSON.stringify(err));
          return res.status(500).json({ error: 'Error 1 al hacer login' });
        }

        if (result.length === 1) {
            const user = result[0];

            // comp contraseñas
            bcrypt.compare(password, user.password, (bcryptErr, bcryptResult) => {
                if (bcryptErr) {
                    console.error("Error al comparar contraseñas:", bcryptErr);
                    // LOG - 500 //
                    insertLog(req.user.id, req.user.user, '005-002-500-002', "500", "POST", JSON.stringify(req.body),'Error 2 al hacer login', JSON.stringify(bcryptErr));
                    return res.status(500).json({ error: 'Error 2 al hacer login' });
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
                                      insertLog(user.id, user.user, '005-002-500-003', "500", "POST", JSON.stringify(req.body),'Error 3 al hacer login', JSON.stringify(updateErr));
                                      return res.status(500).json({ error: 'Error 3 al hacer login' });
                                    }

                                    // Generar nuevo token de acceso
                                    const accessToken = jwt.sign({ user: user.user, id: user.id, date: new Date().toISOString() }, SECRET_KEY, { expiresIn: process.env.ACCESS_TOKEN_TIME });
                                    // LOG - 200 //
                                    insertLog(user.id, user.user, '005-002-200-001', "200", "POST", JSON.stringify(req.body),'Login hecho 1', "");
                                    return res.status(200).json({
                                        id: user.id,
                                        user: user.user,
                                        token: accessToken,
                                        refresh_token: newRefreshToken,
                                        change_password: user.change_password,
                                        enabled: user.enabled,
                                        message: 'Login hecho 1'
                                    });
                                });
                            } 
                            else {
                                // El token_refresh aún es válido, usar el token actual
                                const accessToken = jwt.sign({ user: user.user, id: user.id, date: new Date().toISOString() }, SECRET_KEY, { expiresIn: process.env.ACCESS_TOKEN_TIME });
                                // LOG - 200 //
                                insertLog(user.id, user.user, '005-002-200-002', "200", "POST", JSON.stringify(req.body),'Login hecho 2', "");
                                return res.status(200).json({
                                    id: user.id,
                                    user: user.user,
                                    token: accessToken,
                                    refresh_token: user.token,
                                    change_password: user.change_password,
                                    message: 'Login hecho 2'
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
                              insertLog(user.id, user.user, '005-002-500-004', "500", "POST", JSON.stringify(req.body),'Error 4 al hacer login', JSON.stringify(updateErr));                                
                              return res.status(500).json({ error: 'Error 4 al hacer login' });
                            }

                            // Generar nuevo token de acceso
                            const accessToken = jwt.sign({ user: user.user, id: user.id, date: new Date().toISOString() }, SECRET_KEY, { expiresIn: process.env.ACCESS_TOKEN_TIME });
                            
                            // LOG - 200 //
                            insertLog(user.id, user.user, '005-002-200-003', "200", "POST", JSON.stringify(req.body),'Login hecho 3', "");
                            return res.status(200).json({
                                id: user.id,
                                user: user.user,
                                token: accessToken,
                                refresh_token: refreshToken,
                                change_password: user.change_password,
                                enabled: user.enabled,
                                message: 'Login hecho 3'
                            });
                        });
                    }
                } 
                else {
                    console.warn("Credenciales incorrectas");
                    // LOG - 400 //
                    insertLog("", "", '005-002-400-001', "400", "POST", JSON.stringify(req.body),'Faltan datos para hacer login 2', "");
                    return res.status(400).json({ error: 'Faltan datos para hacer login 2' });
                }
            });
        } 
        else {
            console.warn("Usuario no encontrado");
            // LOG - 400 //
            insertLog("", "", '005-002-400-002', "400", "POST", JSON.stringify(req.body),'Faltan datos para hacer login 3', "");
            return res.status(400).json({ error: 'Faltan datos para hacer login 3' });
        }
    });
});
  
  router.get("/id/:id", verifyToken, (req, res) => {  /*/ ID  /*/
    const id = parseInt(req.params.id);
    
    // Validar
    if (isNaN(id) || id <= 0) {
        // LOG - 400 //
        insertLog(req.user.id, req.user.user, '005-003-400-001', "400", "GET", JSON.stringify(req.params),'ID inválido al obtener usuario', "");
        return res.status(400).json({ error: 'ID inválido al obtener usuario' });
    }
    const query = "SELECT id, user, change_password, enabled , revoke_date FROM users WHERE id = ?";
    con.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error:", err);
            // LOG - 500 //
            insertLog(req.user.id, req.user.user, '005-003-500-001', "500", "GET", JSON.stringify(req.params),'Error al obtener usuario', JSON.stringify(err));
            return res.status(500).json({ error: 'Error al obtener usuario' });
        }
        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '005-003-200-001', "200", "GET", JSON.stringify(req.params),'Usuario obtenido', JSON.stringify(result));
        res.send(result);
    });
  });

  
  router.post("", verifyToken, (req, res) => {  /*/ POST  /*/
    const { user, password, change_password, enabled } = req.body;

    // Validar
    if (!user || !password) {
      return res.status(400).json({ error: 'User y password son requeridas' });
    }

    // fortaleza
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])(?=.*[^\da-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres y contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial' });
    }

    // usuario ya existe
    con.query("SELECT * FROM users WHERE user = ?", user, (err, existingUser) => {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '005-004-500-003', "500", "POST", "", 'Error al verificar el usuario existente', JSON.stringify(err));
        return res.status(500).json({ error: 'Error al verificar el usuario existente' });
      }

      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
      }

      // Cifrar la contraseña
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          // LOG - 500 //
          insertLog(req.user.id, req.user.user, '005-004-500-001', "500", "POST", "", 'Error al cifrar la contraseña', JSON.stringify(err));
          return res.status(500).json({ error: 'Error al cifrar la contraseña' });
        }

        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));
        const formattedFutureDate = futureDate.toISOString().slice(0, 19).replace('T', ' ');

        const query = "INSERT INTO users (user, password, change_password, enabled, revoke_date) VALUES (?, ?, ?, ?, ?)";
        con.query(query, [user, hashedPassword, change_password, enabled, formattedFutureDate], (err, result) => {
          if (err) {
            // LOG - 500 //
            insertLog(req.user.id, req.user.user, '005-004-500-002', "500", "POST", "", 'Error al crear usuario', JSON.stringify(err));
            return res.status(500).json({ error: 'Error al crear usuario' });
          }

          if (result.affectedRows === 1) {
            const insertedId = result.insertId; // Obtener el ID insertado
            // LOG - 200 //
            insertLog(req.user.id, req.user.user, '005-004-200-001', "200", "POST", "", 'Usuario creado', "");
            return res.status(200).json({ id: insertedId }); // Devolver el ID
          }

          // LOG - 500 //
          insertLog(req.user.id, req.user.user, '005-004-500-005', "500", "POST", "", 'Error al crear usuario', "");
          return res.status(500).json({ error: 'Error al crear usuario' });
        });
      });
    });
  });


  // NO
  router.put("", verifyToken, (req, res) => {  /*/ UPDATE  /*/
    const { id, user, password, change_password, enabled, token } = req.body;
    const tokenX = req.headers['authorization'];

    const refreshToken = jwt.sign({ user: user, id: id }, REFRESH_SECRET_KEY, { expiresIn: process.env.REFRESH_TOKE_TIME }); 
    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));
    const formattedFutureDate = futureDate.toISOString().slice(0, 19).replace('T', ' ');

    if (!id && (user || password)) {
        // LOG - 400 //
        insertLog(req.user.id, req.user.user, '005-005-400-001', "400", "PUT", "",'Faltan datos para actualizar usuario 1', "");
        return res.status(400).json({ error: 'Faltan datos para actualizar usuario 1' });
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
            // LOG - 400 //
            insertLog(req.user.id, req.user.user, '005-005-400-002', "400", "PUT", JSON.stringify(req.body),'Faltan datos para actualizar usuario 2', JSON.stringify(err));
            return res.status(400).json({ error: 'Faltan datos para actualizar usuario 2' });
          }
      
          const { id: userId, user: userUser } = decodedToken;
          //console.log(userId+id)
          if(userId==id){
            // No hay token_refresh existente, generar uno nuevo

            // Actualizar el nuevo token_refresh en la base de datos
            const updateQuery = "UPDATE users SET token = ?, revoke_date = ? WHERE id = ?";
            con.query(updateQuery, [refreshToken, formattedFutureDate, userId], (updateErr, updateResult) => {
                if (updateErr) {
                  console.error("Error al actualizar token_refresh en la base de datos:", updateErr);
                  // LOG - 500 //
                  insertLog(user.id, user.user, '005-005-500-001', "500", "PUT", JSON.stringify(req.body),'Error 1 al editar usuario', JSON.stringify(updateErr));                                
                  return res.status(500).json({ error: 'Error 1 al editar usuario' });
                }
                
                // LOG - 200 //
                //insertLog(req.user.id, req.user.user, '005-006-200-001', "200", "PUT", JSON.stringify(req.body),'Datos actualizados', "");
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
                insertLog(req.user.id, req.user.user, '005-005-500-002', "500", "PUT", "",'Error 2 al editar usuario', JSON.stringify(err));
                return res.status(500).json({ error: 'Error 2 al editar usuario' });
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
                insertLog(req.user.id, req.user.user, '005-005-500-003', "500", "PUT", "",'Error 3 al editar usuario', JSON.stringify(err));
                return res.status(500).json({ error: 'Error 3 al editar usuario' });
            }
            if (result.affectedRows > 0) {
                // LOG - 200 //
                insertLog(req.user.id, req.user.user, '005-005-200-001', "200", "PUT", "",'Usuario actualizado', "");
                //console.log(refreshToken)
                return res.status(200).json({ refresh_token: refreshToken, user: user });
            }
            // LOG - 404 //
            insertLog(req.user.id, req.user.user, '005-005-404-001', "404", "PUT", "",'Faltan datos para actualizar usuario 3', "");
            return res.status(404).json({ error: 'Faltan datos para actualizar usuario 3' });
        });
    }
  });


  router.delete("", verifyToken, (req, res) => {  /*/ DELETE  /*/
    const id = parseInt(req.body.id);
  
    // Verificar
    if (isNaN(id)) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '005-006-400-001', "400", "DELETE", JSON.stringify(req.params), 'ID no válido al borrar el usuario', "");
      return res.status(400).json({ error: 'ID no válido al borrar el usuario' });
    }
  
    // Verificar
    con.query("SELECT * FROM users WHERE id = ?", id, function (err, user) {
      if (err) {
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '005-006-500-001', "500", "DELETE", JSON.stringify(req.params), 'Error al eliminar el usuario', JSON.stringify(err));
        return res.status(500).json({ error: 'Error al eliminar el usuario' });
      }
  
      if (user.length === 0) {
        // LOG - 404 //
        insertLog(req.user.id, req.user.user, '005-006-404-001', "404", "DELETE", JSON.stringify(req.params), 'Usuario no encontrado al eliminarlo', "");
        return res.status(404).json({ error: 'Usuario no encontrado al eliminarlo' });
      }
  
      con.query("DELETE FROM users WHERE id = ?", id, function (err, result) {
        if (err) {
          // LOG - 500 //
          insertLog(req.user.id, req.user.user, '005-006-500-002', "500", "DELETE", JSON.stringify(req.params), 'Error al eliminar el usuario', JSON.stringify(err));
          return res.status(500).json({ error: 'Error al eliminar el usuario' });
        }
  
        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '005-006-200-001', "200", "DELETE", JSON.stringify(req.params), 'Usuario eliminado', "");
        res.json({ message: 'Usuario eliminado' });
      });
    });
  });
  

  router.post('/refresh', (req, res) => {
    const { refreshToken } = req.body;
  
    // Verificamos
    if (!refreshToken) {
      // LOG - 400 //
      insertLog("", "", '005-007-400-001', "400", "POST", "",'Error al refrescar el token', 'El token de refresco no fue proporcionado');
      return res.status(400).json({ error: 'El token de refresco no fue proporcionado' });
    }
  
    jwt.verify(refreshToken, SECRET_KEY, (err, decoded) => {
      if (err) {
        // LOG - 400 //
        insertLog("", "", '005-007-400-002', "400", "POST", refreshToken,'Error al refrescar el token', JSON.stringify(err));
        return res.status(400).json({ error: 'Refresh token inválido' });
      }
  
      const userId = decoded.id;
  
      const query = "SELECT * FROM users WHERE id = ? AND enabled = 1";
      con.query(query, [userId], (err, results) => {
        if (err || results.length === 0) {
          // LOG - 400 //
          insertLog("", "", '005-007-400-003', "400", "POST", refreshToken,'Error al refrescar el token', 'Los datos del JWT no existen en la base de datos o el usuario está deshabilitado');
          return res.status(400).json({ error: 'Los datos del JWT no existen en la base de datos o el usuario está deshabilitado' });
        }
  
        // Generamos
        const newAccessToken = jwt.sign({ user: results[0].user, id: userId }, SECRET_KEY, { expiresIn: process.env.ACCESS_TOKEN_TIME });

        // LOG - 200 //
        insertLog("", "", '005-007-200-001', "200", "POST", refreshToken,'Token refrescado', '');
        res.status(200).json({ token: newAccessToken });
      });
    });
  });


  router.post("/revoke", verifyToken, (req, res) => {  /*/ REVOKE  /*/
    const { id } = req.body;
  
    // Verificamos
    if (isNaN(id)) {
      // LOG - 400 //
      insertLog(req.user.id, req.user.user, '005-008-400-001', "400", "POST", JSON.stringify(req.body), 'ID no válido al revocar el token', "");
      return res.status(400).json({ error: 'ID no válido al revocar el token' });
    }
  
    const query = "UPDATE users SET token = '', revoke_date = NOW() WHERE id = ?";
    con.query(query, [id], (err, result) => {
      if (err) {
        console.error("Error:", err);
        // LOG - 500 //
        insertLog(req.user.id, req.user.user, '005-008-500-002', "500", "POST", "",'Error al revocar el token', JSON.stringify(err));
        return res.status(500).json({ error: 'Error al revocar el token' });
      }
      if (result.affectedRows === 1) {
        // LOG - 200 //
        insertLog(req.user.id, req.user.user, '005-008-200-001', "200", "POST", "",'Token revocado', "");
        return res.status(200).json({ message: 'Token revocado' });
      }
      // LOG - 404 //
      insertLog(req.user.id, req.user.user, '005-008-404-001', "404", "POST", "",'Usuario no encontrado al revocar el token', "");
      return res.status(404).json({ error: 'Usuario no encontrado al revocar el token' });
    });
  });
  


module.exports = router;