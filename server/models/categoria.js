const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        unique: true,
        required: [true, 'La descripcion es obligatorio']
    },
    usuario: {
        type: String,
        required: [true, 'El usuario es obligatorio']
    }
});

module.exports = mongoose.model('categoria', categoriaSchema);