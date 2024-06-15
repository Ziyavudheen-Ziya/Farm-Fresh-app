const mongoose = require('mongoose')

const categoryOfferSchema = new mongoose.Schema({

      categoryId:{
          type:mongoose.Types.ObjectId,
          required:true,
          ref:'category'
      },
      categoryName:{
         
        type:String,
        required:true
      },
      productOfferAmount:{
        type:Number,
        required:true
      },
      startDate:{
         type:Date,
         required:true
      },
      endDate:{
          type:Date,
          required:true
      },
      currentStatus:{
         type:Boolean,
         required:true,
         default:true
      }
      
},{timestamps:true})

module.exports=mongoose.model('categoryOffer',categoryOfferSchema)