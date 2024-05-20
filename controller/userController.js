const userCollection = require("../models/userModel.js");
const otpCollection = require("../models/otpModel.js");
const productCollection = require("../models/productModel.js");
const categoryCollection = require("../models/categoryModel.js");

const bcrypt = require("bcrypt");
const sendOtp = require("../services/sentOtp.js");
const { render } = require("ejs");
const { use } = require("../routes/userRouter.js");
const { addAbortListener } = require("nodemailer/lib/xoauth2/index.js");
const orderCollection = require("../models/orderModel.js");
const cartCollection = require("../models/cartModel.js");

const landingPage = async (req, res) => {
  try {
    let userLogged = req.session?.user;

    if (userLogged) {
      res.render("userPage/landingPage", { userLogged: userLogged });
    } else {
      res.render("userPage/landingPage", { userLogged: false });
    }
  } catch (error) {
    console.log(error);
  }
};

const loginSignupPage = async (req, res) => {
  try {
    res.render("userPage/signupLogin");
  } catch (error) {
    console.log(error);
  }
};

const userSave = async (req, res) => {
  try {
    let bcryptPassword = bcrypt.hashSync(req.body.password, 10);

    const newUser = new userCollection({
      name: req.body.name,
      email: req.body.email,
      password: bcryptPassword,
      phone: req.body.phone,
    });

    const generateOtp = Math.floor(100000 + Math.random() * 900000);

    console.log(generateOtp);

    const otpUser = new otpCollection({
      email: req.body.email,
      otp: generateOtp,
    });

    const userExist = await userCollection.findOne({ email: req.body.email });

    console.log(userExist);

    if (userExist) {
      res.redirect("/loginpage");

    } else {
      await otpUser.save();
      await sendOtp(req.body.email, generateOtp);
      

      await newUser.save();


      req.session.user = newUser;



      res.redirect("/otp");

    }
  } catch (error) {
    console.log(error);
  }
};

const login = async (req, res) => {
  const userExist = await userCollection.findOne({ email: req.body.email });

  const userblock = await userCollection.findOne({ block: false });

  req.session?.user;

  if (userExist) {
    let passwordMatch = bcrypt.compareSync(
      req.body.password,
      userExist.password
    );

    if (userblock) {
      if (passwordMatch) {
        req.session.user = userExist;
        res.render("userPage/landingPage", { userLogged: req.session.user });
      } else {
        res.redirect("/loginpage");
      }
    } else {
      res.redirect("/loginpage");
    }
  } else {
    res.redirect("/loginpage");
  }
};

const otpPage = async (req, res) => {
  res.render("userPage/otp");

  console.log("get this page");
};

const veryFyingotp = async (req, res) => {
  try {
    console.log(req.body.otp);
    console.log("1");
    const otp = await otpCollection.findOne({ otp: req.body?.otp });

    console.log(`Datebase ${otp}`);

    if (otp) {
      res.send({ otpVerified: true });
    } else {
      res.send({ otpInvalid: true });
    }
  } catch (error) {
    console.log(error);
  }
};

const resendotp = async (req, res) => {
  try {
    const generateOtp = Math.floor(100000 + Math.random() * 900000);

    await sendOtp(req.body.email, generateOtp);

    res.send({ otpsend: true });
  } catch (error) {
    console.log(error.message);
  }
};

////product page front

const productPage = async (req, res) => {
  try {
    const categoryData = await categoryCollection.find();

    let page = Number(req.query.page) || 1;
    let limit = 8;
    let skip = (page - 1) * limit;
    let sortField = req.query.sortValue || 'default';
    let categoryName = req.query.categoryName || null

    let sortCriteria = {};
    if (sortField === 'priceAscending') {
      sortCriteria = { productPrice: 1 };
    } else if (sortField === 'priceDescending') {
      sortCriteria = { productPrice: -1 };
    }else if(sortField === 'alphbetSortingAZ'){
          sortCriteria = {productName:1}
    }else if(sortField === 'alphbetSortingZA'){
        
      sortCriteria = {productName:-1}
    }

      let query = {isListed:true};

      if(categoryName){
          query.parentCategory = categoryName
      }

    let productData = await productCollection.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    let count = await productCollection.countDocuments(query);

    if (req.session.user) {
      res.render("userPage/productList", { categoryData, productData, page, limit, count, sortField,categoryName });
      console.log("entering product page");
    } else {
      res.redirect("/loginpage");
    }
  } catch (error) {
    console.log(error.message);
  }
};


