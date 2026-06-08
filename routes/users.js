const express = require("express");
const router = express.Router();
const mysql = require("mysql");

const mysqlConfig = require("../config/db");
const DAO = require("../config/dao");
const { isStudent } = require("../middleware/roles");

const pool = mysql.createPool(mysqlConfig);
const dao = new DAO(pool);

const bcrypt = require('bcrypt');
const saltRounds = 10;
const { sendWelcomeEmail } = require('../config/mailer');
const levels = require('../data/levels.json');
router.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

const isLoggedIn = (req, res, next) => {
  if (res.locals.user) return next();
  res.redirect("/users/login");
};

const alreadyLoggedIn = (req, res, next) => {
  if (!res.locals.user) return next();
  res.redirect("/");
};

router.get("/", isLoggedIn, (req, res) => {
  res.render("home");
});

router.get("/api/getLocals", isLoggedIn, (req, res) => {
  res.json({ locals: res.locals.user });
});

router.get("/profile", isLoggedIn, (req, res) => {
  dao.getRecordsFromId(res.locals.user.id, (err, records) => {
    if (err) res.status(500).json({ message: "Error al obtener los registros" });
    else {
      dao.getTopRecordsFromId(res.locals.user.id, (err, topRecords) => {
        if (err) res.status(500).json({ message: "Error al obtener los registros" });
        else {
          dao.getIconsFromId(res.locals.user.id,(err,icons) => {
            if(err) console.log(err)
            else res.render("profile", {records, topRecords, icons, levels});
          })
        }
      });
    }
  });
});

router.get("/logout", isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Error al cerrar sesión" });
    res.clearCookie("connect.sid"); 
    res.redirect("/");
  });
});

router.get("/deleteAccount", isLoggedIn, (req, res) => {
  let id = res.locals.user.id
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Error al borrar cuenta" });
    dao.deleteUser(id, (err, user) => {
      if (err) {
        console.error("Error en login:", err);
        return res.status(500).json({ message: "Error en el inicio de sesión" });
      }
      res.clearCookie("connect.sid"); 
      res.redirect("/");
    });
  });
});

router.get("/login", alreadyLoggedIn, (req, res) => {
  res.render("login");
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  dao.checkUser(email, (err, user) => {
    if (err) {
      console.error("Error en login:", err);
      return res.status(500).json({ message: "Error en el inicio de sesión" });
    }
    
    if (!user) return res.json({ existe: false });
    
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparando contraseña:", err);
        return res.status(500).json({ message: "Error en el inicio de sesión" });
      }

      if (!isMatch) return res.json({ existe: false });

      dao.getUserLevel(user.id, (err, userLevel) => {
        if (err) {
          console.error("Error obteniendo nivel del usuario:", err);
          return res.status(500).json({ message: "Error en login" });
        }
        
        dao.getPreferences(user.id, (err, preferences) => {
          if(err) {
            console.log(err)
            return res.status(500).json({ message: "Error en el inicio de sesión" }); 
          }
          dao.getProfileIconFromId(user.id,(err, profile) => {
            if(preferences === null) {
              preferences = {
                showTutorial: true
              }
            }
            user.path = profile[0].path
            user.bgColor = profile[0].bgColor
            
            const sessionUser = {
              ...user,
              ...userLevel[0],
              preferences
            };
            
            req.session.user = sessionUser;
            res.locals.user = sessionUser;

            const returnTo = req.session.returnTo || null;
            delete req.session.returnTo;
            res.json({ existe: true, nombre: user.nombre, correo: user.correo, returnTo });
          });
        });
      });
    });
  });
});

router.get("/register", alreadyLoggedIn, (req, res) => {
  res.render("register");
});

