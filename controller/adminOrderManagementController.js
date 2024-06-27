const orderCollection = require("../models/orderModel.js");
const { any } = require("../services/multer.js");
const userCollection = require("../models/userModel.js");
const cartCollection = require("../models/cartModel.js");
const AppError = require("../middleware/errorHandling.js");
const productCollection = require("../models/productModel.js");
const categoryCollection = require("../models/categoryModel.js");

const orderManagmentPage = async (req, res, next) => {
  try {
    const orderData = await orderCollection.find().populate("userId");

    orderData.reverse();

    res.render("adminPage/orderedList", { orderData });
  } catch (error) {
    console.log(error.message);
    next(new AppError("Something went wrong adminOrderPage", 500));
  }
};

const pending = async (req, res, next) => {
  try {
    let orderId = req.query.id;

    const pendingFind = await orderCollection.findOne({ _id: orderId });

    if (pendingFind.orderStatus == "pending") {
      res.send({ alreadyPending: true });
    } else {
      await orderCollection.updateOne(
        { _id: req.query.id },
        {
          $set: {
            orderStatus: "pending",
          },
        }
      );

      res.send({ pending: true });
    }
  } catch (error) {
    next(new AppError("Something went wrong adminOrderPage", 500));
  }
};

const shipped = async (req, res, next) => {
  try {
    let orderId = req.query.id;

    const shippedFind = await orderCollection.findOne({ _id: orderId });

    if (shippedFind.orderStatus == "shipped") {
      res.send({ alreadyShipped: true });
    } else {
      await orderCollection.updateOne(
        { _id: req.query.id },
        {
          $set: {
            orderStatus: "shipped",
          },
        }
      );

      res.send({ shipped: true });
    }
  } catch (error) {
    next(new AppError("Something went wrong adminOrderPage", 500));
  }
};

const delivered = async (req, res, next) => {
  try {
    let orderId = req.query.id;
    let orderData = await orderCollection.findById(orderId);

    let deliverdFind = await orderCollection.findOne({ _id: orderId });

    let productData = await productCollection.find();

    if (deliverdFind.orderStatus == "deliverd") {
      res.send({ alreadyDelivered: true });
    } else {
      await orderCollection.updateOne(
        { _id: req.query.id },
        {
          $set: {
            orderStatus: "deliverd",
          },
        }
      );

      const updatePromise = orderData.cartData.map(async (item) => {
        return productCollection.updateOne(
          { _id: item.productId },
          { $inc: { productStockSold: item.productQuantity } }
        );
      });

      await Promise.all(updatePromise);

      const productData = await productCollection.find({
        _id: { $in: orderData.cartData.map((item) => item.productId) },
      });

      const updateCategoryPromises = productData.map(async (data) => {
        return categoryCollection.updateOne(
          { _id: data.categoryId },
          { $inc: { categoryStockSold: data.productStockSold } }
        );
      });

      await Promise.all(updateCategoryPromises);

      res.send({ delivered: true });
    }
  } catch (error) {
    console.log(error.message);
    next(new AppError("Something went wrong adminOrderPage", 500));
  }
};

const returnDeliver = async (req, res, next) => {
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

const cancelled = async (req, res, next) => {
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

const viewDetails = async (req, res, next) => {
  try {
    let orderNumber = req.session.orderNUmber;

    const orderData = await orderCollection
      .findOne({ orderNumber: req.params.id })
      .populate("addressChosen");

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
