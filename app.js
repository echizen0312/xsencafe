var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var app = express();
var port = 3000;
var dbIP = '10.255.31.110';

mongoose.connect('mongodb://' + dbIP + '/cafe');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen(port, function () {
    console.log('cafe start on port ' + port);
});

app.use(cookieParser());
app.use(session({
    secret: '159753',
    name: 'com.limit.cafe',
    cookie: {maxAge: 30 * 60 * 1000},
    resave: false,
    saveUninitialized: true,
}));

app.use('/web', express.static(path.join(__dirname, 'static')));
app.all('/', function (req, res) {
    res.send('hello world !');
});