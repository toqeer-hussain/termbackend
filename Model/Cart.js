
var mongoose=require("mongoose")

var {ProductSchema}=require('./Product')
const { UserSchema } = require("./User")
let Cartitem=new mongoose.Schema({
    
    product: { 
     productId:String,
        ProductName:String,
        Image:String,
        Rating:Number,
    
         
    },
    quantity:{
        type:Number,
    default:0},
    price:{
        type:Number,
    default:0,},
    
       
       

})
let CartSchema= new mongoose.Schema({
    helpid:{type:String,default:""},
    UserId:UserSchema,
    total:{
    type:Number,
default:0},
    product:[{type:Cartitem}],

    
    

},{timestamps:true})

Cartitem=mongoose.model("Cartitem",Cartitem)
Cart=mongoose.model("Cart",CartSchema)
module.exports={Cart,Cartitem,CartSchema}