const express = require('express');

const { checkToken } = require('../midlewares/authentication');

let app = express();

const _ = require("underscore");
let Producto = require('../models/producto');
const { options } = require('./categoria');


app.get('/producto', checkToken, (req, res) => {
    let from = req.query.from || 0;
    from = Number(from);
    let limit = req.query.limit || 5;
    limit = Number(limit);

    const activeProducts = { disponible: true };

    Producto.find(activeProducts)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .sort('descripcion')
        .skip(from)
        .limit(limit)
        .exec((err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            Producto.countDocuments(activeProducts, (err, count) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        error: err,
                    });
                }

                res.json({
                    ok: true,
                    productos: productoDB,
                    total: count,
                });
            });
        });

});


app.get('/producto/:id', checkToken, (req, res) => {
    const id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    error: 'Producto no encontrado'
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });

});


app.get('/producto/buscar/:termino', checkToken, (req, res) => {
    const termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    error: 'Producto no encontrado'
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
});

app.post('/producto', checkToken, (req, res) => {
    const params = _.pick(req.body, ["nombre", "precioUni", "descripcion", "disponible", "categoria"]);

    if (params.nombre === undefined ||
        params.precioUni === undefined ||
        params.descripcion === undefined ||
        params.disponible === undefined ||
        params.categoria === undefined) {
        res.status(400).json({
            ok: false,
            error: "Debe enviar los parametros obligatorios: nombre, precioUni, descripcion, disponible, categoria"
        });
    }

    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: params.nombre,
        precioUni: params.precioUni,
        descripcion: params.descripcion,
        disponible: params.disponible,
        categoria: params.categoria
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });

});


app.put('/producto/:id', checkToken, (req, res) => {
    const id = req.params.id;
    const params = _.pick(req.body, ["nombre", "precioUni", "descripcion", "disponible"]);

    const options = {
        new: true,
        runValidations: true
    };

    Producto.findByIdAndUpdate(id, params, options, (err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                error: 'Producto no encontrado'
            });
        }

        res.json({
            ok: true,
            producto: productoDB,
            mensaje: 'Producto actualizado'
        });
    });
});


app.delete('/producto/:id', checkToken, (req, res) => {
    const id = req.params.id;

    const options = { new: true };
    const available = { disponible: false };

    Producto.findByIdAndUpdate(id, available, options, (err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                error: 'Producto no encontrado'
            });
        }

        res.json({
            ok: true,
            producto: productoDB,
            mensaje: 'Producto borrado'
        });
    });
});




module.exports = app;