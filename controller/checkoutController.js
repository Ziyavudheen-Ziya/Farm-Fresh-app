const cartCollection = require("../models/cartModel.js");
const profileCollectionn = require("../models/addressModel.js");
const orderCollection = require("../models/orderModel.js");
const productCollection = require("../models/productModel.js");
const { json } = require("express");
const { productDetail } = require("./userController.js");
const razorpay = require("../services/razorpay.js");
const walletCollection = require("../models/walletModel.js");
const coupanCollection = require("../models/coupanModel.js");
const { _makeLong } = require("path");
const offerProductCollection = require("../models/productOfferModel.js");
// const AppError = require("../middleware/errorHandling.js");
const Razorpay = require("razorpay");
const checkOutPage = async (req, res) => {
  try {
    let grandTotal = 0;
     req.session.grandTotal = grandTotal
    const adrressData = await profileCollectionn.find({
      user_id: req.session?.user,
    });
    
    const cartData = await cartCollection
      .find({ userId: req.session?.user })
      .populate("productId");

    cartData.forEach((value) => {
      grandTotal += value.totalCostProduct;
    });
     

    
    const cartChecking = await cartCollection
      .find({ userId: req.session?.user })
      .populate("productId");

    const coupanData = await coupanCollection.find();
    if (cartChecking == "") {
      res.redirect("/cartPage");
    } else {
      res.render("userPage/checkOut", {
        adrressData,
        cartData,
        grandTotal,
        coupanData,
      });
    }
  } catch (error) {
    console.log(error.message);

  }
};

// Ivadayanne nammal change cheythutullathe
const failureCheck = async (req, res) => {
  try {
    const userId = req.session?.user._id;
    const orderValueGenerate = Math.floor(10 + Math.random() * 90);
    const orderNumber = orderValueGenerate;
    req.session.orderNUmber = orderNumber;

    const userCartData = await JSON.parse(
      JSON.stringify(
        await cartCollection.find({ userId: userId }).populate("productId")
      )
    );
    req.session.razorpayOrderData;

    const grandTotalCheckout =
      req.session?.razorpayOrderData?.grandTotalCheckout;
    const paymentTypeValue = "Payment Pending";
    const selectAddressValue =
      req.session?.razorpayOrderData?.selectAddressValue;
    const razorpayId = null;

    const orderDetails = {
      userId: userId,
      orderNumber: orderNumber,
      paymentType: paymentTypeValue,
      addressChosen: selectAddressValue,
      cartData: userCartData,
      grandTotalCost: grandTotalCheckout,
      paymentId: razorpayId,
    };

    await orderCollection(orderDetails).save();

    console.log("Pakka working");

    res.render("userPage/paymentErrorPage");
  } catch (error) {
    console.log(error.message);
  }
};

const checkOutSave = async (req, res) => {
  try {
    let paymentCOD = req.query.paymentCOD;

    req.session.paymentCOD = paymentCOD;
    let limitAmountCOD = req.body.grandTotalCheckout;
    console.log(limitAmountCOD);
    if (limitAmountCOD <= 1000) {
      let cartData = await cartCollection
        .find({ userId: req.session?.user })
        .populate("productId");

      console.log(cartData);
      // #  Add the single Order status
      // console.log(cartData)
      // console.log('***********************')
      // console.log(cartData[0])

      const orderValueGenerate = Math.floor(10 + Math.random() * 90);

      let userData = req.session.user;

      let orderNumber = orderValueGenerate;

      let newOrder = new orderCollection({
        userId: userData,
        orderNumber: orderNumber,
        paymentType: req.body.paymentTypeValue,
        addressChosen: req.body.selectAddressValue,
        cartData: JSON.parse(JSON.stringify(cartData)),
        grandTotalCost: req.body.grandTotalCheckout,
        coupanApplied: req.session.coupanId || null
      });

      newOrder.cartData.forEach((item) => {
        item.singleOrderstatus = "pending";
      });

      let successedOrder = await newOrder.save();

      req.session.orderNUmber = orderNumber;
      req.session.orderId = newOrder._id;

      if (successedOrder) {
        res.send({ success: true });
      }
    } else {
      res.send({ limitExceededForCOD: true });
    }
  } catch (error) {
    console.log(error.message);

  }
};

const razorPaying = async (req, res) => {
  try {
    console.log(`razorpay comming ${req?.query?.paymentRazorPay}`);

    const grandTotalCheckout = req.body.grandTotalCheckout;
    req.session.razorpayOrderData = { ...req.body };

    console.log(`session data varund${req.session.razorpayOrderData}`);
    console.log(`razorrr${req.session.razorpayOrderData.grandTotalCheckout}`);

    const options = {
      amount: grandTotalCheckout + "00",
      currency: "INR",
      receipt: "receipt#1",
    };

    razorpay.instance.orders.create(options, (err, order) => {
      if (err) {
        return res.render("userPage/paymentErrorPage"); // Render the payment error page
      }
      res.json({ success: true, orderId: order.id });
    });
  } catch (error) {
    console.log(error.message);
  }
};

