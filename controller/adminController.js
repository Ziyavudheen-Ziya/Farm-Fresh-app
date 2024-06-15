const userCollection = require("../models/userModel.js");
const cartCollecction = require("../models/cartModel.js");
const AppError = require('../middleware/errorHandling.js')

let adminMail = "admin12@gmail.com";
let adminPass = "123123";

const adminLoginPage = async (req, res,next) => {
  try {

    if(req.session.admin){

      res.render("adminPage/adminLogin");



    }else{

      res.render('adminPage/adminLogin')
    }
      

  } catch (error) {
    next(new AppError("Something went wrong adminPage", 500));
  }
};

const dashboardGetPage = async (req, res,next) => {
  try {
    res.render("adminPage/adminDashboard");
  } catch (error) {
    next(new AppError("Something went wrong adminPage", 500));
  }
};

const admincheck = async (req, res,next) => {
  try {
    console.log(adminMail);
    console.log(adminPass);

    if (adminMail === req.body.email && adminPass === req.body.password) {
        req.session.admin=true
      res.render("adminPage/adminDashboard");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    next(new AppError("Something went wrong adminPage", 500));
  }
};

const userdetails = async (req, res,next) => {
  try {
    let userData = await userCollection.find();

    const userPerPage = 8;
    const totalPages = userData.length / userPerPage;
    const pageNo = req.query.pageNo || 1;
    const start = (pageNo - 1) * userPerPage;
    const end = start + userPerPage;
    userData = userData.slice(start, end);

    res.render("adminPage/userDetails", { userData, totalPages });
  } catch (error) {
    next(new AppError("Something went wrong adminPage", 500));
  }
};

const blockUser = async (req, res,next) => {
  try {
    await userCollection.updateOne(
      { _id: req.query.id },

      { $set: { block: false } }
    );
    res.send({ success: true });
  } catch (error) {
    next(new AppError("Something went wrong adminPage", 500));
  }
};

const unBlockUser = async (req, res,next) => {
  try {
    await userCollection.updateOne(
      { _id: req.query.id },

      { $set: { block: true } }
    );
    res.send({ success: true });
  } catch (error) {
    next(new AppError("Something went wrong adminPage", 500));
  }
};

const logoutPage = async (req, res,next) => {
  try {
    req.session.admin=false
    res.redirect("/admin");
  } catch (error) {
    next(new AppError("Something went wrong adminPage", 500));
  }
};

module.exports = {
  adminLoginPage,
  admincheck,
  userdetails,
  blockUser,
  unBlockUser,
  logoutPage,
  dashboardGetPage,
};