router.post("/register", (req, res, next) => {
  const user = { ...req.body};
  bcrypt.hash(user.password, saltRounds, (hashErr, hash) => {
    if (hashErr) return next(new Error("Error al cifrar la contraseña"));
    user.password = hash; 
    dao.createUser(user, (createErr, userId) => {
      if (createErr) return next(new Error("Error en la creación de usuario"));
      dao.unlockInitialIcons(userId, (iconsErr) => {
        if (iconsErr) return next(new Error("Error desbloqueando iconos:" + iconsErr));              
        dao.initializeExperience(userId, (experienceErr) => {
          if (experienceErr) return next(new Error("Error inicializando la experiencia"));
          dao.checkUser(user.email, (checkErr, userData) => {
            if (checkErr) return next(new Error("Error comprobando el usuario en la BD"));
            dao.getUserLevel(userId, (levelErr, userLevel) => {
              if (levelErr) return next(new Error("Error obteniendo el nivel del usuario"));
              dao.getPreferences(userId, (preferencesErr, preferences) => {
                if(preferencesErr) return next(new Error("Error obteniendo las preferencias del usuario"));
                dao.getProfileIconFromId(userId, (err, profile) => {
                  if(preferences === null) {
                    preferences = {
                      showTutorial: true
                    }
                  }
                  dao.checkUser(user.email, (err, user) => {
                    if (err) {
                      console.error("Error en login:", err);
                      return res.status(500).json({ message: "Error en el inicio de sesión" });
                    }
                    
                    user.path = profile[0].path
                    user.bgColor = profile[0].bgColor
      
                    let userLevel = {
                      level:1,
                      experience: 0,
                      experienceToNext:150
                    }
                    user.id = userId
                    const sessionUser = {
                      ...user,
                      ...userLevel,
                      preferences
                    };
                    
                    req.session.user = sessionUser;
                    res.locals.user = sessionUser;
                    
                    //TODO: revisar esto
                    const returnTo = req.session.returnTo || null;
                    delete req.session.returnTo;

                    sendWelcomeEmail(user.email, user.nombre);

                    dao.checkAndGrantLogros(userId, {}, (err, newLogros) => {
                      if (newLogros && newLogros.length > 0) {
                        req.session.pendingAchievements = newLogros;
                      }
                      res.json({ existe: true, nombre: user.nombre, correo: user.correo, returnTo });
                    });
                    //TODO: revisar esto
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

router.get("/checkTagname", (req, res) => {
  let tagname = req.query.tagname;
  dao.checkTagname(tagname, (err, isValid) => {
    if (err) {
      console.error("Error en checkTagname:", err);
      return res.status(500).json({ message: "Error en checkTagname" });
    }
    res.json({ valido: isValid });
  });
});

router.get("/checkEmail", (req, res) => {
  let email = req.query.email;
  dao.checkEmail(email, (err, isValid) => {
    if (err) {
      console.error("Error en checkEmail:", err);
      return res.status(500).json({ message: "Error en checkEmail" });
    }
    res.json({ valido: isValid });
  });
});

router.get("/checkEmailOrTagname", (req, res) => {
  let emailOrTagname = req.query.email;
  dao.checkEmailOrTagname(emailOrTagname, (err, exists) => {
    if (err) {
      console.error("Error en checkEmailOrTagname:", err);
      return res.status(500).json({ message: "Error en checkEmailOrTagname" });
    }
    res.json({ existe: exists });
  });
});


router.post('/hideTutorial', isLoggedIn, (req, res) => {
  dao.hideTutorial(res.locals.user.id, (err, resultado) => {
    if(err) res.status(500).json({ message: "Error en hideTutorial" });
    res.locals.user.preferences.showTutorial = false
    res.json(true)
  })
});

router.get('/keyboardConfig', isLoggedIn, (req, res) => {
  dao.getKeyboardConfig(res.locals.user.id, (err, config) => {
    if (err) return res.status(500).json({ error: 'Error al obtener la configuración' });
    res.json({ config });
  });
});

router.post('/keyboardConfig', isLoggedIn, (req, res) => {
  const { notes } = req.body;
  if (!Array.isArray(notes) || notes.length !== 7) return res.status(400).json({ error: 'Configuración inválida' });
  const keys = notes.map(n => n.key);
  if (new Set(keys).size !== keys.length) return res.status(400).json({ error: 'Teclas duplicadas' });
  dao.saveKeyboardConfig(res.locals.user.id, notes, (err) => {
    if (err) return res.status(500).json({ error: 'Error al guardar la configuración' });
    req.session.user.keyboardConfig = notes;
    res.json({ ok: true });
  });
});

router.get("/globalRanking", (req, res) => {
  const levelIds = levels.map(l => l.id);
  const levelsRes = [];
  let idx = 0;
  const userId = res.locals.user ? res.locals.user.id : null;

  function fetchNext() {
    if (idx >= levelIds.length) {
      if (!userId) return res.render("globalRanking", { levelsRes, userRanking: {} });

      dao.getPositionsInRanking(userId, (err, positions) => {
        if (err) return res.render("globalRanking", { levelsRes, userRanking: {} });
        dao.getUserBestScores(userId, (err, scores) => {
          if (err) return res.render("globalRanking", { levelsRes, userRanking: {} });
          const userRanking = {};
          positions.forEach(p => { userRanking[p.difficulty] = { position: p.rank_position }; });
          scores.forEach(s => {
            if (userRanking[s.difficulty]) userRanking[s.difficulty].points = s.points;
            else userRanking[s.difficulty] = { points: s.points };
          });
          res.render("globalRanking", { levelsRes, userRanking });
        });
      });
      return;
    }
    const level = levels[idx++];
    dao.getTopRecordsByDifficulty(level.id, (err, result) => {
      if (err) return res.status(500).json({ message: "Error en globalRanking" });
      if (result.length > 0) levelsRes.push({ id: level.id, name: level.name, res: result });
      fetchNext();
    });
  }
  fetchNext();
});
router.post("/setProfileIcon", (req,res) => {
  const { color, dataId, path } = req.body;
  const userId = res.locals.user.id;
  dao.setEmptySelectedIcon(userId, (err) => {
    if (err) return res.status(500).json({ message: "Error en setProfileIcon" });
    dao.setSelectedIcon(userId, dataId, color, (err) => {
      if (err) return res.status(500).json({ message: "Error en setProfileIcon" });
      res.locals.user.bgColor = color;
      res.locals.user.path = path;
      dao.trackBgColor(userId, color, () => {
        dao.checkAndGrantLogros(userId, {}, (err, newAchievements) => {
          res.json({ success: true, newAchievements: newAchievements || [] });
        });
      });
    });
  });
})
router.get("/stats",isLoggedIn, (req, res) => {
  dao.getAverage(res.locals.user.id, (err, average) => {
      if (err) return res.status(500).json({ message: "Error en stats" });
      dao.getTotalPlayed(res.locals.user.id, (err, totalPlayed) => {
          if (err) return res.status(500).json({ message: "Error en stats" });
          dao.getPositionsInRanking(res.locals.user.id, (err, ranking) => {
              if (err) return res.status(500).json({ message: "Error en stats" });
              dao.getAverageTiming(res.locals.user.id, (err, averageTiming) => {
                if (err) return res.status(500).json({ message: "Error en stats" });

                const stats = {};
                levels.forEach(l => {
                  stats[l.id] = { gamesPlayed: 0, rank: null, accuracy: null, perfect: 0, excellent: 0, great: 0, good: 0, ok: 0 };
                });

                average.forEach(row => {
                  if (stats[row.difficulty]) stats[row.difficulty].accuracy = row.avg_accuracy_percentage;
                });
                totalPlayed.forEach(row => {
                  if (stats[row.difficulty]) stats[row.difficulty].gamesPlayed = row.games_played;
                });
                ranking.forEach(row => {
                  if (stats[row.difficulty]) stats[row.difficulty].rank = row.rank_position;
                });
                averageTiming.forEach(row => {
                  if (stats[row.difficulty]) {
                    stats[row.difficulty].perfect   = row.pct_perfect;
                    stats[row.difficulty].excellent = row.pct_excellent;
                    stats[row.difficulty].great     = row.pct_great;
                    stats[row.difficulty].good      = row.pct_good;
                    stats[row.difficulty].ok        = row.pct_ok;
                  }
                });

                res.render("stats", { stats, levels });
              });
          });
      });
  });
});

router.get("/settings",isLoggedIn, (req, res) => {
  res.render("settings")
});


router.get("/statsForUser",isLoggedIn, (req, res) => {
  dao.getAllStatsForUser(res.locals.user.id, (err, statsByLevel) => {
    if (err) return res.status(500).json({ message: "Error en statsForUser" });
    res.json({ statsByLevel });
  });
});

router.get('/getUserByFriendcode/:friendCode', (req, res) => {
  const { friendCode } = req.params;
  const fullFriendCode = "#" + friendCode
  dao.getUserByFriendcode(fullFriendCode,res.locals.user.id, (err, resultado) => {
    if (err) return res.status(500).json({ error: 'Error al obtener los datos' });
    res.json(resultado);
  });
});
router.get("/friends",isLoggedIn, (req, res) => {
  dao.getSentRequests(res.locals.user.id, (err1, sentList) => {
    if (err1) return res.status(500).json({ error: 'Error al obtener los datos 1' });
    dao.getReceivedRequests(res.locals.user.id, (err2, receivedList) => {
      if (err2) return res.status(500).json({ error: 'Error al obtener los datos 2' });
      dao.getFriends(res.locals.user.id, (err3, friendList) => {
        if (err3) return res.status(500).json({ error: 'Error al obtener los datos 3' });
        res.render("friends",{sentList, receivedList, friendList});
      });
    });
  });
})

router.post('/sendRequest', (req, res) => {
  const { friendId } = req.body;
  dao.sendRequest(res.locals.user.id,friendId, (err, resultado) => {
    if (err) return res.status(500).json({ error: 'Error al obtener los datos' });
    res.json(resultado);
  });
});

router.post('/acceptRequest', (req,res) => {
  const { friendId } = req.body;
  dao.acceptRequest(res.locals.user.id, friendId, (err) => {
    if (err) return res.status(500).json({ error: 'Error al obtener los datos' });
    dao.checkAndGrantLogros(res.locals.user.id, {}, (err, newLogros) => {
      if (newLogros && newLogros.length > 0) {
        req.session.pendingAchievements = (req.session.pendingAchievements || []).concat(newLogros);
      }
      res.redirect('/users/friends');
    });
  });
})

router.post('/dropRequest', (req,res) => {
  const { friendId } = req.body;
  dao.dropRequest(res.locals.user.id,friendId, (err, resultado) => {
    if (err) return res.status(500).json({ error: 'Error al obtener los datos' });
    res.redirect('/friends')
  });
})


router.get("/getSelfId", (req, res) => {
  res.json({ id: res.locals.user.id });
});

router.post('/joinClass', isLoggedIn, isStudent, (req, res) => {
  const { friendCode } = req.body;
  if (!friendCode) return res.status(400).json({ error: 'Código requerido' });

  const fullCode = friendCode.startsWith('#') ? friendCode : '#' + friendCode;

  dao.getTeacherByFriendCode(fullCode, (err, teacher) => {
    if (err) return res.status(500).json({ error: 'Error al buscar el profesor' });
    if (!teacher) return res.status(404).json({ error: 'Código no encontrado' });
    if (teacher.role !== 'teacher') return res.status(400).json({ error: 'El código no corresponde a un profesor' });

    dao.assignTeacher(res.locals.user.id, teacher.id, (err) => {
      if (err) return res.status(500).json({ error: 'Error al unirse a la clase' });

      req.session.user.teacherId = teacher.id;
      res.locals.user.teacherId = teacher.id;
      res.json({ ok: true });
    });
  });
});

router.get("/logros", isLoggedIn, (req, res) => {
  dao.checkAndGrantLogros(res.locals.user.id, {}, (err, newLogros) => {
    if (err) console.log("Error al comprobar logros:", err);
    dao.getUserLogros(res.locals.user.id, (err, logros) => {
      if (err) return res.status(500).json({ message: "Error al obtener logros" });
      res.render("logros", { logros, newLogros: newLogros || [] });
    });
  });
});

module.exports = router;
