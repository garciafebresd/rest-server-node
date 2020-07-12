const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const { checkToken } = require("../midlewares/authentication");

let app = express();

let Usuario = require("../models/usuario");
let Producto = require("../models/producto");

app.use(fileUpload({ useTempFiles: true }));

app.put("/upload/:type/:id", checkToken, (req, res) => {
    const type = req.params.type;
    const id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: "No selected file",
            },
        });
    }

    let validTypes = ["productos", "usuarios"];
    if (validTypes.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: "valid types: " + validTypes.join(", "),
            },
        });
    }

    let archivo = req.files.archivo;
    let splitName = archivo.name.split(".");
    let extension = splitName[splitName.length - 1];

    let validExtensions = ["png", "jpg", "jpeg", "gif"];

    if (validExtensions.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: "Valid extensions: " + validExtensions.join(", "),
            },
            ext: extension,
        });
    }

    let filename = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${type}/${filename}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        if (type === "usuarios") {
            usuariosImagen(id, res, filename);
        } else {
            productosImagen(id, res, filename);
        }
    });
});

let usuariosImagen = (id, res, filename) => {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            deleteFile(filename, "usuarios");
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        if (!usuarioDB) {
            deleteFile(filename, "usuarios");
            return res.status(400).json({
                ok: false,
                err: {
                    message: "User not found",
                },
            });
        }

        // check if exist and delete old image
        deleteFile(usuarioDB.img, "usuarios");

        usuarioDB.img = filename;
        usuarioDB.save((err, usuarioSaved) => {
            res.json({
                ok: true,
                usuario: usuarioSaved,
            });
        });
    });
};

let productosImagen = (id, res, filename) => {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            deleteFile(filename, "productos");
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        if (!productoDB) {
            deleteFile(filename, "productos");
            return res.status(400).json({
                ok: false,
                err: {
                    message: "product not found",
                },
            });
        }

        deleteFile(productoDB.img, "productos");

        productoDB.img = filename;
        productoDB.save((err, productoSaved) => {
            res.json({
                ok: true,
                usuario: productoSaved,
            });
        });
    });
};

let deleteFile = (imageName, type) => {
    // check if exist and delete old image
    let pathImage = path.resolve(__dirname, `../../uploads/${type}/${imageName}`);
    if (fs.existsSync(pathImage)) {
        fs.unlinkSync(pathImage);
    }
};

module.exports = app;