const express = require("express");
const app = express();

const Usuario = require('../models/usuario');

app.get("/usuario", function(req, res) {
    res.json("get usuario");
});

app.post("/usuario", function(req, res) {
    const params = req.body;

    if (params.nombre === undefined) {
        res.status(400).json({
            ok: false,
            message: 'El parametro nombre obligatorio'
        });
    }

    let usuario = new Usuario({
        nombre: params.nombre,
        email: params.email,
        password: params.password,
        role: params.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.put("/usuario/:id", function(req, res) {
    const id = req.params.id;

    res.json({
        id
    });
});

app.delete("/usuario", function(req, res) {
    res.json("delete usuario");
});

module.exports = app;