const mongoose = require("mongoose");

const Product = new mongoose.Schema({
    name : {
        type: String,
        required: true,
    },
    description : {
        type : String,
        required : true,
    },
    quantity_Unit : {
        type : String,
        required : true,
    },
    image : {
        type : String,
        required : true,
    },
    Stock : {
        type : String,
        required : false,
        default : "",
    },
    selling_Price : {
        type: Object,
        required: false,
        default: {},
    },
    buying_Price : {
        type: Object,
        required: false,
        default: {},
    },
    
});

const ProductModel = mongoose.model("Product",Product);

module.exports = ProductModel;