var mongoose = require('mongoose');

var admin = new mongoose.Schema({
    mobile: {type: String, unique: true, required: true},
    pwd: {type: String, required: true},
    uname: {type: String, required: true},
    createTime: {type: Date, required: true, default: Date.now},
});

module.exports = admin;