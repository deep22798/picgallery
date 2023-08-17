const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
    title:String,
    discription:String
});

// userSchema.methods.comparePassword = async function (password) {
//     return await password, this.password;
//   };

const About = new mongoose.model("About",aboutSchema);

module.exports =About;