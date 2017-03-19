var express     =   require("express");
var app         =   express();
var bodyParser  =   require("body-parser");
var router      =   express.Router();
var userSchema  =   require("./models/userSchema");
var passportFunc=   require("./passport")
var passport    =   require("passport")
var flash       =   require('connect-flash');
var morgan      =  require('morgan');
var cookieParser= require('cookie-parser');
var bodyParser  = require('body-parser');
var session     = require('express-session');

//all the app.use
passportFunc(passport);
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

//email check
function isEmail(email)
{
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 

//check if login
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

//handle gets
router.get("/",function(req,res){
    res.render("index.ejs");
});

router.get("/signup",function(req,res){
    res.render("signup.ejs");
});
router.get("/login",function(req,res){
    res.render("login.ejs",{ message: req.flash('loginMessage')});
});
router.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', {user : req.user});
});

//handle posts
router.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));


//REST requests
router.route("/api/users")
    .get(function(req,res){
        var response = {};
        userSchema.find({},function(err,data){
            if(err) {
                response = "fetching data error";
            } else {
                response = data;
            }
            res.json(response);
        });
    })

    .post(function(req,res){
        var db = new userSchema();
        var response = {};
        db.Email = req.body.Email.toLowerCase();
        db.Password = req.body.Password;
        db.Usertype = "normal";
        var check_format = isEmail(req.body.Email);
        var promise = userSchema.find({"Email":req.body.Email}).exec()
        promise.then(function(data){
            console.log(data.length);
            if ((check_format === true) && (data.length===0)) {
                db.save(function(err){
                    if(err) {
                        response = "adding data error";
                    } 
                    else {
                        response = "Data has been added";
                    }
                res.json(response);
                });
            }
            else if (check_format === false) {
                response ="please enter a correct email adress";
                res.json(response);
            }
            else{
                response = "username exist already";
                res.json(response);
            }   
        })   
    });

router.route("/api/users/:Email")
    .get(function(req,res){
        var response = {};
        userSchema.find({"Email":req.params.Email},function(err,data){
            if(err) {
                response = "fetching data error";
            } else {
                response = data
            }
            res.json(response);
        });
    })
    .put(function(req,res){
        var response = {};
        userSchema.find({"Email":req.params.Email},function(err,data){
            if(err) {
                response = "fetching data error";
            } 
            else {
                if(req.body.Email !== undefined) {
                    data.Email = req.body.Email;
                }
                if(req.body.Password !== undefined) {
                    data.Password = req.body.Password;
                }
                data.save(function(err){
                    if(err) {
                        response = "updating data error"
                    } else {
                        response = "Data has been updated for "+req.params.id
                    }
                    res.json(response);
                })
            }
        });
    })
    .delete(function(req,res){
        var response = {};
        userSchema.find({"Email":req.params.Email},function(err,data){
            if(err) {
                response = {"message" : "Error fetching data"};
            } else {
                userSchema.remove({"Email" : req.params.Email},function(err){
                    if(err) {
                        response = "Error deleting data"
                    } else {
                        response = "Data in"+req.params.Email+" has been deleted"
                    }
                    res.json(response);
                });
            }
        });
    })

app.use('/',router);

app.listen(3333);
console.log("server is up in port 3333");
