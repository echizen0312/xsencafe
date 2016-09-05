var mongoose = require('mongoose');

var order = new mongoose.Schema({
    mobile: {type: String, required: true},
    uname: {type: String, required: true},
    item: {type: String, required: true},
    cnt: {type: Number, required: true},
    unitPrice: {type: Number, required: true},
    type: {type: Number, required: true},
    admin: {type: String, required: true},
    createTime: {type: Date, required: true, default: Date.now},
});

module.exports = order;