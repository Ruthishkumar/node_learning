import mongoose from "mongoose";

const userImageSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    imageData : {
        type : String,
        required : true,
    },
    contentType  : {
        type : String,
        required : true,
    },
    uploadedAt : {
        type : Date,
        default : Date.now,
        required : true,
    }
});

export default mongoose.model("UserImage", userImageSchema);    