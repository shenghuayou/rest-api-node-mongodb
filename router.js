var userSchema      =   require("./models/userSchema");
var scheduleSchema  =   require("./models/scheduleSchema")

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
        res.render('profile.ejs', {user : req.user});
    });

    //handle posts
    router.post('/login', passport.authenticate('local-login', {
                successRedirect : '/profile', // redirect to the secure profile section
                failureRedirect : '/login', // redirect back to the signup page if there is an error
                failureFlash : true // allow flash messages
            }));

    //REST requests for all users
    router.route("/api/schedules")
        .get(isLoggedIn,function(req,res){

        })

        .post(isLoggedIn,function(req,res){

        })

        .put(isLoggedIn,function(req,res){

        })

        .delete(isLoggedIn,function(req,res){

        })


    //REST requests for admin only
    router.route("/api/users")
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
        });

    router.route("/api/users/:Email")
        .get(isLoggedIn,function(req,res){
            if (req.user.Usertype === "admin"){
                var response = {};
                userSchema.find({"Email":req.params.Email},function(err,data){
                    if(err) {
                        response = "fetching data error";
                    } else {
                        response = data
                    }
                    res.json(response);
                });
            }
            else
                res.json("you have not right to view this");
        })
        .put(isLoggedIn,function(req,res){
            if (req.user.Usertype === "admin"){
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
            }
            else
                res.json("you have not right to do this");
        })
        .delete(isLoggedIn,function(req,res){
            if (req.user.Usertype === "admin"){
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
            }
            else
                res.json("you have not right to do this");
        })

    }