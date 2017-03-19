var mongoose    =   require("mongoose");
mongoose.Promise = global.Promise;
var userSchema  = {
    "Email" : String,
    "Password" : String,
    "Usertype" : String
};


module.exports = mongoose.model('LoginUsers',userSchema);;