const productDetail = async (req, res) => {
  try {
    const singleData = await productCollection.findOne({ _id: req.params.id });

    const prodcutQuantity = await cartCollection.findOne({
      productQuantity: req.session.product,
    });

    if (prodcutQuantity) console.log("productt quantiy entering");

    res.render("userPage/productDetails", { singleData });
  } catch (error) {
    console.log(error.message);
  }
};

const logOutting = async (req, res) => {
  try {
    req.session.user = false;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const sortingProduct = async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = 8;
    let skip = (page - 1) * limit;
    let sortField = req.query.sortValue || 'default';

    let sortCriteria = {};
    if (sortField === 'priceAscending') {
      sortCriteria = { productPrice: 1 };
    } else if (sortField === 'priceDescending') {
      sortCriteria = { productPrice: -1 };
    }else if(sortField === 'AlphbetSortingAZ'){
         
       sortCriteria = {productName:1};
    }else if(sortField==='alphbetSortingZA'){
         
      sortCriteria = {productName:-1}
    }

    let productData = await productCollection.find({ isListed: true })
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    req.session.productData = productData;

    res.send({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};


const forgotPasswordGetPage = async(req,res)=>{
    
    try {

       res.render('userPage/forgotPassword')
      
    } catch (error) {
        console.log(error.message);
    }
}



const  forgotOtpGrtPage = async(req,res)=>{
    
   try {

    res.render('userPage/fogotPasswordOtp')
    
   } catch (error) {
      console.log(error.message);
   }
}

const updatingForgotPassword = async(req,res)=>{
     
  try {

    req.session.forgotEmail = req.body.forgetEmail

   const emailVerification = await userCollection.findOne({email:req.body.forgetEmail})

   if(emailVerification){

    const generateOtp = Math.floor(100000 + Math.random() * 900000);

    console.log(generateOtp);

    const otpUser = new otpCollection({
      email: req.body.forgetEmail,
      otp: generateOtp,
    });

    await otpUser.save();
      await sendOtp(req.body.forgetEmail, generateOtp);
      


       
      res.send({success:true})
   }else{

      res.send({wrong:true})
   }
    
  } catch (error) {
    console.log(error.message);
  }
}

const forgotPasswordVerifyOtp = async(req,res)=>{
     
  try {

    console.log(req.body.otp);
    console.log("1");
    const otp = await otpCollection.findOne({ otp: req.body?.otp });

    console.log(`Datebase ${otp}`);

    if (otp) {
      res.send({ otpVerified: true });
    } else {
      res.send({ otpInvalid: true });
    }


    
    
  } catch (error) {
     console.log(error.message);
  }
}


const forgotResendOtp = async(req,res)=>{
    
  try {

    const generateOtp = Math.floor(100000 + Math.random() * 900000);
    console.log(generateOtp);
    await sendOtp(req.body.forgetEmail, generateOtp);

    res.send({ otpsend: true });
    
  } catch (error) {
    console.log(error.message);
  }
}


const forgotPassworChangingGetPAge = async(req,res)=>{
     
      try {

        res.render('userPage/UpdatingForgotChangePassword')
        
      } catch (error) {
          console.log(error.message);
      }
}


const forgotPasswordUpdating = async(req,res)=>{
     
   try {

    console.log("Entering");
     
   const updatingPassword = bcrypt.hashSync( req.body.forgotConfirmPassword,10)
    console.log(updatingPassword);

    

    await userCollection.updateOne({email:req.session.forgotEmail},{$set:{password:updatingPassword}})

    res.send({success:true})
      


     



    
   } catch (error) {
      console.log(error.message);
   }
}
module.exports = {
  landingPage,
  loginSignupPage,
  userSave,
  otpPage,
  veryFyingotp,
  resendotp,
  login,
  productPage,
  productDetail,
  logOutting,
  sortingProduct,
  forgotPasswordGetPage,
  updatingForgotPassword,
  forgotOtpGrtPage,
  forgotPasswordVerifyOtp,
  forgotResendOtp,
  forgotPassworChangingGetPAge,
  forgotPasswordUpdating
  
  

}
