const jwt = require('jsonwebtoken');

// Verifica el token
let checkToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }

        req.usuario = decoded.usuario;
        next();
    });

};

// Valida rol admin
let checkAdminRole = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {

        next();
        return;
    }

    return res.json({
        ok: false,
        err: {
            message: 'El usuario no es Administrador'
        }
    });
};

module.exports = {
    checkToken,
    checkAdminRole
};