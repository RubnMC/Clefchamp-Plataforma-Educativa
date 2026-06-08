const express = require("express");
const router = express.Router();
const mysql = require("mysql");

const mysqlConfig = require("../config/db");
const DAO = require("../config/dao");
const { isTeacher } = require("../middleware/roles");
const { relativeTime, formatDateTime, getLevels } = require("../utils/helpers");

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
    res.render('teacher/students', { students, joinLink, relativeTime, formatDateTime, levels: getLevels() });
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
        res.render('teacher/studentDetail', { student, unlockedLevelIds, progress, levels: getLevels() });
      });
    });
  });
});

router.get("/students/:studentId/note-stats", isLoggedIn, isTeacher, (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  dao.getNoteStats(studentId, (err, stats) => {
    if (err) return res.status(500).json({ error: true });
    res.json({ stats });
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

router.post("/students/:studentId/lock", isLoggedIn, isTeacher, (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  const { levelId } = req.body;
  if (!levelId) return res.redirect(`/teacher/students/${studentId}`);

  dao.lockStudentLevel(studentId, levelId, (err) => {
    if (err) console.error('Error bloqueando nivel:', err);
    res.redirect(`/teacher/students/${studentId}`);
  });
});

router.post("/students/:studentId/remove", isLoggedIn, isTeacher, (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  dao.removeStudentFromClass(studentId, res.locals.user.id, (err, removed) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar al alumno' });
    if (!removed) return res.status(403).json({ error: 'Alumno no encontrado en tu clase' });
    res.json({ ok: true });
  });
});

router.get("/levels/:levelId/students", isLoggedIn, isTeacher, (req, res) => {
  const { levelId } = req.params;
  dao.getStudentsWithLevelStatus(res.locals.user.id, levelId, (err, students) => {
    if (err) return res.status(500).json({ error: 'Error al obtener alumnos' });
    res.json({ students });
  });
});

router.post("/levels/:levelId/bulk-access", isLoggedIn, isTeacher, (req, res) => {
  const { levelId } = req.params;
  const { students } = req.body;
  if (!Array.isArray(students) || students.length === 0) return res.json({ ok: true });

  let pending = students.length, hasError = false;
  students.forEach(({ studentId, unlocked }) => {
    const fn = unlocked ? 'unlockStudentLevel' : 'lockStudentLevel';
    dao[fn](parseInt(studentId, 10), levelId, (err) => {
      if (err) { console.error('bulk-access error:', err); hasError = true; }
      if (--pending === 0)
        hasError ? res.status(500).json({ error: 'Algunos cambios fallaron' }) : res.json({ ok: true });
    });
  });
});

module.exports = router;
