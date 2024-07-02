const categoryCollection = require("../models/categoryModel");
const categoryOfferCollection = require("../models/categoryOfferModel");
const productCollection = require("../models//productModel");
const AppError = require("../middleware/errorHandling");

const categoryOfferGetPage = async (req, res, next) => {
  try {
    let categoryOfferData = await categoryOfferCollection.find();

    const categoryOfferPerPage = 8;
    const totalPages = categoryOfferData.length / categoryOfferPerPage;
    const pageNo = req.query.pageNo || 1;
    const start = (pageNo - 1) * categoryOfferPerPage;
    const end = start + categoryOfferPerPage;
    categoryOfferData = categoryOfferData.slice(start, end);

    res.render("adminPage/categoryOffer", { categoryOfferData, totalPages });
  } catch (error) {
    next(new AppError("Somthing went Wrong", 500));

    console.log(error.message);
  }
};

const categoryAdding = async (req, res, next) => {
  try {
    console.log(req.body.categoryName);
    console.log(req.body.productOfferAmount);
    console.log(req.body.startDate);
    console.log(req.body.endDate);

    const categoryExsist = await categoryCollection.findOne({
      categoryname: req.body.categoryName,
    });

    if (categoryExsist) {
      const newCategoryOffer = new categoryOfferCollection({
        categoryId: categoryExsist._id,
        categoryName: req.body.categoryName,
        productOfferAmount: req.body.productOfferAmount,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      });

      await newCategoryOffer.save();

      await categoryCollection.updateOne(
        { _id: categoryExsist._id },
        {
          $set: {
            categoryOfferId: newCategoryOffer._id,
            categoryOfferAmount: req.body.productOfferAmount,
          },
        }
      );

      res.send({ success: true });
      console.log("poyi");
    } else {
      res.send({ categoryNotExsist: true });
    }
  } catch (error) {
    next(new AppError("Somthing went Wrong", 500));

    console.log(error.message);
  }
};

const categoryOfferEdited = async (req, res, next) => {
  try {
    // console.log("data comming", req.body.productOfferAmount);
    // console.log("data comming", req.body.startDate);
    // console.log("data comming", req.body.endDate);
    // console.log("data comming", req.body.categoryName);

    let categoryName = req.body.categoryName;

    let categoryExsist = await categoryOfferCollection.findOne({
      categoryName: categoryName,
    });

    if (categoryExsist) {
      await categoryOfferCollection.updateOne(
        { _id: categoryExsist._id },
        {
          $set: {
            productOfferAmount: req.body.productOfferAmount,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
          },
        }
      );
    }

    await res.send({ success: true });
  } catch (error) {
    next(new AppError("Somthing went Wrong", 500));

    console.log(error.message);
  }
};

module.exports = {
  categoryOfferGetPage,
  categoryAdding,
  categoryOfferEdited,
};
