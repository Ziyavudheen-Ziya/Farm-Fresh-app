const mongoose = require('mongoose')
module.exports=mongoose.connect('mongodb+srv://ziyavudheen:ziyavudheen@cluster0.zkekwwj.mongodb.net/FarmFresh')
.then(()=>{

    console.log("Database connected");
})
.catch(()=>{

    console.log("Not connected DB");
})