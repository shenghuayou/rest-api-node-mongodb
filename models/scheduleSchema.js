var mongoose    =   require("mongoose");
mongoose.Promise = global.Promise;
var scheduleSchema  = {
	"Email" : String,
    "Event" : String,
    "Time" : String
};

module.exports = mongoose.model('schedule',scheduleSchema);;
