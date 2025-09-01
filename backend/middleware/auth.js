const db = require('../db/database');

function requireLogin(req, res, next) {
    if (req.session && req.session.user) return next();
    return res.redirect('/dashboard/login');
}

module.exports = { requireLogin };
