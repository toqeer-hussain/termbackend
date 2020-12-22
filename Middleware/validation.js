const Joi = require('joi');


const UserValidation=(req,res,next)=>{

 let {error}=ValidateUserByJoi(req.body)
 console.log(error.details)
if(!error){
    next()
}
else{
    res.send("")
}
}

const ValidateUserByJoi=(data)=>{
  let Schema=Joi.object({
    UserName:Joi.string().min(6).alphanum().required(),
    Password:Joi.string().min(8).alphanum(),
    Email:Joi.string().email(),


})
return Schema.validate(data);  
}


module.exports.UserValidation=UserValidation