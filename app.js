const express = require('express')
const app = express()
const path = require('path')
const session = require('express-session')
require('dotenv').config()
require('./config/dbconnect.js')
require('./middleware/goggleAuth.js')
const nocache = require('nocache')
const passport = require('passport')


app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
     next();
});

app.use(
    session({
         secret:"my secret",
        resave:true,
        saveUninitialized:true,
       
    })
)
app.use(passport.initialize())
app.use(passport.session())


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))


app.set('view engine', 'ejs')

//User Router 
const router = require('./routes/userRouter.js')
app.use(router)

//Admin Router
const adminRouter = require('./routes/adminRouter.js')
app.use(adminRouter)


app.use((err,req,res,next)=>{
      const statusCode = err.satusCode || 500
      const status = err.status || 'error';
      res.status(statusCode).render('userPage/error',{statusCode:status,message:err.message})
})

app.get('*',function(req,res){

      res.status(404).render('userPage/404')
})



app.listen(3000, () => {

    console.log("The server start");
})


/**
 * 
 * git add .
 * git commit -m "<commit message here>"
 * git push -u origin main
 */