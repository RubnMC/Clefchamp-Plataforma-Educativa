// TODO: Role assignment is currently admin-only (set directly in DB).
// Future work will expose role selection in the registration UI.

const isStudent = (req, res, next) =>
    res.locals.user?.role === 'student' ? next() : res.redirect('/');

const isTeacher = (req, res, next) =>
    res.locals.user?.role === 'teacher' ? next() : res.redirect('/');

const requireAuth = (req, res, next) => {
    if (res.locals.user) return next();
    req.session.returnTo = req.originalUrl;
    res.redirect('/users/login');
};

module.exports = { isStudent, isTeacher, requireAuth };
