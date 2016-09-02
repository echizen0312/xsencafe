var mongoose = require('mongoose');
var adminSchema = require('../schema/admin');

var admin = mongoose.model('admins', adminSchema);

module.exports = admin;