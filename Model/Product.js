var mongoose=require("mongoose")



let ProductSchema= new mongoose.Schema({
    ProductName:String,
    Description:String,
    Quantity:Number,
    Price:Number,
    Rating:Number,
    Image:[{imgkey:String,}]

},{timestamps:true})

let Product=mongoose.model("Product",ProductSchema)
module.exports={ProductSchema,Product}