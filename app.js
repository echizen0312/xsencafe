var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var async = require('async');
var app = express();
var config = require('./config');
var port = config.port;
var dbIP = config.dbIP;
var crypto = require('crypto');
var admin = require('./model/admin');
var user = require('./model/user');
var order = require('./model/order');

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

app.use('/wap', express.static(path.join(__dirname, 'static')));
app.all('/', function (req, res) {
    res.redirect('/wap/login.html');
});
app.all('/isLogin', function (req, res) {
    if (req.session.login != null) {
        if (req.session.login.isLogin) {
            res.json({success: true, msg: 'ok', login: req.session.login});
        } else {
            res.json({success: false, msg: 'not login'});
        }
    } else {
        res.json({success: false, msg: 'not login'});
    }
});
app.post('/login', function (req, res) {
    var mobile = req.body.mobile;
    var password = req.body.password;
    var md5 = crypto.createHash('md5');
    md5.update(password);
    var pass = md5.digest('hex');
    if (mobile && pass) {
        admin.findOne({mobile: mobile, pwd: pass}, function (err, a) {
            if (err) {
                res.json({success: false, msg: 'error'});
            } else {
                if (a != null) {
                    req.session.login = {isLogin: true, mobile: mobile};
                    res.json({success: true, msg: 'ok'});
                } else {
                    res.json({success: false, msg: 'error'});
                }
            }
        });
    } else {
        res.json({success: false, msg: 'null'});
    }
});
app.all('/exit', function (req, res) {
    req.session.login = {isLogin: false, mobile: ''};
    res.json({success: true, msg: 'ok'});
});
app.post('/regUser', function (req, res) {
    var mobile = req.body.mobile;
    var uname = req.body.uname;
    var admin = req.body.admin;
    var isL = isLogin(req);
    if (isL) {
        if (mobile && uname && admin) {
            var u = new user({mobile: mobile, uname: uname, admin: admin});
            u.save(function (err) {
                if (err) {
                    res.json({success: false, msg: 'reg error'});
                } else {
                    res.json({success: true, msg: 'ok'});
                }
            });
        } else {
            res.json({success: false, msg: 'null'});
        }
    } else {
        res.json({success: false, msg: '登录信息已过期，请重新登录'});
    }
});
app.post('/getUsers', function (req, res) {
    var isL = isLogin(req);
    if (isL) {
        user.find().sort({
                'createTime': 'desc'
            }
        ).exec(function (err, users) {
            if (err) {
                res.json({success: false, msg: 'error'});
            } else {
                res.json({success: true, msg: 'ok', rows: users});
            }
        });
    } else {
        res.json({success: false, msg: '登录信息已过期，请重新登录'});
    }
});
app.post('/searchUsers', function (req, res) {
    var kw = req.body.kw;
    var isL = isLogin(req);
    if (isL) {
        if (kw) {
            var reg = new RegExp(kw, 'i'); //不区分大小写
            user.find({
                $or: [
                    {mobile: {$regex: reg}},
                    {uname: {$regex: reg}}
                ]
            }).sort({
                    'createTime': 'desc'
                }
            ).exec(function (err, users) {
                if (err) {
                    res.json({success: false, msg: 'error'});
                } else {
                    res.json({success: true, msg: 'ok', rows: users});
                }
            });
        } else {
            res.json({success: false, msg: 'null'});
        }
    } else {
        res.json({success: false, msg: '登录信息已过期，请重新登录'});
    }
});
app.post('/buyItem', function (req, res) {
    var mobile = req.body.mobile;
    var uname = req.body.uname;
    var admin = req.body.admin;
    var menus = req.body.menus;
    var isL = isLogin(req);
    if (isL) {
        if (mobile && uname && admin && menus) {
            var i = 0;
            var cnt = menus.length;
            var oc = 0;
            async.whilst(function () {
                return i < cnt;
            }, function (callback) {
                var item = menus[i];
                i++;
                oc += item.num;
                if (item.num > 0) {
                    var o = new order({
                        mobile: mobile,
                        item: item.mname,
                        cnt: item.num,
                        unitPrice: item.money,
                        type: 1,
                        admin: admin,
                    });
                    o.save(function (err) {
                        if (err) {
                            callback('reg error');
                        } else {
                            callback();
                        }
                    });
                } else {
                    callback();
                }
            }, function (err) {
                if (err) {
                    res.json({success: false, msg: 'order ' + i + ' error'});
                } else {
                    user.findOne({mobile: mobile, uname: uname}, function (err, u) {
                        if (err) {
                            res.json({success: false, msg: 'error'});
                        } else {
                            if (u != null) {
                                var newC = u.ecnt + oc;
                                u.update({$set: {ecnt: newC}}, function (err) {
                                    if (err) {
                                        res.json({success: false, msg: 'error'});
                                    } else {
                                        res.json({success: true, msg: 'ok'});
                                    }
                                });
                            } else {
                                res.json({success: false, msg: 'error'});
                            }
                        }
                    });
                }
            });
        } else {
            res.json({success: false, msg: 'null'});
        }
    } else {
        res.json({success: false, msg: '登录信息已过期，请重新登录'});
    }
});
app.post('/getEcnt', function (req, res) {
    var mobile = req.body.mobile;
    var isL = isLogin(req);
    if (isL) {
        if (mobile) {
            user.findOne({mobile: mobile}, function (err, u) {
                if (err) {
                    res.json({success: false, msg: 'error'});
                } else {
                    if (u != null) {
                        res.json({success: true, msg: 'ok', ecnt: u.ecnt});
                    } else {
                        res.json({success: false, msg: 'error'});
                    }
                }
            });
        } else {
            res.json({success: false, msg: 'null'});
        }
    } else {
        res.json({success: false, msg: '登录信息已过期，请重新登录'});
    }
});
app.post('/exchangeItem', function (req, res) {
    var mobile = req.body.mobile;
    var uname = req.body.uname;
    var admin = req.body.admin;
    var menus = req.body.menus;
    var isL = isLogin(req);
    if (isL) {
        if (mobile && uname && admin && menus) {
            var i = 0;
            var cnt = menus.length;
            var oc = 0;
            async.whilst(function () {
                return i < cnt;
            }, function (callback) {
                var item = menus[i];
                i++;
                oc += item.num;
                if (item.num > 0) {
                    var o = new order({
                        mobile: mobile,
                        item: item.mname,
                        cnt: item.num,
                        unitPrice: item.money,
                        type: 2,
                        admin: admin,
                    });
                    o.save(function (err) {
                        if (err) {
                            callback('reg error');
                        } else {
                            callback();
                        }
                    });
                } else {
                    callback();
                }
            }, function (err) {
                if (err) {
                    res.json({success: false, msg: 'order ' + i + ' error'});
                } else {
                    user.findOne({mobile: mobile, uname: uname}, function (err, u) {
                        if (err) {
                            res.json({success: false, msg: 'error'});
                        } else {
                            if (u != null) {
                                var newC = u.ecnt - (oc * 2);
                                u.update({$set: {ecnt: newC}}, function (err) {
                                    if (err) {
                                        res.json({success: false, msg: 'error'});
                                    } else {
                                        res.json({success: true, msg: 'ok'});
                                    }
                                });
                            } else {
                                res.json({success: false, msg: 'error'});
                            }
                        }
                    });
                }
            });
        } else {
            res.json({success: false, msg: 'null'});
        }
    } else {
        res.json({success: false, msg: '登录信息已过期，请重新登录'});
    }
});
app.post('/getOrders', function (req, res) {
    var mobile = req.body.mobile;
    var isL = isLogin(req);
    if (isL) {
        if (mobile) {
            order.find({
                mobile: mobile
            }).sort({
                    'createTime': 'desc'
                }
            ).exec(function (err, orders) {
                if (err) {
                    res.json({success: false, msg: 'error'});
                } else {
                    res.json({success: true, msg: 'ok', rows: orders});
                }
            });
        } else {
            res.json({success: false, msg: 'null'});
        }
    } else {
        res.json({success: false, msg: '登录信息已过期，请重新登录'});
    }
});

function isLogin(req) {
    if (req.session.login != null) {
        if (req.session.login.isLogin) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}
app.all('/test', function (req, res) {
    var md5 = crypto.createHash('md5');
    md5.update('111111');
    var pass = md5.digest('hex');
    var ad = new admin({mobile: '13708803633', pwd: pass, uname: 'sakuya'});
    ad.save(function (err) {
        if (err) {
            res.json({success: false, msg: 'test error'});
        } else {
            res.json({success: true, msg: 'test ok'});
        }
    });
});