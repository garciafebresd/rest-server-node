const express = require("express");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Usuario = require("../models/usuario");

const app = express();

app.post("/login", (req, res) => {
    let params = req.body;

    Usuario.findOne({ email: params.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err,
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                error: "Usuario o contraseña incorrectos",
            });
        }

        if (!bcrypt.compareSync(params.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                error: "Usuario o contraseña incorrectos",
            });
        }

        let token = jwt.sign({
                usuario: usuarioDB,
            },
            process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRED_IN }
        );

        res.json({
            ok: true,
            Usuario: usuarioDB,
            token: token,
        });
    });
});

module.exports = app;