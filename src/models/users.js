const mongoose = require("mongoose");
const validator = require("validator");


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        // required:true,
        minlength:4
    },
    email:{
        type:String,
        // required:true,
        unique:[true, "Email id already exist"],
        validator(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email")
            }
        }
    },
    phone:{
        type:Number,
        min:10,
        // required:true,
        unique:true
    },
    password:{
        type:String,
        // required:true
    },
    profileImage:String
});

// userSchema.methods.comparePassword = async function (password) {
//     return await password, this.password;
//   };

const User = new mongoose.model("User",userSchema);

module.exports =User;