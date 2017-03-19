var LocalStrategy    = require('passport-local').Strategy;
var userSchema       = require("./models/userSchema");


module.exports = function(passport) {
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        userSchema.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-login', new LocalStrategy({
        usernameField : 'Email',
        passwordField : 'Password',
        passReqToCallback : true 
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase();

        // asynchronous
        process.nextTick(function() {
            userSchema.findOne({ 'Email' :  email }, function(err, user) {
                if (err)
                    return done(err);
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'user is not found'));
                else if (password !==user.Password)
                    return done(null, false, req.flash('loginMessage', 'invalid password'));
                else
                    return done(null, user);
            });
        });

    }));


}