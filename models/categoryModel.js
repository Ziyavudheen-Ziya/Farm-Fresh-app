const { name } = require('ejs')
const mongoose = require('mongoose')
const { category } = require('../controller/adminController')


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
       }

})

module.exports = mongoose.model('category',categorySchema)