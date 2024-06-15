const mongoose = require('mongoose')


const coupanSchema = new mongoose.Schema({

     coupanCode :{type:String,required:true},

     isListed:{default:true,required:true,type:Boolean},

     coupanAmount:{
         type:Number,
         required:true
     },
     startDate:{type:Date,required:true,default:new Date().toLocaleString()},
     expiryDate:{type:Date,required:true},
     minimumPurchase:{type:Number,required:true},
     status:{
        type:String,
        default:'avilable'
     }, usedUsers:[
          {
             type:mongoose.Schema.Types.ObjectId,
             default:null,
             ref:"users",
          }
     ]
})

const coupanCollection = mongoose.model('coupan',coupanSchema)

module.exports= coupanCollection