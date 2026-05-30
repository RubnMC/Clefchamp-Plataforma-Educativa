const express = require("express");
const router = express.Router();
const mysql = require("mysql");

const mysqlConfig = require("../config/db");
const DAO = require("../config/dao");
const { isTeacher } = require("../middleware/roles");

const pool = mysql.createPool(mysqlConfig);
const dao = new DAO(pool);

router.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

const isLoggedIn = (req, res, next) =>
  res.locals.user ? next() : res.redirect('/users/login');

router.get("/", isLoggedIn, isTeacher, (req, res) => {
  res.redirect('/teacher/students');
});

router.get("/students", isLoggedIn, isTeacher, (req, res) => {
  dao.getStudentsByTeacherId(res.locals.user.id, (err, students) => {
    if (err) return res.status(500).render('error');
    const joinLink = `${req.protocol}://${req.get('host')}/join/${res.locals.user.friendCode.slice(1)}`;
    res.render('teacher/students', { students, joinLink });
  });
});

router.get("/students/:studentId", isLoggedIn, isTeacher, (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  dao.getUserById(studentId, (err, student) => {
    if (err || !student) return res.status(404).render('404');
    dao.getStudentLevels(studentId, (err, unlockedLevelIds) => {
      if (err) return res.status(500).render('error');
      dao.getStudentLevelProgress(studentId, (err, progress) => {
        if (err) return res.status(500).render('error');
        res.render('teacher/studentDetail', { student, unlockedLevelIds, progress });
      });
    });
  });
});

router.post("/students/:studentId/unlock", isLoggedIn, isTeacher, (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  const { levelId } = req.body;
  if (!levelId) return res.redirect(`/teacher/students/${studentId}`);

  dao.unlockStudentLevel(studentId, levelId, (err) => {
    if (err) console.error('Error desbloqueando nivel:', err);
    res.redirect(`/teacher/students/${studentId}`);
  });
});

module.exports = router;
