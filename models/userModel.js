const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
     
         name:{

             required:true,
             type:String
         },
         email:{
            required:true,
            type:String
         },
         phone:{
             
            required:true,
            type:Number

         },
         password:{
            required:true,
            type:String
         
        },
        admin:{
         
            type:Number,
            default:0

        },
        block:{
             
            type:Boolean,
            default:false
        }
        

    }
)


module.exports= mongoose.model('users',userSchema)