const userCollection = require("../models/userModel.js");

let adminMail = "admin12@gmail.com";
let adminPass = "123123";

const adminLoginPage = async (req, res) => {
  try {
    res.render("adminPage/adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};

const admincheck = async (req, res) => {
  try {
    console.log(adminMail);
    console.log(adminPass);

    if (adminMail === req.body.email && adminPass === req.body.password) {
      res.render("adminPage/adminDashboard");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const userdetails = async (req, res) => {
  try {
    const userData = await userCollection.find();

    console.log(userData);
    res.render("adminPage/userDetails", { userData });
  } catch (error) {
    console.log(error.message);
  }
};

const blockUser = async (req, res) => {
  try {
    await userCollection.updateOne(
      { _id: req.query.id },

      { $set: { block: false } }
    );
    res.send({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

const unBlockUser = async (req, res) => {
  try {
    await userCollection.updateOne(
      { _id: req.query.id },

      { $set: { block: true } }
    );
    res.send({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

const logoutPage = async(req,res)=>{
     try {

       res.redirect('/admin')
      
     } catch (error) {
        console.log(error.message);
     }
}

module.exports = {
  adminLoginPage,
  admincheck,
  userdetails,
  blockUser,
  unBlockUser,
  logoutPage
};
