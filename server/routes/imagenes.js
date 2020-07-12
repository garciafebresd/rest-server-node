const express = require("express");
const fs = require("fs");
const path = require("path");

const { checkUrlToken } = require("../midlewares/authentication");

app = express();

app.get("/imagen/:type/:img", checkUrlToken, (req, res) => {
    let imgType = req.params.type;
    let img = req.params.img;

    let pathImage = path.resolve(__dirname, `../../uploads/${imgType}/${img}`);
    if (!fs.existsSync(pathImage)) {
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
        return res.sendFile(noImagePath);
    }

    res.sendFile(pathImage);
});

module.exports = app;