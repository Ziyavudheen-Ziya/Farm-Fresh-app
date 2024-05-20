const express = require('express')
const app = express()
const path = require('path')
const session = require('express-session')
require('dotenv').config()
require('./config/dbconnect.js')
const nocache = require('nocache')


app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
     next();
});

app.use(
    session({
        resave:true,
        saveUninitialized:true,
        secret:"my secret"
    })
)


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





app.listen(3000, () => {

    console.log("The server start");
})
