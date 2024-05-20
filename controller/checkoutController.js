const cartCollection = require("../models/cartModel.js");
const profileCollectionn = require("../models/addressModel.js");
const orderCollection = require("../models/orderModel.js");
const productCollection = require("../models/productModel.js");
const { json } = require("express");
const { productDetail } = require("./userController.js");

const checkOutPage = async (req, res) => {
  try {
    let grandTotal = 0;

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


    if (cartChecking == "") {
      res.redirect("/cartPage");
    } else {
      res.render("userPage/checkOut", { adrressData, cartData, grandTotal });

    }
  } catch (error) {
    console.log(error.message);
  }
};

const checkOutSave = async (req, res) => {
  try {
    console.log("entering");

    let cartData = await cartCollection
      .find({ userId: req.session?.user })
      .populate("productId");

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
    });


    let successedOrder = await newOrder.save();
    req.session.orderNUmber = orderNumber
    


    if (successedOrder) {
      res.send({ success: true });
    }

    console.log("work avunnede");
  } catch (error) {
    console.log(error.message);
  }
};

const orderGetPage = async (req, res) => {
  try {
    let cartData = await cartCollection
      .find({ userId: req.session?.user })
      .populate("productId");

    res.render("userPage/orderSucess", { cartData });

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
    let productQuantity = req.query.id;
    let productId = req.query.productId;


    let productStock = await productCollection.findOne({ _id: productId });

    console.log(productStock.productStock);

    let result = productStock.productStock - productQuantity;

    await productCollection.updateOne(
      { _id: productId },
      {
        $set: {
          productStock: result,
        },
      }
    );

    res.send({ sucesss: true });
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
};
