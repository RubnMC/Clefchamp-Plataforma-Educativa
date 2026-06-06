const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const fs = require("fs");
const path = require("path");

const mysqlConfig = require("../config/db");
const DAO = require("../config/dao");
const { isStudent } = require("../middleware/roles");
const { getLevels } = require("../utils/helpers");

const pool = mysql.createPool(mysqlConfig);
const dao = new DAO(pool);

router.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

const isLoggedIn = (req, res, next) => res.locals.user ? next() : res.redirect('/users/login');
const isNotLoggedIn = (req, res, next) => !res.locals.user ? next() : res.redirect('/users/login');

router.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
})

// router.get("/", isLoggedIn, (request,response) => {
//   response.render('home', {lastPlayed} )
  // })

router.get("/", isLoggedIn, (req, res) => res.render('home'));

router.get("/selectGame", isLoggedIn, (request,response) => {
  response.render("selectGame")
})

router.get("/atrapado/trial", isNotLoggedIn, (request,response) => {
    response.render("gameScreen", {mode: "TRIAL"})
})

router.get("/atrapado/easy", isLoggedIn, isStudent, (request,response) => {
  response.render("gameScreen", {mode: "EASY"})
})

router.get("/atrapado/normal", isLoggedIn, isStudent, (request,response) => {
  response.render("gameScreen", {mode: "NORMAL"})
})

router.get("/atrapado/hard", isLoggedIn, isStudent, (request,response) => {
  response.render("gameScreen", {mode: "HARD"})
})

router.get('/levels', (req, res) => {
  const filePath = path.join(__dirname, '../data/levels.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error leyendo el archivo de niveles' });
    res.json(JSON.parse(data));
  });
});

router.get('/getExperienceRequired/:level', isLoggedIn, (request,response) => {
  const level = request.params.level; 
  dao.getExperienceByLevel(level,(err,result) => {
    if(err) res.status(500).json({ message: "Error en getExperienceRequired" }); 
    else response.json(result)
  })
});

router.get('/getUserLevel/:userId', isLoggedIn, (request, response) => {
  const userId = request.params.userId;
  dao.getUserLevel(userId, (err, result) => {
    if (err) res.status(500).json({ message: "Error en getExperienceRequired" }); 
    else response.json(result[0]); 
  });
});

router.get('/getStudentLevels', isLoggedIn, (req, res) => {
  const user = res.locals.user;
  if (user.role === 'teacher') {
    return res.json({ levelIds: getLevels().map(l => l.id) });
  }
  dao.getStudentLevels(user.id, (err, levelIds) => {
    if (err) return res.status(500).json({ message: 'Error obteniendo niveles' });
    res.json({ levelIds });
  });
});

router.put('/addExperience', isLoggedIn, isStudent, (request,response) => {
  const { userId, level, experience, experienceToNext } = request.body;
  dao.updateUserLevel(userId, level, experience, experienceToNext, (err, result) => {
    response.locals.user.level = level
    response.locals.user.experience = experience
    response.locals.user.experienceToNext = experienceToNext
    response.json(true)
  })
});

router.post('/saveRecords', (req, res) => {
  const {
      id,
      dificultad,
      nivelId,
      perfecto,
      excelente,
      genial,
      bien,
      ok,
      aciertos,
      fallos,
      puntuacion,
      tiemposIndividuales,
      notas,
      resultados
  } = req.body;

  dao.saveRecord(id,dificultad,nivelId,perfecto,excelente,genial,bien,ok,aciertos,fallos,puntuacion,tiemposIndividuales,notas,resultados, (err,result) => {
    if(err) {
      console.log("ERROR: " + err)
      res.status(500).json({ message: "Error en saveRecords" });
    }
    else res.json(true);
  })

});



module.exports = router;
