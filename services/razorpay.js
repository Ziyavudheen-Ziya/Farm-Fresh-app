const Razorpay = require('razorpay')


var instance = new Razorpay({ key_id: process.env.Razorpay_key_id	, key_secret: process.env.Razorpay_key_secret  })


module.exports = {instance}