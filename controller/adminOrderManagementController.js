const orderCollection = require("../models/orderModel.js");
const { any } = require("../services/multer.js");
const userCollection = require("../models/userModel.js");
const cartCollection = require("../models/cartModel.js");
const AppError = require('../middleware/errorHandling.js')
const orderManagmentPage = async (req, res,next) => {
  try {
    console.log("hai");
    const orderData = await orderCollection.find().populate("userId");

    console.log(orderData);
    orderData.reverse();

    res.render("adminPage/orderedList", { orderData });
  } catch (error) {
    next(new AppError("Something went wrong adminOrderPage", 500));
  }
};

const pending = async (req, res,next) => {
  try {
    await orderCollection.updateOne(
      { _id: req.query.id },
      {
        $set: {
          orderStatus: "pending",
        },
      }
    );

    res.send({ pending: true });
  } catch (error) {
    next(new AppError("Something went wrong adminOrderPage", 500));
  }
};

const shipped = async (req, res,next) => {
  try {
    await orderCollection.updateOne(
      { _id: req.query.id },
      {
        $set: {
          orderStatus: "shipped",
        },
      }
    );

    res.send({ shipped: true });
  } catch (error) {
    next(new AppError("Something went wrong adminOrderPage", 500));
  }
};

const delivered = async (req, res,next) => {
  try {
    await orderCollection.updateOne(
      { _id: req.query.id },
      {
        $set: {
          orderStatus: "deliverd",
        },
      }
    );

    res.send({ delivered: true });
  } catch (error) {
    next(new AppError("Something went wrong adminOrderPage", 500));
  }
};

const returnDeliver = async (req, res,next) => {
  try {
    await orderCollection.updateOne(
      { _id: req.query.id },
      {
        $set: {
          orderStatus: "return",
        },
      }
    );

    res.send({ returnDeliver: true });
  } catch (error) {
    next(new AppError("Something went wrong adminOrderPage", 500));
  }
};

const cancelled = async (req, res,next) => {
  try {
    await orderCollection.updateOne(
      { _id: req.query.id },
      {
        $set: {
          orderStatus: "cancelled",
        },
      }
    );

    res.send({ cancelled: true });
  } catch (error) {
    next(new AppError("Something went wrong adminOrderPage", 500));
  }
};

const viewDetails = async (req, res,next) => {
  try {
    let orderNumber = req.session.orderNUmber;

    const orderData = await orderCollection
      .findOne({ orderNumber: req.params.id })
      .populate("addressChosen");

    console.log("order data varunde", orderData);

    res.render("adminPage/viewDetails", { orderData });
  } catch (error) {
    next(new AppError("Something went wrong adminOrderPage", 500));
  }
};

module.exports = {
  orderManagmentPage,
  pending,
  shipped,
  delivered,
  returnDeliver,
  cancelled,
  viewDetails,
};
