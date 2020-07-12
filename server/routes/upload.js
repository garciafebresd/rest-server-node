const express = require('express');
const fileUpload = require('express-fileupload');

let app = express();

app.use(fileUpload({ useTempFiles: true }));

app.put('/upload', (req, res) => {

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningun archivo'
            }
        });
    }

    let archivo = req.files.archivo;
    let splitName = archivo.name.split('.');
    let extension = splitName[splitName.length - 1];

    let extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son: ' + extensionesValidas.join(', ')
            },
            ext: extension
        });
    }


    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${ archivo.name }`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            message: 'File uploaded!'
        });
    });

});




module.exports = app;