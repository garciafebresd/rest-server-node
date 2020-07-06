const express = require("express");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require("../models/usuario");
const { response } = require("./usuario");

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

// Configuraciones de google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };

}

app.post("/google", async(req, res) => {
    let token = req.body.idtoken;

    let googleUser = await verify(token).catch(err => {
        return response.status(403).json({
            ok: false,
            err
        });
    });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: err,
            });
        }

        if (!usuarioDB) {

            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'; // solo para pasar la validacion de la base de datos

            usuario.save((err, usuario__) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        error: err,
                    });
                }

                let token = jwt.sign({
                        usuario: usuario__,
                    },
                    process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRED_IN }
                );

                return res.json({
                    ok: true,
                    usuario: usuario__,
                    token
                });
            });
        }

        if (usuarioDB.google === false) {
            return res.status(400).json({
                ok: false,
                error: 'Usuario no esta autentucado con google, debe utilizar su autenticacion normal',
            });
        }

        let token = jwt.sign({
                usuario: usuarioDB,
            },
            process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRED_IN }
        );

        return res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });

});


module.exports = app;