var mongoose = require('mongoose');

var user = new mongoose.Schema({
    mobile: {type: String, unique: true, required: true},
    uname: {type: String, required: true},
    admin: {type: String, required: true},
    createTime: {type: Date, required: true, default: Date.now},
});

module.exports = user;