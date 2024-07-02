const productCollection = require("../models/productModel.js");
const categoryCollection = require("../models/categoryModel.js");
const { exists } = require("../models/userModel.js");
const { errorMonitor } = require("nodemailer/lib/xoauth2/index.js");
const cartCollecction = require("../models/categoryModel.js");
const AppError = require("../middleware/errorHandling.js");

const productPage = async (req, res, next) => {
  try {
    const orderPerPage = 8;
    const pageNo = parseInt(req.query.pageNo) || 1;

    const totalProducts = await productCollection.countDocuments();
    const totalPages = Math.ceil(totalProducts / orderPerPage);

    const productDatas = await productCollection
      .find()
      .skip((pageNo - 1) * orderPerPage)
      .limit(orderPerPage);

    res.render("adminPage/productList", {
      productDatas,
      totalPages,
      currentPage: pageNo,
    });
  } catch (error) {
    next(new AppError("Somthing went Wrong", 500));

    console.log(error.message);
  }
};

const addProductPage = async (req, res, next) => {
  try {
    const categoryData = await categoryCollection.find({ isListed: true });

    res.render("adminPage/addProduct", { categoryData });
  } catch (error) {
    next(new AppError("Somthing went Wrong", 500));

    console.log(error.message);
  }
};

const addProduct = async (req, res, next) => {
  try {
    let imgFiles = [];
    let parentCategoryParts = req.body.parentCategory.split(","); // Split categoryId and categoryName
    let categoryId = parentCategoryParts[0].trim(); // Extract categoryId
    let parentCategoryName = parentCategoryParts[1].trim();

    console.log("category Id comming", categoryId);
    for (let i = 0; i < req.files.length; i++) {
      imgFiles[i] = req.files[i].filename;
    }

    const newProduct = new productCollection({
      productName: req.body.productName,
      parentCategory: parentCategoryName,
      productImage: imgFiles,
      productPrice: req.body.productPrice,
      productStock: req.body.productStock,
      categoryId: categoryId,
    });

    const productDetails = await productCollection.find({
      productName: {
        $regex: new RegExp("^" + req.body.productName.toLowerCase() + "$", "i"),
      },
    });

    if (
      /^\s*$/.test(req.body.productName) ||
      /^\s*$/.test(req.body.productPrice) ||
      /^\s*$/.test(req.body.productStock)
    ) {
      res.send({ noValue: true });
    } else if (productDetails.length > 0 && !productDetails.productName) {
      res.send({ exists: true });
    } else {
      console.log("product saved successfully");
      await newProduct.save();
      res.send({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    next(new AppError("Something went wrong ProductPage", 500));
  }
};

const blockProduct = async (req, res, next) => {
  try {
    await productCollection.updateOne(
      { productName: req.query.id },
      { $set: { isListed: false } }
    );

    res.send({ block: true });
  } catch (error) {
    next(new AppError("Somthing went Wrong", 500));

    console.log(error.message);
  }
};

const unBlockProduct = async (req, res, next) => {
  try {
    await productCollection.updateOne(
      { productName: req.query.id },
      { $set: { isListed: true } }
    );
    res.send({ unBlock: true });
  } catch (error) {
    next(new AppError("Somthing went Wrong", 500));

    console.log(error.message);
  }
};

const editPage = async (req, res, next) => {
  try {
    console.log(`vanna vanilla ${req.params.id}`);

    const categoryData = await categoryCollection.find();

    const productData = await productCollection.findOne({
      _id: req.params?.id,
    });

    res.render("adminPage/editAddProduct", { categoryData, productData });
  } catch (error) {
    next(new AppError("Somthing went Wrong", 500));

    console.log(error.message);
  }
};
const editProduct = async (req, res, next) => {
  try {
    let imgFiles = [];

    if (req.files.length == 0) {
      const exsistingProduct = await productCollection.findOne({
        _id: req.params.id,
      });

      imgFiles = exsistingProduct.productImage;
    } else {
      const exsistingProduct = await productCollection.findOne({
        _id: req.params.id,
      });
      imgFiles = exsistingProduct.productImage || [];

      for (let i = 0; i < req.files.length; i++) {
        imgFiles.push(req.files[i].filename);
      }
    }

    const productDetails = await productCollection.findOne({
      productName: req.body.productName,
    });

    if (
      /^\s*$/.test(req.body.productName) ||
      /^\s*$/.test(req.body.productPrice) ||
      /^\s*$/.test(req.body.productStock)
    ) {
      res.send({ noValue: true });
    } else if (productDetails && productDetails._id != req.params.id) {
      res.send({ exists: true });
    } else {
      console.log("product saved successfully");
      await productCollection.updateOne(
        { _id: req.params.id },
        {
          $set: {
            productName: req.body.productName,
            parentCategory: req.body.parentCategory,
            productImage: imgFiles,
            productPrice: req.body.productPrice,
            productStock: req.body.productStock,
          },
        }
      );

      res.send({ success: true });
    }
  } catch (error) {
    next(new AppError("Somthing went Wrong", 500));

    console.log(error.message);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const id = req.query.id;

    await productCollection.deleteOne({ _id: id });

    res.send({ deleted: true });
  } catch (error) {
    next(new AppError("Somthing went Wrong", 500));

    console.log(error.message);
  }
};
const deleteImg = async (req, res, next) => {
  try {
    await productCollection.updateOne(
      { _id: req.query.productId },
      { $pull: { productImage: req.query.index } }
    );
    res.send({ deleted: true });
  } catch (error) {
    next(new AppError("Somthing went Wrong", 500));

    console.log(error.message);
  }
};

module.exports = {
  productPage,
  addProductPage,
  addProduct,
  blockProduct,
  unBlockProduct,
  editPage,
  editProduct,
  deleteProduct,
  deleteImg,
};
