import mongoose from "mongoose";

const readmeSchema = new mongoose.Schema({
    projectName:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true
    },
    technologies:{
        type:String,
        required:true
    },
    features:{
        type:String,
        required:true
    },
    markdown:{
        type:String,
        required:true
    }
},
{timestamps:true}
)

export default mongoose.model("Readme",readmeSchema);