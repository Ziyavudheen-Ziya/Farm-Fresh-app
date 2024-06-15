const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
     
    userId:{type:mongoose.Types.ObjectId,
        required:true,
        ref:"users"
    },
    walletBalance:{type:Number,default:0},
    walletTransaction:[
        {
             paymentType:{type:String},
            transactionDate:{type:Date,default:new Date()},
            transactionAmount:{type:Number},
            transactionType:{type:String,enum:['credit on cancel']}
        }
    ]
})


module.exports=mongoose.model('wallet',walletSchema)
