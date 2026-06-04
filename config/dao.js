const { user } = require("./db");

class DAO {
    constructor(pool) { this.pool = pool; }

    checkEmail(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "SELECT id FROM usuarios WHERE email LIKE ?"
                connection.query(stringQuery, email, (err, resultado) => {
                    connection.release();
                    if (err) callback(err)
                    else callback(null, resultado.length === 0)
                })
            }
        })
    }

    checkTagname(tagname, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "SELECT id FROM usuarios WHERE tagname LIKE ?"
                connection.query(stringQuery, tagname, (err, resultado) => {
                    connection.release();
                    if (err) callback(err)
                    else callback(null, resultado.length === 0)
                })
            }
        })
    }

    checkEmailOrTagname(tagnameOrEmail, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "SELECT id FROM usuarios WHERE tagname LIKE ? OR email LIKE ?"
                connection.query(stringQuery, [tagnameOrEmail, tagnameOrEmail], (err, resultado) => {
                    connection.release();
                    if (err) callback(err)
                    else callback(null, resultado.length === 1)
                })
            }
        })
    }

    checkUser(tagnameOrEmail, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "SELECT * FROM usuarios WHERE (tagname LIKE ? OR email LIKE ?)"
                connection.query(stringQuery, [tagnameOrEmail,tagnameOrEmail], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null)
                    else if (resultado.length === 0) callback()
                    else {
                        let date = new Date(resultado[0].joindate);

                        let day = date.getDate();
                        let month = date.getMonth() + 1;   // Mes (0-11, por lo que sumamos 1 para que sea 1-12)
                        let year = date.getFullYear();
                        let joindate = {
                            day,
                            month,
                            year
                        }
                        let user = { 
                            id:resultado[0].id,
                            name:resultado[0].name,
                            tagname:resultado[0].tagname,
                            email:resultado[0].email,
                            friendCode:resultado[0].friendCode,
                            active:resultado[0].active,
                            password:resultado[0].password,
                            joindate
                        }
                        callback(null, user)
                    } 
                })
            }
        })
    }

    createUser(user,callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "INSERT INTO usuarios (tagname, email, password, name, friendCode) VALUES (?,?,?,?,?)"
                connection.query(stringQuery, Object.values(user), (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null)
                    else {
                        let id = resultado.insertId
                        callback(null, id)
                    }
                })
            }
        })
    }

    getIconsFromId(id,callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "SELECT i.id, i.name, i.path, i.unlockCondition, ui.isSelected FROM icons as i JOIN usericons as ui ON i.id = ui.iconId WHERE ui.userId = ? AND i.isDefault = 0;"
                connection.query(stringQuery,id, (err, resultado) => {
                    connection.release();
                    if (err) callback(err)
                    else callback(null, resultado.map(ele => ({  
                        id:ele.id,
                        name:ele.name,
                        path:ele.path,
                        unlockCondition: ele.unlockCondition,
                        isSelected: ele.isSelected
                    })))
                })
            }
        })
    }
    
    getUserLevel(userId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "SELECT * FROM userlevel WHERE idUser = ?"
                connection.query(stringQuery, [userId], (err, resultado) => {
                    connection.release();
                    if (err) callback(err)
                    else callback(null, resultado.map(ele => ({  
                            level:ele.level,
                            experience:ele.experience,
                            experienceToNext: ele.experienceToNext
                    })))
                })
            }
        })
    }

    updateUserLevel(userId, level, experience, experienceToNext, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err);
            else {
                let stringQuery = ` UPDATE userlevel SET level = ?, experience = ?, experienceToNext = ? WHERE idUser = ?`;
                connection.query(stringQuery, [level, experience, experienceToNext, userId], (err, result) => {
                    connection.release();
                    if (err) callback(err);
                    else callback(null, true);
                });
            }
        });
    }

    getExperienceByLevel(level, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err);
            else {
                let stringQuery = "SELECT experienceRequired FROM levelprogression WHERE level = ?";
                
                connection.query(stringQuery, [level], (err, result) => {
                    connection.release();
                    if (err) callback(err);
                    else  callback(null, result[0].experienceRequired);
                });
            }
        });
    }

    unlockInitialIcons(userId,callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `
                    INSERT INTO usericons (userId, iconId, isSelected, bgColor)
                    SELECT ?, id, isDefault, "transparent"
                    FROM icons
                    WHERE unlockOnCreate = 1;
                `
                connection.query(stringQuery, [userId], (err, resultado) => {
                    connection.release();
                    if (err) return callback(err, null);
                    callback(null, true);
                })
            }
        })
    }

    unlockIcon(userId, iconId, value,callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "INSERT INTO usericons (userId, iconId, isSelected, bgColor) VALUES (?,?,?,?)"
                connection.query(stringQuery, [userId, iconId, value, "transparent"], (err, resultado) => {
                    connection.release();
                    if (err) return callback(err, null);
                    callback(null, true);
                })
            }
        })
    }

    initializeExperience(userId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "INSERT INTO userlevel (idUser, level, experience, experienceToNext) VALUES (?,?,?,?)"
                connection.query(stringQuery, [userId, 1, 0, 150], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, true);
                })
            }
        })
    }

    getPreferences(userId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "SELECT * FROM userpreferences WHERE idUser = ?"
                connection.query(stringQuery, [userId], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else if (resultado.length === 0) callback(null, null)
                    else callback(null, resultado.map(ele => ({  
                        showTutorial:ele.showTutorial,
                    }))[0])
                })
            }
        })
    }

    hideTutorial(userId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "INSERT INTO userpreferences (idUser, showTutorial) VALUES (?,?)"
                connection.query(stringQuery, [userId,0], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null,true)
                })
            }
        })
    }

    saveRecord( id, dificultad, perfecto, excelente, genial, bien, ok, aciertos, fallos, puntuacion, tiemposIndividuales, notas, resultados, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `INSERT INTO userrecord 
                    (userId, difficulty, perfect, excellent, great, good, ok, success, error, points, notes, results, individualTimes) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                
                let values = [
                    id,
                    dificultad,
                    perfecto,
                    excelente,
                    genial,
                    bien,
                    ok,
                    aciertos,
                    fallos,
                    puntuacion,
                    JSON.stringify(notas), 
                    JSON.stringify(resultados),
                    JSON.stringify(tiemposIndividuales)
                ];
                connection.query(query, values, (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, true);
                });
            }
        });
    }

    getRecordsFromId(userId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = "SELECT * FROM userrecord WHERE userId = ? ORDER BY time DESC";
                connection.query(query, [userId], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        resultado = resultado.map(record => {
                            let date = new Date(record.time);
                            record.time = {
                                seconds: date.getSeconds().toString().padStart(2, '0'),
                                minutes: date.getMinutes().toString().padStart(2, '0'),
                                hour: date.getHours().toString().padStart(2, '0'),
                                day: date.getDate().toString().padStart(2, '0'), 
                                month: (date.getMonth() + 1).toString().padStart(2, '0'), 
                                year: date.getFullYear()
                            };
                            return record;
                        });
            
                        callback(null, resultado);
                    }
                });
            }
        });
    }
    
    getTopRecordsFromId(userId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = "SELECT * FROM userrecord WHERE userId = ? ORDER BY points DESC LIMIT 3";
                connection.query(query, [userId], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        resultado = resultado.map(record => {
                            let date = new Date(record.time);
                            record.time = {
                                day: date.getDate().toString().padStart(2, '0'), 
                                month: (date.getMonth() + 1).toString().padStart(2, '0'), 
                                year: date.getFullYear()
                            };
                            return record;
                        });
            
                        callback(null, resultado);
                    }
                });
            }
        });
    }
    getTopRecordsByDifficulty(difficulty, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `
                            SELECT 
                            u.id, 
                            u.tagname, 
                            u.email, 
                            u.friendCode, 
                            r.gameId, 
                            r.time, 
                            ui.bgColor, 
                            i.path, 
                            r.points
                            FROM userrecord r
                            JOIN (
                                SELECT userId, MAX(points) AS maxPoints
                                FROM userrecord
                                WHERE difficulty = ?
                                GROUP BY userId
                            ) maxr ON r.userId = maxr.userId AND r.points = maxr.maxPoints
                            JOIN usuarios u ON r.userId = u.id
                            JOIN usericons ui ON u.id = ui.userId
                            JOIN icons i ON i.id = ui.iconId
                            WHERE ui.isSelected = 1 AND r.difficulty = ?
                            ORDER BY r.points DESC
                            LIMIT 10;

                            `
                connection.query(query, [difficulty, difficulty], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        resultado = resultado.map(record => {
                            let date = new Date(record.time);
                            record.time = {
                                day: date.getDate().toString().padStart(2, '0'), 
                                month: (date.getMonth() + 1).toString().padStart(2, '0'), 
                                year: date.getFullYear()
                            };
                            return record;
                        });
            
                        callback(null, resultado);
                    }
                });
            }
        });
    }

    getProfileIconFromId(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `SELECT ui.bgColor, i.path FROM icons as i JOIN usericons as ui ON i.id = ui.iconId JOIN usuarios as u on u.id = ui.userid WHERE 
                ui.isSelected = 1 AND u.id = ?;`
                connection.query(query, [id], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado);
                });
            }
        });
    }

    deleteUser(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `CALL deleteUser(?);`
                connection.query(query, [id], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado);
                });
            }
        });
    }
    setEmptySelectedIcon(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `UPDATE usericons SET isSelected = 0 WHERE userId = ? AND isSelected = 1`
                connection.query(query, [id], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado);
                });
            }
        });
    }
    setSelectedIcon(id, iconId, bgColor, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `UPDATE usericons SET isSelected = 1, bgColor = ? WHERE userId = ? AND iconId = ?`
                connection.query(query, [bgColor,id,iconId], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado); 
                });
            }
        });
    }
    getStatsByIdAndDifficulty(id, difficulty, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `SELECT DATE(time) AS fecha, MAX(points) AS puntos FROM userrecord WHERE userId = ? AND difficulty=? GROUP BY DATE(time) ORDER BY fecha;`
                connection.query(query, [id,difficulty], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado);
                });
            }
        });
    }

    getUserByFriendcode(friendCode, ownId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `
                SELECT DISTINCT u.id, u.tagname, i.path, ui.bgColor, a.state, a.userId, a.friendId
                FROM usuarios AS u
                JOIN usericons AS ui ON u.id = ui.userId
                JOIN icons AS i ON ui.iconId = i.id
                LEFT JOIN amigos AS a 
                ON (
                    (a.userId = ? AND a.friendId = u.id) OR 
                    (a.friendId = ? AND a.userId = u.id)
                    )
                WHERE ui.isSelected = 1
                AND u.friendCode = ?
                AND u.id != ?;
                ;`
                connection.query(query,[ownId,ownId,friendCode,ownId], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado);
                });
            }
        });
    }
    sendRequest(ownId, friendId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `INSERT INTO amigos (userId, friendId, state) VALUES (?, ?, 'pendiente');`
                connection.query(query,[ownId,friendId], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado);
                });
            }
        });
    }


    getSentRequests(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `   SELECT u.id, u.tagname, u.friendCode, i.path, ui.bgColor 
                                FROM amigos AS a JOIN usuarios AS u ON a.friendId = u.id JOIN usericons AS ui ON u.id = ui.userId JOIN icons AS i ON ui.iconId = i.id
                                WHERE a.userId=? AND state='pendiente' AND ui.isSelected=1;`
                connection.query(query,id, (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado);
                });
            }
        });
    }

    getReceivedRequests(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `
                                SELECT u.id, u.tagname, u.friendCode, i.path, ui.bgColor 
                                FROM amigos AS a JOIN usuarios AS u ON a.userId = u.id JOIN usericons AS ui ON u.id = ui.userId JOIN icons AS i ON ui.iconId = i.id
                                WHERE a.friendId=? AND state='pendiente' AND ui.isSelected=1;`
                connection.query(query,id, (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado);
                });
            }
        });
    }
    getFriends(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `
                        SELECT DISTINCT u.id, u.tagname, u.friendCode, i.path, ui.bgColor
                        FROM amigos AS a
                        JOIN usuarios AS u ON (a.friendId = u.id AND a.userId = ?) OR (a.userId = u.id AND a.friendId = ?)
                        JOIN usericons AS ui ON u.id = ui.userId
                        JOIN icons AS i ON ui.iconId = i.id
                        WHERE a.state = 'aceptado'
                        AND ui.isSelected = 1
                        AND u.id != ?;
                `
                connection.query(query,[id,id,id], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado);
                });
            }
        });
    }

    acceptRequest(selfId,friendId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `
                    UPDATE amigos SET state = 'aceptado' WHERE userId = ? AND friendId = ?;
                `
                connection.query(query,[friendId,selfId], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado);
                });
            }
        });
    }

    dropRequest(selfId,friendId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `
                        DELETE FROM amigos WHERE userId = ? AND friendId = ? OR userId = ? AND friendId = ?;
                `
                connection.query(query,[friendId, selfId, selfId, friendId], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado);
                });
            }
        });
    }
   
    getAverage(userId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `
                SELECT
                    difficulty,
                    ROUND(AVG((success * 1.0 / (success + error)) * 100), 2) AS avg_accuracy_percentage
                FROM
                    userrecord
                WHERE
                    userId = ?
                    AND (success + error) > 0
                GROUP BY
                    difficulty;

                `
                connection.query(query,[userId], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado);
                });
            }
        });
    }

    getAverageTiming(userId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `
                SELECT 
                    difficulty,
                    ROUND(AVG(perfect * 100.0 / NULLIF(perfect + excellent + great + good + ok, 0)), 2) AS pct_perfect,
                    ROUND(AVG(excellent * 100.0 / NULLIF(perfect + excellent + great + good + ok, 0)), 2) AS pct_excellent,
                    ROUND(AVG(great * 100.0 / NULLIF(perfect + excellent + great + good + ok, 0)), 2) AS pct_great,
                    ROUND(AVG(good * 100.0 / NULLIF(perfect + excellent + great + good + ok, 0)), 2) AS pct_good,
                    ROUND(AVG(ok * 100.0 / NULLIF(perfect + excellent + great + good + ok, 0)), 2) AS pct_ok
                FROM 
                    userrecord
                WHERE 
                    userId = ? 
                    AND (perfect + excellent + great + good + ok) > 0
                GROUP BY 
                    difficulty;

                `
                connection.query(query,[userId], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado);
                });
            }
        });
    }

    
    
    getTotalPlayed(userId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `
                SELECT
                    difficulty,
                    COUNT(*) AS games_played
                FROM
                    userrecord
                WHERE
                    userId = ?
                GROUP BY
                    difficulty;
                `
                connection.query(query,[userId], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado);
                });
            }
        });
    } 
    getAllStatsForUser(userId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `
                SELECT difficulty, DATE(time) AS fecha, MAX(points) AS puntos
                FROM userrecord
                WHERE userId = ?
                GROUP BY difficulty, DATE(time)
                ORDER BY difficulty, fecha;
                `
                connection.query(query, [userId], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        const byLevel = {};
                        resultado.forEach(row => {
                            if (!byLevel[row.difficulty]) byLevel[row.difficulty] = [];
                            byLevel[row.difficulty].push({ fecha: row.fecha, puntos: row.puntos });
                        });
                        callback(null, byLevel);
                    }
                });
            }
        });
    }

    getUserLogros(userId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) return callback(err, null);
            const query = `
                SELECT l.*, ul.unlockedAt,
                       IF(ul.userId IS NOT NULL, 1, 0) AS isUnlocked
                FROM logros l
                LEFT JOIN usuario_logros ul ON l.id = ul.logroId AND ul.userId = ?
                ORDER BY l.id;
            `;
            connection.query(query, [userId], (err, resultado) => {
                connection.release();
                if (err) return callback(err, null);
                callback(null, resultado);
            });
        });
    }

    unlockLogro(userId, logroId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) return callback(err, null);
            const query = `INSERT IGNORE INTO usuario_logros (userId, logroId) VALUES (?, ?)`;
            connection.query(query, [userId, logroId], (err, resultado) => {
                connection.release();
                if (err) return callback(err, null);
                callback(null, resultado.affectedRows > 0);
            });
        });
    }

    trackBgColor(userId, bgColor, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) return callback(err);
            connection.query(
                `INSERT IGNORE INTO user_bgcolor_history (userId, bgColor) VALUES (?, ?)`,
                [userId, bgColor], (err) => { connection.release(); callback(err || null); }
            );
        });
    }

    checkAndGrantLogros(userId, gameData, callback) {
        const BETA_CUTOFF = '2026-07-01';
        const FA_LEVELS = ['notes-do-re-mi-fa', 'chord-f-major', 'arp-c-major', 'oda-1', 'oda-3'];

        this.pool.getConnection((err, connection) => {
            if (err) return callback(err, null);

            const pendingQuery = `
                SELECT l.* FROM logros l
                WHERE l.id NOT IN (SELECT logroId FROM usuario_logros WHERE userId = ?)
            `;
            connection.query(pendingQuery, [userId], (err, pending) => {
                if (err) { connection.release(); return callback(err, null); }
                if (pending.length === 0) { connection.release(); return callback(null, []); }

                const needsConds = new Set(pending.map(l => l.condicion));

                const q = (sql, params) => new Promise(resolve => {
                    connection.query(sql, params, (err, r) => resolve(err ? null : r));
                });

                const queries = {
                    totalGames: needsConds.has('PRIMEROS_PASOS') || needsConds.has('VETERANO')
                        ? q(`SELECT COUNT(*) AS v FROM userrecord WHERE userId = ?`, [userId])
                        : Promise.resolve([{v:0}]),

                    isOG: needsConds.has('OG')
                        ? q(`SELECT 1 FROM usuarios WHERE id = ? AND joindate < ?`, [userId, BETA_CUTOFF])
                        : Promise.resolve([]),

                    everPerfect: needsConds.has('PRIMERA_SANGRE')
                        ? q(`SELECT 1 FROM userrecord WHERE userId = ? AND perfect > 0 LIMIT 1`, [userId])
                        : Promise.resolve([]),

                    maxStreak: needsConds.has('RACHA_FUEGO') || needsConds.has('IMPARABLE')
                        ? q(`WITH daily AS (SELECT DISTINCT DATE(time) AS d FROM userrecord WHERE userId = ?),
                             grp AS (SELECT d, DATE_SUB(d, INTERVAL ROW_NUMBER() OVER (ORDER BY d) DAY) AS g FROM daily),
                             lens AS (SELECT COUNT(*) AS l FROM grp GROUP BY g)
                             SELECT COALESCE(MAX(l),0) AS v FROM lens`, [userId])
                        : Promise.resolve([{v:0}]),

                    madrugador: needsConds.has('MADRUGADOR')
                        ? q(`SELECT 1 FROM userrecord WHERE userId = ? AND HOUR(time) < 8 LIMIT 1`, [userId])
                        : Promise.resolve([]),

                    noctambulo: needsConds.has('NOCTAMBULO')
                        ? q(`SELECT 1 FROM userrecord WHERE userId = ? AND HOUR(time) >= 23 LIMIT 1`, [userId])
                        : Promise.resolve([]),

                    maestroFa: needsConds.has('MAESTRO_CLAVE_FA')
                        ? q(`SELECT 1 FROM userrecord WHERE userId = ? AND difficulty IN (?) AND perfect >= 3 LIMIT 1`, [userId, FA_LEVELS])
                        : Promise.resolve([]),

                    bestRank: needsConds.has('TOP_10') || needsConds.has('NUMERO_1')
                        ? q(`WITH ranked AS (SELECT userId, difficulty, MAX(points) AS mp FROM userrecord GROUP BY userId, difficulty),
                             rk AS (SELECT userId, RANK() OVER (PARTITION BY difficulty ORDER BY mp DESC) AS pos FROM ranked)
                             SELECT COALESCE(MIN(pos), 9999) AS v FROM rk WHERE userId = ?`, [userId])
                        : Promise.resolve([{v:9999}]),

                    friendCount: needsConds.has('BIEN_ACOMPANADO') || needsConds.has('ALMA_FIESTA')
                        ? q(`SELECT COUNT(DISTINCT IF(userId=?,friendId,userId)) AS v FROM amigos WHERE (userId=? OR friendId=?) AND state='aceptado'`, [userId,userId,userId])
                        : Promise.resolve([{v:0}]),

                    changedIcon: needsConds.has('A_MI_MANERA')
                        ? q(`SELECT 1 FROM usericons ui JOIN icons i ON i.id=ui.iconId WHERE ui.userId=? AND ui.isSelected=1 AND (i.isDefault=0 OR ui.bgColor!='transparent') LIMIT 1`, [userId])
                        : Promise.resolve([]),

                    colorCount: needsConds.has('ARTISTA')
                        ? q(`SELECT COUNT(*) AS v FROM user_bgcolor_history WHERE userId=?`, [userId])
                        : Promise.resolve([{v:0}])
                };

                Promise.all(Object.values(queries)).then(results => {
                    connection.release();
                    const [totalGames, isOG, everPerfect, maxStreak, madrugador,
                           noctambulo, maestroFa, bestRank, friendCount, changedIcon, colorCount] =
                        results.map(r => r && r[0] ? r[0].v !== undefined ? r[0].v : r.length > 0 : 0);

                    const gameHasPerfect = (gameData.perfecto || 0) > 0;
                    const fallos = gameData.fallos;
                    const tiempos = gameData.tiemposIndividuales;
                    const totalTime = Array.isArray(tiempos) && tiempos.length > 0
                        ? tiempos.reduce((a, b) => a + b, 0) : Infinity;
                    const gameInFaLevel = FA_LEVELS.includes(gameData.dificultad || '');
                    const gameHasFaPerfect = gameInFaLevel && (gameData.perfecto || 0) >= 3;

                    const checks = {
                        OG: !!isOG,
                        PRIMERA_SANGRE: gameHasPerfect || !!everPerfect,
                        VELOCISTA: fallos === 0 && totalTime < 1000 && Array.isArray(tiempos) && tiempos.length > 0,
                        PRIMEROS_PASOS: totalGames >= 10,
                        VETERANO: totalGames >= 100,
                        RACHA_FUEGO: maxStreak >= 7,
                        IMPARABLE: maxStreak >= 30,
                        MADRUGADOR: !!madrugador,
                        NOCTAMBULO: !!noctambulo,
                        MAESTRO_CLAVE_FA: gameHasFaPerfect || !!maestroFa,
                        TOP_10: bestRank <= 10,
                        NUMERO_1: bestRank === 1,
                        BIEN_ACOMPANADO: friendCount >= 1,
                        ALMA_FIESTA: friendCount >= 5,
                        A_MI_MANERA: !!changedIcon,
                        ARTISTA: colorCount >= 5
                    };

                    const toUnlock = pending.filter(l => checks[l.condicion]);
                    if (toUnlock.length === 0) return callback(null, []);

                    const unlockPromises = toUnlock.map(logro => new Promise(resolve => {
                        this.unlockLogro(userId, logro.id, (err, wasNew) => {
                            resolve(wasNew ? logro : null);
                        });
                    }));

                    Promise.all(unlockPromises).then(res => callback(null, res.filter(Boolean)));
                });
            });
        });
    }

    getPositionsInRanking(userId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let query = `
               WITH ranked_users AS (
                    SELECT 
                        userId,
                        difficulty,
                        MAX(points) AS maxPoints
                    FROM userrecord
                    GROUP BY userId, difficulty
                ),
                ranking AS (
                    SELECT 
                        userId,
                        difficulty,
                        maxPoints,
                        RANK() OVER (PARTITION BY difficulty ORDER BY maxPoints DESC) AS rank_position
                    FROM ranked_users
                )
                SELECT 
                    difficulty,
                    rank_position
                FROM 
                    ranking
                WHERE 
                    userId = ?;


                `
                connection.query(query,[userId], (err, resultado) => {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado);
                });
            }
        });
    }
    
    
}

module.exports = DAO;
