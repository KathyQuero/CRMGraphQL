const mongoose = require('mongoose');

const ClienteSchema= mongoose.Schema({
    nombre:{
        type: String,
        require: true,
        trim: true
    },
    apellido:{
        type: String,
        require: true,
        trim: true
    },
    cedula:{
        type: String,
        require: true,
        trim: true,
        unique :true
    },
    email:{
        type: String,
        require: true,
        trim: true,
        unique :true
    },
    telefono:{
        type: String,
        require: true,
        trim: true
    },
    creado:{
        type: Date,
        default: Date.now()
    },
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'Usuario'
    }
});

module.exports = mongoose.model('Cliente', ClienteSchema);