const orderPlacingRazorpay = async (req, res) => {
  try {
    const userId = req.session?.user._id;
    const orderValueGenerate = Math.floor(10 + Math.random() * 90);

    const orderNumber = orderValueGenerate;

    const userCartData = await JSON.parse(
      JSON.stringify(
        await cartCollection.find({ userId: userId }).populate("productId")
      )
    );
    const grandTotalCheckout =
      req.session?.razorpayOrderData?.grandTotalCheckout;
    const paymentTypeValue = req.session?.razorpayOrderData?.paymentTypeValue;
    const selectAddressValue =
      req.session?.razorpayOrderData?.selectAddressValue;
    const razorpayId = req.body?.razorpay_payment_id;
    req.session.orderNUmber = orderNumber;
    const orderDetails = {
      userId: userId,
      orderNumber: orderNumber,
      paymentType: paymentTypeValue,
      addressChosen: selectAddressValue,
      cartData: userCartData,
      grandTotalCost: grandTotalCheckout,
      paymentId: razorpayId,
      coupanApplied:req.session.coupanId || null
    };

    // req.session.orderNUmber = orderNumber;
    console.log("razorpay odrder number", req.session.orderNUmber);
    req.session.orderDetails = orderDetails._id;
    await orderCollection(orderDetails).save();

    res.redirect("/orderSuccessPage");
  } catch (error) {
    console.log(error.message);

  }
};

const walletPayment = async (req, res) => {
  try {
    const cartData = await cartCollection
      .find({ userId: req.session?.user })
      .populate("productId");
    let userData = req.session.user;

    const orderValueGenerate = Math.floor(10 + Math.random() * 90);

    let orderNumber = orderValueGenerate;

    let walletExssist = await walletCollection.findOne({
      userId: req.session?.user._id,
    });

    if (walletExssist) {
      const walletBalance = walletExssist.walletBalance;

      if (walletBalance >= req.body.grandTotalCheckout) {
        let newOrder = new orderCollection({
          userId: userData,
          orderNumber: orderNumber,
          paymentType: req.body.paymentTypeValue,
          addressChosen: req.body.selectAddressValue,
          cartData: JSON.parse(JSON.stringify(cartData)),
          grandTotalCost: req.body.grandTotalCheckout,
          coupanApplied:req.session.coupanId || null
        });

        let successedOrder = await newOrder.save();
        req.session.orderNUmber = orderNumber;
        console.log("wallet odrder number", req.session.orderNUmber);

        if (successedOrder) {
          res.send({ success: true });
        }

        await walletCollection.updateOne(
          { userId: req.session?.user._id },

          {
            $inc: { walletBalance: -req.body.grandTotalCheckout },

            $push: {
              walletTransaction: {
                paymentType: req.body.paymentTypeValue,
                transactionDate: Date.now(),
                transactionAmount: req.body.grandTotalCheckout,
                transactionType: "Debit on after ordering product",
              },
            },
          }
        );
      } else {
        res.send({ insuffiecientBalance: true });
      }
    }
  } catch (error) {
    console.log(error.message);

  }
};

const orderGetPage = async (req, res) => {
  try {
    let orderNumber = req?.session?.orderNUmber;

    console.log("Order number varunilla ", orderNumber);

    let cartData = await cartCollection
      .find({ userId: req.session?.user })
      .populate("productId");

    const orderData = await orderCollection.findOne({
      userId: req.session.user,
      orderNumber: orderNumber,
    });

    console.log("order page get kittunde", orderData);

    res.render("userPage/orderSucess", { cartData, orderData });

    cartData.forEach(async (data) => {
      await productCollection.findByIdAndUpdate(
        { _id: data.productId._id },
        { $inc: { productStock: -data.productQuantity } }
      );
      //  await productCollection.findByIdAndUpdate({_id:data.productId._id},{$inc:{productStock:data.productQuantity}})
    });

    await cartCollection
      .deleteMany({ userId: req.session?.user })
      .populate("productId");
  } catch (error) {
    console.log(error.message);
  }
};

const checkingEmpty = async (req, res) => {
  try {
    const cartChecking = await cartCollection.find();

    if (cartChecking == null) {
      res.send({ empty: true });
    }
  } catch (error) {
    console.log(error.message);

  }
};

const stockDecreasing = async (req, res) => {
  try {
    //   let productQuantity = req.query.id;
    //   let productId = req.query.productId;
    // let productStock = await productCollection.findOne({ _id: productId });

    // console.log(productStock.productStock);

    // let result = productStock.productStock - productQuantity;

    // await productCollection.updateOne(
    //   { _id: productId },
    //   {
    //     $set: {
    //       productStock: result,
    //     },
    //   }
    // );

    // const cartData = await cartCollection.find({userId:req.session.user._id}).populate('productId')

    res.send({ sucesss: true });
  } catch (error) {
    console.log(error.message);

  }
};
const coupanAdding = async (req, res) => {
  try {
    // let total = parseFloat(req.query.grandTotal);

   let total = req.session.grandTotal
    let coupanId = req.query.id;

    let coupon = await coupanCollection.findOne({ _id: coupanId });

    if (!coupon) {
      return res.status(404).send({ message: "Coupon not found" });
    }

    let coupanAmount = coupon.coupanAmount;
     let totalValue = total - coupanAmount

    let coupanAlreadyUsed = await coupanCollection.findOne({
      _id: coupanId,
      usedUsers: req.session.user._id,
    });

    if (!coupanAlreadyUsed) {
      await cartCollection.updateOne(
        { userId: req.session.user._id },
        { $inc: { totalCostProduct:totalValue  } }
      );

      await coupanCollection.updateOne(
        { _id: coupanId },
        { $push: { usedUsers: req.session.user._id } }
      );

       req.session.coupanId = coupanId
      // await orderCollection.updateOne(
      //   { _id: req.session.orderDetails },
        
      //   { $inc: { grandTotalCost: req.session.grandTotal } }
      // );

      
      res.send({ success: true });
    } else {
      res.send({ alreadyUsed: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  checkOutPage,
  checkOutSave,
  orderGetPage,
  checkingEmpty,
  stockDecreasing,
  razorPaying,
  orderPlacingRazorpay,
  walletPayment,
  coupanAdding,
  failureCheck,
};
