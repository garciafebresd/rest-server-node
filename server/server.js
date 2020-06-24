require('./config/config');

const express = require("express");
const app = express();
var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get("/usuario", function(req, res) {
    res.json("get usuario");
});

app.post("/usuario", function(req, res) {
    const usuario = req.body;

    if (usuario.nombre === undefined) {
        res.status(400).json({
            ok: false,
            message: 'El parametro nombre obligatorio'
        });
    }

    res.json({
        usuario
    });
});

app.put("/usuario:id", function(req, res) {
    const id = req.params.id;

    res.json({
        id
    });
});

app.delete("/usuario", function(req, res) {
    res.json("delete usuario");
});

app.listen(process.env.PORT, () => {
    console.log('listen port ' + process.env.PORT);
});