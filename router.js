var userSchema      =   require("./models/userSchema");
var scheduleSchema  =   require("./models/scheduleSchema");
var bcrypt           = require('bcrypt-nodejs');

module.exports = function(router, passport) {
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
        res.render('profile.ejs', {user : req.user, message:""});
    });

    //handle posts
    router.post('/login', passport.authenticate('local-login', {
                successRedirect : '/profile', // redirect to the secure profile section
                failureRedirect : '/login', // redirect back to the signup page if there is an error
                failureFlash : true // allow flash messages
            }));

    //REST requests for all users, build schedules
    router.route("/api/schedules")
        .get(isLoggedIn,function(req,res){
            var response = {};
            scheduleSchema.find({"Email":req.user.Email},function(err,data){
                if(err) {
                    response = "fetching data error";
                } else {
                    response = data;
                }
                res.render('schedule.ejs',{mySchedule:response})
            });
        })

        .post(isLoggedIn,function(req,res){
            var db = new scheduleSchema();
            var response = {};
            db.Email = req.user.Email;
            db.Event = req.body.Event;
            db.Time = req.body.Time;
            db.save(function(err){
                if(err) {
                    response = "adding schedule error";
                    res.json(response);
                } 
                else {
                    res.render('profile.ejs', {user : req.user, message:"you have created a new schedule"});
                }
            }) 
        })

        .put(isLoggedIn,function(req,res){

        })

        .delete(isLoggedIn,function(req,res){

        })


    //User info REST API. GET, PUT, DELETE requests for admin only
    router.route("/api/users/")
        .get(isLoggedIn,function(req,res){
            if (req.user.Usertype === "admin"){
                var response = {};
                userSchema.find({},function(err,data){
                    if(err) {
                        response = "fetching data error";
                    } else {
                        response = data;
                    }
                    res.json(response);
                });
            }
            else
                res.json("you have not right to view this");
        })

        .post(function(req,res){
            var db = new userSchema();
            var response = {};
            db.Email = req.body.Email.toLowerCase();
            db.Password = bcrypt.hashSync(req.body.Password, bcrypt.genSaltSync(8), null);
            db.Usertype = "normal";
            var check_format = isEmail(req.body.Email);
            var promise = userSchema.find({"Email":req.body.Email}).exec()
            promise.then(function(data){
                console.log(data.length);
                if ((db.Email === "admin") && (data.length===0)) {
                        db.Usertype = "admin";
                        db.save(function(err){
                        if(err) {
                            response = "adding data error";
                            res.json(response);
                        } 
                        else {
                            res.render("login.ejs",{ message:"You have created admin account"});
                        }
                   
                    });
                }
                else if ((check_format === true) && (data.length===0)) {
                    db.save(function(err){
                        if(err) {
                            response = "adding data error";
                            res.json(response);
                        } 
                        else {
                            res.render("login.ejs",{ message:"You have created account"});
                        }
                   
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
        })

        .put(isLoggedIn,function(req,res){
            var response = {};
            console.log(req.body.Password);
            userSchema.find({"Email":req.user.Email},function(err,data){
                if(err) {
                    response = "fetching data error";
                } 
                else {
                    if(req.body.Password !== undefined) {
                        data.Password = req.body.Password;
                        data.Usertype = "normal";
                        data.Email = req.user.Email;
                    }
                    data.save(function(err){
                        if(err) {
                            response = "updating data error";
                        } else {
                            response = "Data has been updated for "+req.user.Email;
                        }
                        res.json(response);
                    })
                }
            });
        })

        .delete(isLoggedIn,function(req,res){
            if (req.user.Usertype === "admin"){
                var response = {};
                userSchema.find({"Email":req.body.Email},function(err,data){
                    if(err) {
                        response = {"message" : "Error fetching data"};
                    } else {
                        userSchema.remove({"Email" : req.body.Email},function(err){
                            if(err) {
                                response = "Error deleting data"
                            } else {
                                response = "Data for ("+req.body.Email+") has been deleted"
                            }
                            res.json(response);
                        });
                    }
                });
            }
            else
                res.json("you have not right to do this");
        })

    }