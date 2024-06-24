const categoryCollection = require("../models/categoryModel.js");
const prodcutCollection = require("../models/productModel.js");
const cartCollection = require("../models/cartModel.js");
const AppError = require('../middleware/errorHandling.js')

const category = async (req, res,next) => {
  try {
    let categoryData = await categoryCollection.find();

    const categoryPerPage = 8;
    const totalPages = categoryData.length / categoryPerPage;
    const pageNo = req.query.pageNo || 1;
    const start = (pageNo - 1) * categoryPerPage;
    const end = start + categoryPerPage;

    categoryData = categoryData.slice(start, end);

    res.render("adminPage/category", { Category: categoryData, totalPages });
  } catch (error) {
    next(new AppError("Something went wrong CategoryPage", 500));
  }
};

const addcategory = async (req, res,next) => {
  try {
    console.log("entring 1");
    const newCategory = new categoryCollection({
      categoryname: req.body.categoryName,
      categoryDescription: req.body.categoryDescription,
    });


    const categoryExists = await categoryCollection.findOne({
      categoryname: req.body.categoryName,
    });

    if (categoryExists) {
      res.send({ invalid: true });
    } else {
      newCategory.save();
      res.send({ success: true });
    }

    console.log("entring 1");
  } catch (error) {
    console.log(error.message);
    next(new AppError("Something went wrong CategoryPage", 500));
  }
};

const listCategory = async (req, res,next) => {
  try {
    console.log(req.query.id);

    await categoryCollection.updateOne(
      { categoryname: req.query.id },
      { $set: { isListed: false } }
    );

    res.send({ list: true });
  } catch (error) {
    next(new AppError("Something went wrong CategoryPage", 500));
  }
};

const unListCategory = async (req, res,next) => {
  try {
    console.log("unlisted");

    await categoryCollection.updateOne(
      { categoryname: req.query.id },
      { $set: { isListed: true } }
    );

    res.send({ unList: true });
  } catch (error) {
    next(new AppError("Something went wrong CategoryPage", 500));
  }
};

const editCategory = async (req, res,next) => {
  console.log("entered");

  try {
    const catDetails = await categoryCollection.findOne({
      categoryname: {
        $regex: new RegExp(
          "^" + req.body.categoryName.toLowerCase() + "$",
          "i"
        ),
      },
    });

    if (
      /^\s*$/.test(req.body.categoryName) ||
      /^\s*$/.test(req.body.categoryDescription)
    ) {
      res.send({ notValue: true });
    } else if (catDetails && catDetails._id != req.body.categoryId) {
      res.send({ exists: true });
    } else {
      await categoryCollection.updateOne(
        { _id: req.body.categoryId },
        {
          $set: {
            categoryname: req.body.categoryName,
            categoryDescription: req.body.categoryDescription,
          },
        }
      );
      res.send({ success: true });
    }
  } catch (error) {
    next(new AppError("Something went wrong CategoryPage", 500));
  }
};

module.exports = {
  category,
  addcategory,
  listCategory,
  unListCategory,
  editCategory,
};
