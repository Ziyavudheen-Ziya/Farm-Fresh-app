const wishlistCollection = require("../models/wishlistModel");
const productCollection = require("../models/productModel");
const cartCollection = require("../models/cartModel");
const AppError = require("../middleware/errorHandling");
const wishlistGetPAge = async (req, res, next) => {
  try {
    const whishlistData = await wishlistCollection
      .find({ userId: req.session?.user._id })
      .populate("productId");

    res.render("userPage/wishlist", { whishlistData });
  } catch (error) {
    next(new AppError("Something went wrong Whilshlist", 500));
  }
};

const productAddToWishlist = async (req, res, next) => {
  try {
    let newWishlist = new wishlistCollection({
      userId: req.session?.user._id,
      productId: req.query.id,
    });

    const walletExsisting = await wishlistCollection.findOne({
      productId: req.query.id,
    });

    if (!walletExsisting) {
      await newWishlist.save();
      res.send({ success: true });
    } else {
      res.send({ alreadyExsist: true });
    }
  } catch (error) {
    next(new AppError("Something went wrong Whilshlist", 500));
  }
};

const addingProductFromWhishlist = async (req, res, next) => {
  try {
    const currentUserId = req.session.user._id;
    const productId = req.query.id;

    const productStcok = await productCollection.findOne({ _id: productId });

    let limit = productStcok.productStock;

    const cartExsisting = await cartCollection.findOne({
      userId: currentUserId,
      productId: productId,
    });

    if (!cartExsisting) {
      const price = await productCollection.findOne({ _id: productId });

      let newCart = new cartCollection({
        userId: currentUserId,
        productId: productId,
        productQuantity: 1,
        totalCostProduct: price.productPrice,
      });

      await newCart.save();
      res.send({ suucess: true });
    } else {
      if (cartExsisting.productQuantity < limit) {
        await cartCollection.updateOne(
          { _id: cartExsisting._id },
          { $inc: { productQuantity: 1 } }
        );

        const price = await productCollection.findOne({ _id: productId });
        const totalCost =
          price.productPrice * (cartExsisting.productQuantity + 1);
        await cartCollection.updateOne(
          { _id: cartExsisting._id },
          { $set: { totalCostProduct: totalCost } }
        );

        res.send({ success: true });
      } else {
        res.send({ limitexceed: true });
      }
    }
  } catch (error) {
    next(new AppError("Something went wrong Whilshlist", 500));
  }
};

const deleteProductWhishlist = async (req, res, next) => {
  try {
    await wishlistCollection.deleteOne({ _id: req.query.id });

    res.send({ success: true });
  } catch (error) {
    next(new AppError("Something went wrong Whilshlist", 500));
  }
};

module.exports = {
  wishlistGetPAge,
  productAddToWishlist,
  addingProductFromWhishlist,
  deleteProductWhishlist,
};
