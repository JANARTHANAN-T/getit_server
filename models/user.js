const mongoose = require('mongoose');
const {Schema}=mongoose


const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    department:{
        type:String,
        default:'-'
    },
    password: {
        type: String,
    },
    district: {
        type: String,
    },
    taluk: {
        type: String,
    },
    pincode: {
        type: String,
    },
    preference:[ String ],
    isDeptAdmin:{
        type: Boolean,
        default:false,
    },
    deviceId:{
        type:String,
        default:"-",
    },
    joinedOn:{
        type: Date,
        default: Date.now,
    }
});


module.exports = mongoose.model("User", userSchema);
