const cartCollection = require("../models/cartModel.js");
const { updateOne } = require("../models/userModel.js");
const userCollection = require("../models/userModel.js");
const productCollection = require("../models/productModel.js");
const { find } = require("../models/otpModel.js");
const { getRounds } = require("bcrypt");
const razorpay = require("../services/razorpay.js");
const offerProductCollection = require("../models/productOfferModel.js");
// const AppError = require("../middleware/errorHandling.js");
const cartPage = async (req, res) => {
  try {
    let TotalCost = 0;

    let cartData = await cartCollection
      .find({ userId: req.session.user._id })
      .populate({
        path: "productId",
        populate: {
          path: "productOfferId",
          model: "productOffer",
        },
      });

    for (const val of cartData) {
      if (val.productId) {
        let price = val.productId.productPrice;

        if (val.productId.productOfferId) {
          const offer = val.productId.productOfferId;
          if (
            offer &&
            offer.currentstatus &&
            offer.startDate <= new Date() &&
            offer.endDate >= new Date()
          ) {
            price = offer.productOfferAmount;
          }
        }

        TotalCost += price * val.productQuantity;
      }
    }

    console.log("Total Cost:", TotalCost);

    res.render("userPage/cart", { cartData, TotalCost });
  } catch (error) {
    console.log(error.message);
  }
};

const addingCart = async (req, res) => {
  try {
    const currentUserId = req.session.user._id;

    const product = await productCollection.findOne({ _id: req.query.id });

    if (!product) {
      return res.send({ error: "Product not found" });
    }

    if (product.productStock <= 0) {
      return res.send({ empty: true });
    }

    let price = product.productPrice;
    if (product.productOfferId) {
      const offer = await offerProductCollection.findOne({
        _id: product.productOfferId,
      });
      if (
        offer &&
        offer.currentstatus &&
        offer.startDate <= new Date() &&
        offer.endDate >= new Date()
      ) {
        price = offer.productOfferAmount;
      }
    }

    const existingCart = await cartCollection.findOne({
      userId: currentUserId,
      productId: req.query.id,
    });

    if (!existingCart) {
      const newCart = new cartCollection({
        userId: currentUserId,
        productId: req.query.id,
        productQuantity: 1,
        totalCostProduct: price,
      });
      await newCart.save();
      return res.send({ success: true });
    } else {
      if (existingCart.productQuantity < product.productStock) {
        await cartCollection.updateOne(
          { _id: existingCart._id },
          { $inc: { productQuantity: 1 } }
        );

        const totalCost = price * (existingCart.productQuantity + 1);
        await cartCollection.updateOne(
          { _id: existingCart._id },
          { $set: { totalCostProduct: totalCost } }
        );

        return res.send({ success: true });
      } else {
        return res.send({ limitExceeded: true });
      }
    }
  } catch (error) {
    console.log(error.message);

  }
};

const minimumQuantity = async (req, res) => {
  try {
    const productData = await productCollection.findOne({ _id: req.query.id });
    const cartData = await cartCollection.findOne({ productId: req.query.id });

    if (!productData || !cartData) {
      return res.status(404).send({ message: "Product or Cart not found" });
    }

    let price = productData.productPrice;
    if (productData.productOfferId) {
      const offer = await offerProductCollection.findOne({
        _id: productData.productOfferId,
      });
      if (
        offer &&
        offer.currentstatus &&
        offer.startDate <= new Date() &&
        offer.endDate >= new Date()
      ) {
        price = offer.productOfferAmount;
      }
    }

    if (cartData.productQuantity > 1) {
      await cartCollection.updateOne(
        { productId: req.query.id },
        { $inc: { productQuantity: -1 } }
      );

      const updateCartData = await cartCollection.findOne({
        productId: req.query.id,
      });
      const updateTotalCoast = updateCartData.productQuantity * price;

      await cartCollection.updateOne(
        { productId: req.query.id },
        { $set: { totalCostProduct: updateTotalCoast } }
      );

      return res.send({
        lessminimum: true,
        updateTotalCoast,
        updateQuantity: updateCartData.productQuantity,
      });
    } else {
      return res.send({ minimum: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const maximumQuantity = async (req, res) => {
  try {
    const product = await productCollection.findOne({ _id: req.query.id });
    const cartData = await cartCollection.findOne({ productId: req.query.id });

    if (!product || !cartData) {
      return res.status(404).send({ message: "Product or Cart not found" });
    }

    let price = product.productPrice;
    if (product.productOfferId) {
      const offer = await offerProductCollection.findOne({
        _id: product.productOfferId,
      });
      if (
        offer &&
        offer.currentstatus &&
        offer.startDate <= new Date() &&
        offer.endDate >= new Date()
      ) {
        price = offer.productOfferAmount;
      }
    }

    if (cartData.productQuantity < product.productStock) {
      await cartCollection.updateOne(
        { productId: req.query.id },
        { $inc: { productQuantity: 1 } }
      );

      const updateCartData = await cartCollection.findOne({
        productId: req.query.id,
      });
      const updateTotalCoast = updateCartData.productQuantity * price;

      await cartCollection.updateOne(
        { productId: req.query.id },
        { $set: { totalCostProduct: updateTotalCoast } }
      );

      return res.send({
        addQuantity: true,
        updateTotalCoast,
        updateQuantity: updateCartData.productQuantity,
      });
    } else {
      return res.send({ maximum: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deletingProdcut = async (req, res) => {
  try {
    const Id = req.query.id;

    await cartCollection.deleteOne({ _id: Id });

    res.send({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  cartPage,
  addingCart,
  minimumQuantity,
  maximumQuantity,
  deletingProdcut,
};
