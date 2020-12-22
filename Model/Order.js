
var mongoose=require("mongoose")
const { ProductSchema } = require("./Product")
const { UserSchema } = require("./User")

let Order= new mongoose.Schema({
    ProductID:[
        {type:ProductSchema
        }
    ],
    User:{type:UserSchema},
    status: {
        type: String,
        default: 'Not processed',
        enum: ['Not processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
      }

},{timestamps:true})

module.exports=mongoose.model("Order",Order)