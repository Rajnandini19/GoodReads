const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength:32
    },
    description: {
        type: String,
        required: true,
        maxlength:2000
    },
    price: {
        type: Number,
        trim: true,
        required: true,
        maxlength:32
    },
    //when we refer to the product's category it will go to category model
    category: {
        type: ObjectId,
        ref: 'Category',
        required:true
    },
    //when someone buys a particular product the quantity 
    //will decrease and the sold value will go up
    quantity: {
        type:Number
    },
    sold: {
        type: Number,
        default:0
    },
    photo: {
        data:Buffer,
        contentType:String //image.png or image.jpg
    },
    //some products might have shipping some might have digital download
    shipping: {
        required:false,
        type:Boolean
    }


},{timestamps:true}
);



module.exports = mongoose.model("Product", productSchema);