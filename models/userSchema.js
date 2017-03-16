var mongoose    =   require("mongoose");
mongoose.connect('mongodb://localhost:27017/users');
var userSchema  = {
    "Email" : String,
    "Password" : String,
    "Usertype" : String
};
module.exports = mongoose.model('LoginUsers',userSchema);;
