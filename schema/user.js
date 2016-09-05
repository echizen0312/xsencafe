var mongoose = require('mongoose');

var user = new mongoose.Schema({
    mobile: {type: String, unique: true, required: true},
    uname: {type: String, required: true},
    admin: {type: String, required: true},
    ecnt: {type: Number, required: true, default: 0},
    createTime: {type: Date, required: true, default: Date.now},
});

module.exports = user;