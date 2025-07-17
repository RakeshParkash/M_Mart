const mongoose = require("mongoose");

const Product = new mongoose.Schema({
    image : {
        type : String,
        required : true
    },
    name : {
        type: String,
        required: true,
    },
    description : {
        type : String,
        required : true,
    },
    selling_Price : {
        type : String,
        required : true,
    },
    buying_Price : {
        type : String,
        required : true,
    },
    
});

const ProductModel = mongoose.model("Product",Product);

module.exports = ProductModel;