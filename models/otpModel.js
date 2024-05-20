const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({

    email:{
          
      required:true,
      type:String
         
    },
     otp:{

        required:true,
        type:String
     }


})


module.exports = mongoose.model('otp',otpSchema)