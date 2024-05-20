const categoryCollection = require("../models/categoryModel.js");
const prodcutCollection = require("../models/productModel.js");

const category = async (req, res) => {
  try {
    const categoryData = await categoryCollection.find();

    res.render("adminPage/category", { Category: categoryData });
  } catch (error) {
    console.log(error.message);
  }
};

const addcategory = async (req, res) => {
  try {
    const newCategory = new categoryCollection({
      categoryname: req.body.categoryName,
      categoryDescription: req.body.categoryDescription,
    });

    console.log("checking");

    const categoryExists = await categoryCollection.findOne({
      categoryname: req.body.categoryName,
    });

    if (categoryExists) {
      res.send({ invalid: true });
    } else {
      newCategory.save();
      res.send({ success: true });
    }

    console.log("1");
  } catch (error) {
    console.log(error.message);
  }
};

const listCategory = async (req, res) => {
  try {
    console.log(req.query.id);

    await categoryCollection.updateOne(
      { categoryname: req.query.id },
      { $set: { isListed: false } }
    );

    res.send({ list: true });
  } catch (error) {
    console.log(error.message);
  }
};

const unListCategory = async (req, res) => {
  try {
    console.log("unlisted");

    await categoryCollection.updateOne(
      { categoryname: req.query.id },
      { $set: { isListed: true } }
    );

    res.send({ unList: true });
  } catch (error) {
    console.log(error.message);
  }
};

const editCategory = async (req, res) => {
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
    console.log(error.message);
  }
};

module.exports = {
  category,
  addcategory,
  listCategory,
  unListCategory,
  editCategory,
};
