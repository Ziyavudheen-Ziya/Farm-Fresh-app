const orderCollection = require("../models/orderModel");
const cartCollecction = require("../models/cartModel");
const { login } = require("./userController");
const walletColletion = require("../models/walletModel");
const userCollecction = require("../models/userModel");
const productCollection = require("../models/productModel");
const mongoose = require("mongoose");
const AppError = require("../middleware/errorHandling");
const { generateVoice } = require("../services/generatePdf");

const myOrdersPage = async (req, res, next) => {
  try {
    let orderData = await orderCollection.find({ userId: req.session.user }).sort({_id:-1
      
    })

    const orderPerPage = 8;
    const totalPages = Math.ceil(orderData.length / orderPerPage);
    const pageNo = parseInt(req.query.pageNo) || 1;
    const start = (pageNo - 1) * orderPerPage;
    const end = start + orderPerPage;

    const paginatedOrders = orderData.slice(start, end);
    // paginatedOrders.reverse();
    res.render("userPage/myOrders", {
      orderData: paginatedOrders,
      totalPages,
      currentPage: pageNo,
    });
  } catch (error) {
    console.log(error.mesaage);
    next(new AppError("Something went wrong OrderManagmentPage", 500));
  }
};

const userOrderCancelled = async (req, res, next) => {
  try {
    let paymentTypeCheck = await orderCollection.findOne({ _id: req.query.id });

    let payment = await orderCollection.find({ _id: req.query.id });

    let orderData = await orderCollection.findById({ _id: req.query.id });

    req.session.statusCancel = req.query.id;

    await orderCollection.updateOne(
      { _id: req.query.id },
      {
        $set: {
          orderStatus: "cancelled",
        },
      }
    );

    orderData.cartData.forEach(async (data) => {
      let product = await productCollection.findById(data.productId._id);

      if (product.productOfferAmount) {
        await productCollection.findByIdAndUpdate(
          { _id: data.productId._id },
          { $inc: { productStock: data.productQuantity } }
        );
      } else {
        await productCollection.findByIdAndUpdate(
          { _id: data.productId._id },
          { $inc: { productStock: data.productQuantity } }
        );
      }
    });

    let sum = 0;

    payment.forEach((value) => {
      sum += value.grandTotalCost;
    });
    console.log(`sum varunde ${sum}`);
    if (paymentTypeCheck.paymentType === "razorPay") {
      await walletColletion.updateOne(
        { userId: req.session.user._id },
        {
          $inc: { walletBalance: sum },
          $push: {
            walletTransaction: {
              paymentType: paymentTypeCheck.paymentType,

              transactionDate: Date.now(),
              transactionAmount: sum,
              transactionType: "Credit on Cancel order",
            },
          },
        }
      );
    }

    res.send({ cancelled: true });
  } catch (error) {
    next(new AppError("Something went wrong", 500));
  }
};

const returnUser = async (req, res, next) => {
  try {
    let paymentTypeCheck = await orderCollection.findOne({ _id: req.query.id });

    let payment = await orderCollection.find({ _id: req.query.id });

    await orderCollection.updateOne(
      { _id: req.query.id },
      {
        $set: {
          orderStatus: "return",
        },
      }
    );

    let sum = 0;

    payment.forEach((value) => {
      sum += value.grandTotalCost;
    });

    if (paymentTypeCheck.paymentType === "razorPay") {
      await walletColletion.updateOne(
        { userId: req.session.user._id },

        {
          $inc: { walletBalance: sum },
          $push: {
            walletTransaction: {
              paymentType: paymentTypeCheck.paymentType,
              transactionDate: Date.now(),
              transactionAmount: sum,
              transactionType: "Credit on return order",
            },
          },
        }
      );
    } else if (paymentTypeCheck.paymentType === "Cash on delivery") {
      await walletColletion.updateOne(
        { userId: req.session.user._id },

        {
          $inc: { walletBalance: sum },
          $push: {
            walletTransaction: {
              paymentType: paymentTypeCheck.paymentType,
              transactionDate: Date.now(),
              transactionAmount: sum,
              transactionType: "Credit on return order",
            },
          },
        }
      );
    }

    res.send({ return: true });
  } catch (error) {
    next(new AppError("Something went wrong OrderManagmentPage", 500));
  }
};

const orderDetailsSingleUser = async (req, res, next) => {
  try {
    let orderId = req.query.id;

    const orderData = await orderCollection
      .findOne({ _id: orderId })
      .populate("addressChosen");

    res.render("userPage/myOrderSingleOrder", { orderData });
  } catch (error) {
    next(new AppError("Something went wrong OrderManagmentPage", 500));
  }
};

const singleProductCancel = async (req, res, next) => {
  try {
    const orderNumber = parseInt(req.query.orderNumber);
    const productId = req.query.productId;
    const productQuantity = req.body.productQuantity;
    const orderId = req.query.orderId;
    const indexId = parseInt(req.query.indexId);
    const productPrice = req.body.productPrice;

    let sum = 0;

    let orderData = await orderCollection.findOne({ _id: orderId });

    // let payment = await orderCollection.find({_id: orderId})

    //   sum += payment.grandTotalCost + productPrice

    if (indexId >= 0 && indexId < orderData.cartData.length) {
      const itemToUpdate = orderData.cartData[indexId];

      await orderCollection.updateOne(
        { _id: orderId, "cartData._id": itemToUpdate._id },
        { $set: { "cartData.$.singleOrderstatus": "cancelled" } }
      );
    }
    await productCollection.updateOne(
      { _id: productId },
      { $inc: { productStock: productQuantity } }
    );

    await walletColletion.updateOne(
      { userId: req.session.user._id },
      {
        $inc: { walletBalance: productPrice },

        $push: {
          walletTransaction: {
            transactionDate: Date.now(),
            transactionAmount: productPrice,
            transactionType: "Credit on Cancel order",
          },
        },
      }
    );

    const updatedOrderData = await orderCollection.findOne({ _id: orderId });

    const allItemsCancelled = updatedOrderData.cartData.every(
      (item) => item.singleOrderstatus === "cancelled"
    );

    console.log("allItemCancelled", allItemsCancelled);

    if (allItemsCancelled) {
      await orderCollection.updateOne(
        { _id: orderId },
        { $set: { orderStatus: "cancelled" } }
      );
    }

    res.send({ success: true });
  } catch (error) {
    next(new AppError("Something went wrong OrderManagmentPage", 500));
  }
};

const downloadInvoice = async (req, res, next) => {
  try {
    console.log("Entering the download invoice page");
    let orderDetails = await orderCollection
      .findOne({ _id: req.params.id })
      .populate("addressChosen");

    console.log("Order details:", orderDetails);

    const stream = res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment;filename=invoice.pdf",
    });

    generateVoice(
      (chunk) => stream.write(chunk),
      () => stream.end(),
      orderDetails
    );

    console.log("Generated invoice");
  } catch (error) {
    console.log(error.message);
    next(new AppError("Something went wrong OrderManagmentPage", 500));
  }
};

module.exports = {
  myOrdersPage,
  userOrderCancelled,
  returnUser,
  orderDetailsSingleUser,
  singleProductCancel,
  downloadInvoice,
};
