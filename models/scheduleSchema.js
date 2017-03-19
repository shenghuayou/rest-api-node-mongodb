var mongoose    =   require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/users');
var scheduleSchema  = {
    "Event" : String,
    "Time" : String
};


module.exports = mongoose.model('schedule',scheduleSchema);;
