const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())

  /* SENSORS_TYPES //////////////////////////////////////////*/
  router.get("/get/:type/:type1/:type2/:pag_tam/:pag_pag", (req,res)=>{  /*/ GET  /*/
  let type0= req.params.type;
  let type1= req.params.type1;
  let type2= req.params.type2;

  let tam= parseInt(req.params.pag_pag);
  let act= (req.params.pag_tam-1)*parseInt(req.params.pag_pag);

  if(type0=='Buscar'){
    con.query(`SELECT * FROM sensors_types order by ${type1} ${type2} LIMIT ${tam} OFFSET ${act}`,function (err, result) {
      if (err) throw err;
        res.send(result)
    }); 
  }
  else{
      con.query(`SELECT * FROM sensors_types WHERE type LIKE '%${type0}%' OR metric LIKE '%${type0}%' OR description LIKE '%${type0}%' OR errorvalue LIKE '%${type0}%' OR valuemax LIKE '%${type0}%' OR valuemin LIKE '%${type0}%' order by ${type1} ${type2} LIMIT ${tam} OFFSET ${act}`, function (err, result) {
      if (err) throw err;
        res.send(result)
    }); 
  }
  });
  
  router.get("/id/:id", (req,res)=>{  /*/ ID  /*/
    let id= parseInt(req.params.id);
    con.query("SELECT * FROM sensors_types WHERE id= ?", id, function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  router.get("/max/", (req,res)=>{ /*/ MAX  /*/
    con.query("SELECT id FROM sensors_types WHERE id=(SELECT max(id) FROM sensors_types)", function (err, result) {
      if (err) throw err;
        res.send(result) 
    });
  });
  
  router.post("/post/", (req,res)=>{  /*/ POST  /*/
  if(!req.body.type){return res.status(400).json({ error: 'El campo type es requerido.' });}else{type= req.body.type;}
  if(!req.body.metric){return res.status(400).json({ error: 'El campo metric es requerido.' });}else{metric= req.body.metric;}
    let description= req.body.description;
    let errorvalue= req.body.errorvalue;
    let valuemax= req.body.valuemax;
    let valuemin= req.body.valuemin;
    let position= req.body.position;
    let correction_general= req.body.correction_general;
    let correction_time_general= req.body.correction_time_general;
    con.query("INSERT INTO sensors_types (type,metric,description,errorvalue,valuemax,valuemin,position,correction_general,correction_time_general) VALUES (?,?,?,?,?,?,?,?,?)",[type, metric, description,errorvalue,valuemax,valuemin,position,correction_general,correction_time_general], function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });
  
  router.put("/update/", (req,res)=>{  /*/ UPDATE  /*/
    if(!req.body.type){return res.status(400).json({ error: 'El campo type es requerido.' });}else{type= req.body.type;}
    if(!req.body.metric){return res.status(400).json({ error: 'El campo metric es requerido.' });}else{metric= req.body.metric;}
    description= req.body.description;
    errorvalue= req.body.errorvalue;
    valuemax= req.body.valuemax;
    valuemin= req.body.valuemin;
    id= req.body.id;
    position= req.body.position;
    correction_general= req.body.correction_general;
    correction_time_general= req.body.correction_time_general;
    con.query("UPDATE sensors_types SET position=?, type=?,metric=?,description=?,errorvalue=?,valuemax=?,valuemin=?,correction_general=?,correction_time_general=? WHERE id= ?",[position,type, metric, description,errorvalue,valuemax,valuemin,correction_general,correction_time_general,id], function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  router.delete("/delete/", (req, res) => {  /*/ DELETE  /*/
    const id = req.body.id;
      if (isNaN(id)) {
      return res.status(400).json({ error: 'ID no válido' });
    }
    con.query("DELETE FROM sensors_types WHERE id = ?", id, function (err, result) {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Elemento no encontrado' });
      }
      res.json({ message: 'Elemento eliminado con éxito' });
    });
  });

module.exports = router;
