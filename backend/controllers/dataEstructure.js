const express = require('express');
const router = express.Router();
let { con }= require('../middleware/mysql');
let cors= require('cors')
router.use(cors());
router.use(express.json())

  /* ESTRUCTURE //////////////////////////////////////////*/
  router.get("/get/:type/:type1/:type2/:pag_tam/:pag_pag", (req,res)=>{  /*/ GET  /*/
  let type0= req.params.type;
  let type1= req.params.type1;
  let type2= req.params.type2;

  let tam= parseInt(req.params.pag_pag);
  let act= (req.params.pag_tam-1)*parseInt(req.params.pag_pag);

  if(type0=='Buscar'){
    con.query(`SELECT * FROM data_estructure order by ${type1} ${type2} LIMIT ${tam} OFFSET ${act}`,function (err, result) {
      if (err) throw err;
        res.send(result)
    }); 
  }
  else{
      con.query(`SELECT * FROM data_estructure WHERE description LIKE '%${type0}%' OR configuration LIKE '%${type0}%' order by ${type1} ${type2} LIMIT ${tam} OFFSET ${act}`, function (err, result) {
      if (err) throw err;
        res.send(result)
    }); 
  }
  });
  
  router.get("/id/:id_estructure", (req,res)=>{  /*/ ID  /*/
    let id_estructure= parseInt(req.params.id_estructure);
    con.query("SELECT * FROM data_estructure WHERE id_estructure= ?", id_estructure, function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  router.get("/max/", (req,res)=>{ /*/ MAX  /*/
    con.query("SELECT id_estructure FROM data_estructure WHERE id_estructure=(SELECT max(id_estructure) FROM data_estructure)", function (err, result) {
      if (err) throw err;
        res.send(result) 
    });
  });
  
  router.post("/post/", (req,res)=>{  /*/ PUT  /*/
    let description= req.body.description;
    let configuration= req.body.configuration;
    con.query("INSERT INTO data_estructure (description,configuration) VALUES (?,?)",[description, configuration], function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });
  
  router.post("/update/", (req,res)=>{  /*/ UPDATE  /*/
  let id_estructure= parseInt(req.body.id_estructure);
  let description= req.body.description;
  let configuration= req.body.configuration;
    con.query("UPDATE data_estructure SET description=?, configuration=? WHERE id_estructure= ?",[description,configuration,id_estructure], function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

  router.post("/delete/", (req,res)=>{  /*/ DELETE  /*/
  let id_estructure= parseInt(req.body.id_estructure);
    con.query("DELETE FROM data_estructure WHERE id_estructure= ?", id_estructure, function (err, result) {
      if (err) throw err;
        res.send(result)
    });
  });

module.exports = router;