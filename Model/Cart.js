
var mongoose=require("mongoose")

var {ProductSchema}=require('./Product')
let Cartitem=new mongoose.Schema({
    
    product: {
        type:ProductSchema
    },
    quantity:{
        type:Number,
    default:0},
    price:{
        type:Number,
    default:0,},
    
       
       

})
let Cart= new mongoose.Schema({
    UserId:String,
    total:{
    type:Number,
default:0},
    product:[Cartitem],

    
    

},{timestamps:true})

Cartitem=mongoose.model("Cartitem",Cartitem)
Cart=mongoose.model("Cart",Cart)
module.exports={Cart,Cartitem}