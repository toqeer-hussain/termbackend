var mongoose=require("mongoose")
mongoose.connect(`mongodb+srv://toqeer_12:toqeerali12@cluster0.h1s3r.mongodb.net/Main?retryWrites=true&w=majority`, {useNewUrlParser: true,useUnifiedTopology: true});
let UserSchema= new mongoose.Schema({
    UserName:String,
    Email:String,
    Password:String,
    Role:{
        type:String,
        default:"customer"
    },
    forgettoken:{
        type:String,
        required:false,
        default:""
    }

},{timestamps:true})

let User=mongoose.model("User",UserSchema)
module.exports={User,UserSchema}
// let newuser=new userdetail({
//     UserName:"toqeer_12",
//     Email:"toqeerhussain1224@gamil.com",
//     Password:"toqeerali12",
    
// })
// newuser.save().then(d=>console.log(d)).catch(e=>console.log(e))