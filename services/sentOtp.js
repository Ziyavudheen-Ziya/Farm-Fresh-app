const nodemailer = require('nodemailer')


const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.USER_MAIL ,
        pass:process.env.USER_PSS, 
        authMethod: 'PLAIN' 
    },
});


     

let sendOtp = async(mail,otp)=>{

     try {

        await transporter.sendMail({
            
            from:process.env.USER_MAIL,
            to:mail,
            subject:'Registration OTP for Farm Fresh',
            text:`Here is your One Time Password for registration:${otp} `
            
        })
     

        
        console.log(`otp : ${otp}`)
     } catch (error) {
        
     }
}



module.exports=sendOtp
