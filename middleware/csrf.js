const crypto = require('crypto');

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

function csrfMiddleware(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    req.session.save((err) => {
      if (err) console.error('CSRF session save error:', err);
      res.locals.csrfToken = req.session.csrfToken;
      next();
    });
  } else {
    res.locals.csrfToken = req.session.csrfToken;
    next();
  }
}

function csrfProtection(req, res, next) {
  if (SAFE_METHODS.includes(req.method)) return next();

  const token = req.headers['x-csrf-token'];
  if (!token || !req.session.csrfToken || token !== req.session.csrfToken) {
    return res.status(403).json({ message: 'Solicitud rechazada: token CSRF inválido' });
  }
  next();
}

module.exports = { csrfMiddleware, csrfProtection };
