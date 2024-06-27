const userCollection = require("../models/userModel.js");
const cartCollecction = require("../models/cartModel.js");
const AppError = require("../middleware/errorHandling.js");
const orderCollection = require("../models/orderModel.js");
const productCollection = require("../models/productModel.js");
const categoryCollection = require("../models/categoryModel.js");
const dashboard = require("../services/dashboardChart.js");
let adminMail = process.env.Admin_Mail;
let adminPass = process.env.Admin_Pass;

const adminLoginPage = async (req, res, next) => {
  try {
    if (req.session.admin) {
      res.render("adminPage/adminLogin");
    } else {
      res.render("adminPage/adminLogin");
    }
  } catch (error) {
    console.log(error.message);

    next(new AppError("Something went wrong adminPage", 500));
  }
};

const dashboardGetPage = async (req, res, next) => {
  try {
    res.render("adminPage/adminDashboard");
  } catch (error) {
    console.log(error.message);
    next(new AppError("Something went wrong adminPage", 500));
  }
};

const admincheck = async (req, res, next) => {
  try {
    console.log(adminMail);
    console.log(adminPass);

    if (adminMail === req.body.email && adminPass === req.body.password) {
      req.session.admin = true;
      res.render("adminPage/adminDashboard");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);

    next(new AppError("Something went wrong adminPage", 500));
  }
};

const userdetails = async (req, res, next) => {
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
    console.log(error.message);

    next(new AppError("Something went wrong adminPage", 500));
  }
};

const blockUser = async (req, res, next) => {
  try {
    await userCollection.updateOne(
      { _id: req.query.id },

      { $set: { block: false } }
    );
    res.send({ success: true });
  } catch (error) {
    console.log(error.message);

    next(new AppError("Something went wrong adminPage", 500));
  }
};

const unBlockUser = async (req, res, next) => {
  try {
    await userCollection.updateOne(
      { _id: req.query.id },

      { $set: { block: true } }
    );
    res.send({ success: true });
  } catch (error) {
    console.log(error.message);

    next(new AppError("Something went wrong adminPage", 500));
  }
};

const logoutPage = async (req, res, next) => {
  try {
    req.session.admin = false;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);

    next(new AppError("Something went wrong adminPage", 500));
  }
};

const topSellingProducts = async (req, res, next) => {
  try {
    const topProducts = await productCollection
      .find(
        {},
        {
          productName: 1,
          productStockSold: 1,
          parentCategory: 1,
          productPrice: 1,
          productImage: 1,
        }
      )
      .sort({ productStockSold: -1 })
      .limit(10);

    res.render("adminPage/topProducts", { topProducts });
  } catch (error) {
    console.log(error.message);
    next(new AppError("Something went wrong adminPage", 500));
  }
};

const topSellingCategory = async (req, res, next) => {
  try {
    const topCategory = await categoryCollection
      .find({}, { categoryname: 1, categoryStockSold: 1 })
      .sort({ categoryStockSold: -1 })
      .limit(10);

    res.render("adminPage/topCategory", { topCategory });
  } catch (error) {
    console.log(error.message);
    next(new AppError("Something went wrong on adminPage", 500));
  }
};

const dashboardData = async (req, res, next) => {
  try {
    const [
      productsCount,
      categoryCount,
      pendingOrdersCount,
      completedOrdersCount,
      currentDayRevenue,
      MonthlyRevenue,
      categoryWiseRevenue,
      shipping,
    ] = await Promise.all([
      dashboard.productsCount(),
      dashboard.categoryCount(),
      dashboard.pendingOrdersCount(),
      dashboard.completedOrdersCount(),
      dashboard.currentDayRevenue(),
      dashboard.MonthlyRevenue(),
      dashboard.categoryWiseRevenue(),
      dashboard.shipping(),
    ]);

    const data = {
      productsCount,
      categoryCount,
      pendingOrdersCount,
      completedOrdersCount,
      currentDayRevenue,
      MonthlyRevenue,
      categoryWiseRevenue,
      shipping,
    };
    res.json(data);
  } catch (error) {
    console.log(error.message);
    next(new AppError("Something went wrong on adminPage", 500));
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
  topSellingProducts,
  topSellingCategory,
  dashboardData,
};
