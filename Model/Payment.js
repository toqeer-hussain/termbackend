const mongoose=require("mongoose")
const {UserSchema}=require('./User')
const {orderSchema}=require('./Order')
const { CartSchema } = require("./Cart")

const paymentschema=new mongoose.Schema({

user:{
    type:UserSchema   
},
order:{type:orderSchema},


amount:{
    type:Number
}



})
module.exports=mongoose.model('payment',paymentschema)