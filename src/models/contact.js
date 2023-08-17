const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    title:String,
    email:String,
    phone:String,
    github:String,
    facebook:String,
    LinkdIn:String,
    Instagram:String,
    YouTube:String,
    Thread:String,
    Twitter:String,
    discription:String
});

// userSchema.methods.comparePassword = async function (password) {
//     return await password, this.password;
//   };

const Contact = new mongoose.model("Contact",contactSchema);

module.exports =Contact;