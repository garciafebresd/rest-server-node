const express = require("express");

const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');

const app = express();

app.get("/usuario", function(req, res) {

    let from = req.query.from || 0;
    from = Number(from);
    let limit = req.query.limit || 5;
    limit = Number(limit);

    const activeUsers = { estado: true };

    Usuario.find(activeUsers, 'nombre email role estado google img')
        .skip(from)
        .limit(limit)
        .exec((err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    error: err
                });
            }

            Usuario.count(activeUsers, (err, count) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        error: err
                    });
                }

                res.json({
                    ok: true,
                    usuarios: usuarioDB,
                    total: count
                });
            });
        });

});

app.get("/usuario/:id", function(req, res) {

    const id = req.params.id;

    Usuario.findById(id, 'nombre email role estado google img')
        .exec((err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    error: err
                });
            }

            res.json({
                ok: true,
                usuarios: usuarioDB,
            });
        });
});

app.post("/usuario", function(req, res) {
    const params = req.body;

    if (params.nombre === undefined) {
        res.status(400).json({
            ok: false,
            error: 'El parametro nombre es obligatorio'
        });
    }

    let usuario = new Usuario({
        nombre: params.nombre,
        email: params.email,
        password: bcrypt.hashSync(params.password, 10),
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
    const params = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    const options = {
        new: true,
        runValidators: true
    };

    Usuario.findByIdAndUpdate(id, params, options, (err, usuarioDB) => {

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

app.delete("/usuario/:id", function(req, res) {
    const id = req.params.id;

    const options = { new: true };
    const updateEstado = { estado: false };

    Usuario.findByIdAndUpdate(id, updateEstado, options, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        if (_.isNull(usuarioDB)) {
            return res.status(400).json({
                ok: false,
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });


    // Usuario.findByIdAndRemove(id, (err, usuarioDB) => {
    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             error: err
    //         });
    //     }
    //     if (_.isNull(usuarioDB)) {
    //         return res.status(400).json({
    //             ok: false,
    //             error: 'Usuario no encontrado'
    //         });
    //     }
    //     res.json({
    //         ok: true,
    //         usuario: usuarioDB
    //     });
    // });
});

module.exports = app;