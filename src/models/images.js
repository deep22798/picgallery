const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    userId:String,
    category:String,
    images: [{type:String}],
    data: Buffer,
});
const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
