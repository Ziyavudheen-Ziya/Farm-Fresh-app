const mongoose = require('mongoose')
module.exports=mongoose.connect(process.env.Mongo_URL)
.then(()=>{

    console.log("Database connected");
})
.catch(()=>{

    console.log("Not connected DB");
})