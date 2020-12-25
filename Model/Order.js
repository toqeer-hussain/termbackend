var bcrypt = require("bcryptjs");
var mongoose=require("mongoose")
const { CartSchema } = require("./Cart")
const { ProductSchema } = require("./Product")
const { UserSchema } = require("./User")

let orderSchema= new mongoose.Schema({
    Productlsit:[ 
            {
                type:CartSchema
            }
            
       
    ],
    User:{type:UserSchema,},
    Shippingaddress:{
        type: String
    },
    helpid:String,
    status: {
        type: String,
        default: 'Not processed',
        enum: ['Not processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
      }
      ,
      Orderdate:{
          type: Date,

      }

},{timestamps:true})

let Order=mongoose.model("Order",orderSchema)
module.exports={Order,orderSchema}