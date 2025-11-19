import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
        unique : true
    },
    "age" : {type: Number, required: true},
    "gender" : {type : String, enum : ['Male', 'Female', 'Other', ], required: true},
    "phoneNumber" : {type : String , required : true},
});

export default mongoose.model("Profile", profileSchema);
