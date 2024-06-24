const mongoose = require('mongoose')


const categorySchema = new mongoose.Schema({

       categoryname:{
        
        type:String,
        required:true

       },
       categoryDescription:{
         
           type:String,
           required:true
       },

       isListed:{

           type:Boolean,
           default:true
       },

       categoryOfferId:{

        type:mongoose.Types.ObjectId,
        ref:'categoryOffer'
          
       },
       categoryOfferAmount:{
         
           type:Number,
           default:0
       },
       categoryStockSold:{type:Number,default:0}

})

module.exports = mongoose.model('category',categorySchema)