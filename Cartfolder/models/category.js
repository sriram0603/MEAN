var mongoose = require('mongoose');

//Category schema

var CategorySchema = mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    slug:{
        type: String,
    }
    
});

var Page = module.exports = mongoose.model('Category', CategorySchema);