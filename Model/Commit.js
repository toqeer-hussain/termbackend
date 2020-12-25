
var mongoose=require("mongoose")
var {UserSchema}=require('./User')
let Commit= new mongoose.Schema({
   
        User:{type:String,default:"Anonymous"}
       ,Message:{type: String},
    Date:Date
    
},{timestamps:true})

module.exports=mongoose.model("Commit",Commit)