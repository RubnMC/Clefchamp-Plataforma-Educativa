const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const mysqlConfig = require('../config/db');
const DAO = require('../config/dao');
const { requireAuth } = require('../middleware/roles');

const pool = mysql.createPool(mysqlConfig);
const dao = new DAO(pool);

router.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

router.get('/:friendCode', requireAuth, (req, res) => {
  const user = res.locals.user;
  const fullCode = '#' + req.params.friendCode;

  if (user.role === 'teacher')
    return res.status(403).render('join', { state: 'teacher_blocked' });

  if (user.teacherId)
    return res.render('join', { state: 'already_enrolled' });

  dao.getTeacherByFriendCode(fullCode, (err, teacher) => {
    if (err) return res.status(500).render('error');
    if (!teacher || teacher.role !== 'teacher')
      return res.status(404).render('join', { state: 'not_found' });

    dao.assignTeacher(user.id, teacher.id, (err) => {
      if (err) return res.status(500).render('error');
      req.session.user.teacherId = teacher.id;
      res.locals.user.teacherId = teacher.id;
      res.render('join', { state: 'success' });
    });
  });
});

module.exports = router;
