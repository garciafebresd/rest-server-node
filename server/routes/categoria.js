const express = require("express");

const { checkToken, checkAdminRole } = require("../midlewares/authentication");

const _ = require("underscore");
const Categoria = require("../models/categoria");

const app = express();

app.get("/categoria", checkToken, (req, res) => {
    let from = req.query.from || 0;
    from = Number(from);
    let limit = req.query.limit || 5;
    limit = Number(limit);

    Categoria.find({})
        .populate('usuario', 'nombre email')
        .sort('descripcion')
        .skip(from)
        .limit(limit)
        .exec((err, categoriaDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            Categoria.countDocuments({}, (err, count) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        error: err,
                    });
                }

                res.json({
                    ok: true,
                    categorias: categoriaDB,
                    total: count,
                });
            });
        });
});

app.get("/categoria/:id", checkToken, (req, res) => {
    const id = req.params.id;

    Categoria.findById(id).exec(
        (err, catetogiaDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    error: err,
                });
            }

            res.json({
                ok: true,
                categoria: catetogiaDB,
            });
        }
    );
});

app.post("/categoria", [checkToken, checkAdminRole], (req, res) => {
    const params = req.body;

    if (params.descripcion === undefined) {
        res.status(400).json({
            ok: false,
            error: "El parametro descripcion es obligatorio",
        });
    }

    let categoria = new Categoria({
        descripcion: params.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: err,
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                error: err,
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});

app.put("/categoria/:id", [checkToken, checkAdminRole], (req, res) => {
    //req.usuario._id;
    const id = req.params.id;
    const params = _.pick(req.body, ["descripcion"]);

    const options = {
        new: true,
        runValidators: true,
    };

    Categoria.findByIdAndUpdate(id, params, options, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err,
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                error: err,
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB,
        });
    });
});

app.delete("/categoria/:id", [checkToken, checkAdminRole], (req, res) => {
    const id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        if (_.isNull(categoriaDB)) {
            return res.status(400).json({
                ok: false,
                error: 'Categoria no encontrado'
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

module.exports = app;