const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema({
    userId:String,
    name:String,
    image:String
});

// userSchema.methods.comparePassword = async function (password) {
//     return await password, this.password;
//   };

const Categories = new mongoose.model("Categories",categoriesSchema);

module.exports =Categories;