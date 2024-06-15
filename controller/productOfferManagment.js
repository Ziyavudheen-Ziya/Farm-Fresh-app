const offerProductCollection = require("../models/productOfferModel");
const productCollection = require("../models/productModel");
const AppError = require('../middleware/errorHandling')
const productOfferGetPage = async (req, res,next) => {
  try {
    let offerData = await offerProductCollection.find();

    const offerProductPerPage = 8;
    const totalPages = offerData.length / offerProductPerPage;
    const pageNo = req.query.pageNo || 1;
    const start = (pageNo - 1) * offerProductPerPage;
    const end = start + offerProductPerPage;

    offerData = offerData.slice(start, end);

    res.render("adminPage/productOffer", { offerData, totalPages });
  } catch (error) {
    next(new AppError("Something went wrong ProdcutOfferPage", 500));
  }
};

const productOfferAdding = async (req, res,next) => {
  try {
    console.log("entring add product page");

    console.log("productnam vannu", req.body.productName);
    console.log("productamount vannu", req.body.productOfferAmount);
    console.log("product date vannu", req.body.productName);
    console.log("product end vannu", req.body.productName);

    const prodictExsist = await productCollection.findOne({
      productName: req.body.productName,
    });

    if (prodictExsist) {
      const newOfferProduct = new offerProductCollection({
        productId: prodictExsist._id,
        productName: req.body.productName,
        productOfferAmount: req.body.productOfferAmount,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      });

      const offerProductExsist = await offerProductCollection.findOne({
        productName: req.body.productName,
      });

      if (!offerProductExsist) {
        await newOfferProduct.save();
        await productCollection.updateOne(
          { _id: prodictExsist._id },
          {
            $set: {
              productOfferId: newOfferProduct._id,
              productOfferAmount: req.body.productOfferAmount,
            },
          }
        );

        res.send({ success: true });
      } else {
        res.send({ offerProductExsist: true });
      }
    } else {
      res.send({ notExsist: true });
    }
  } catch (error) {
    next(new AppError("Something went wrong ProdcutOfferPage", 500));
  }
};

const prodcutEditOffer = async (req, res,next) => {
  try {
    console.log("date varund", req.body.productName);
    console.log("date varund", req.body.productOfferAmount);
    console.log("date varund", req.body.startDate);
    console.log("date varund", req.body.endDate);

    const prodcutExsist = await offerProductCollection.findOne({
      productName: req.body.productName,
    });

    if (prodcutExsist) {
      await offerProductCollection.updateOne(
        { _id: prodcutExsist._id },
        {
          $set: {
            productName: req.body.productName,
            productOfferAmount: req.body.productOfferAmount,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
          },
        }
      );
    }

    res.send({ success: true });
  } catch (error) {
    next(new AppError("Something went wrong ProdcutOfferPage", 500));
  }
};

module.exports = {
  productOfferGetPage,
  productOfferAdding,
  prodcutEditOffer,
};
