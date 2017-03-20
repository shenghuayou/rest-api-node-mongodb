var express     =   require("express");
var app         =   express();
var bodyParser  =   require("body-parser");
var router      =   express.Router();
var routerFunc  =   require("./router")
var passportFunc=   require("./passport")
var passport    =   require("passport")
var flash       =   require('connect-flash');
var morgan      =   require('morgan');
var cookieParser=   require('cookie-parser');
var bodyParser  =   require('body-parser');
var session     =   require('express-session');
var mongoose    =   require("mongoose");
var methodOverride = require('method-override');

//all the app.use
passportFunc(passport);
mongoose.connect('mongodb://localhost:27017/users');
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(cookieParser()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//allow to make request from other domains
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}
app.use(bodyParser.json());
app.use(allowCrossDomain);
routerFunc(router,passport);

app.use('/',router);

app.listen(3333);
console.log("server is up in port 3333");
