
var mongoose=require("mongoose")
var {UserSchema}=require('./User')
let Commit= new mongoose.Schema({
    Commit:[
       { User:{UserSchema},Message:{type: String}}
    ],
    
},{timestamps:true})

module.exports=mongoose.model("Commit",Commit)