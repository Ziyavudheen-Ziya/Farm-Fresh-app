const userCollection = require("../models/userModel.js");
const otpCollection = require("../models/otpModel.js");
const productCollection = require("../models/productModel.js");
const categoryCollection = require("../models/categoryModel.js");

const bcrypt = require("bcrypt");
const sendOtp = require("../services/sentOtp.js");
const { render } = require("ejs");
const { use } = require("../routes/userRouter.js");
const { addAbortListener } = require("nodemailer/lib/xoauth2/index.js");
const orderCollection = require("../models/orderModel.js");
const cartCollection = require("../models/cartModel.js");
const walletCollection = require("../models/walletModel.js");
const applyReferalCode = require("../helper/referal.js");
const offerProductCollection = require("../models/productOfferModel.js");
const categoryOfferCollection = require("../models/categoryOfferModel.js");
const AppError = require("../middleware/errorHandling.js");
const landingPage = async (req, res, next) => {
  try {
    let userLogged = req.session?.user;

    console.log("use logged", userLogged);

    if (userLogged) {
      res.render("userPage/landingPage", { userLogged: userLogged });
    } else {
      res.render("userPage/landingPage", { userLogged: false });
    }
  } catch (error) {
    console.log(error.message);
    next(new AppError("Something went wrong User", 500));
  }
};

const loginSignupPage = async (req, res, next) => {
  try {
    if (!req.session.user) {
      const referal = req.query?.referalCode;
      console.log(`referal commiing ${referal}`);

      req.session.tempReferalcode = referal;

      res.render("userPage/signupLogin", { referal });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
  }
};

const userSave = async (req, res, next) => {
  try {
    let bcryptPassword = bcrypt.hashSync(req.body.password, 10);
    let referalCode = Math.floor(100000 + Math.random() * 900000);
    req.session.referalCode = referalCode;
    req.session.tempUser = {
      name: req.body.name,
      email: req.body.email,
      password: bcryptPassword,
      phone: req.body.phone,
      referalCode,
    };

    const generateOtp = Math.floor(100000 + Math.random() * 900000);

    console.log(generateOtp);

    const otpUser = new otpCollection({
      email: req.body.email,
      otp: generateOtp,
    });

    const userExist = await userCollection.findOne({ email: req.body.email });

    console.log(userExist);

    if (userExist) {
      res.redirect("/loginpage");
    } else {
      await otpUser.save();
      await sendOtp(req.body.email, generateOtp);

      res.redirect("/otp");
    }
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
  }
};

const login = async (req, res, next) => {
  try {
    console.log("login alreasy exssitig user");
    const userExist = await userCollection.findOne({ email: req.body.email });

    const userblock = await userCollection.findOne({ block: false });

    if (req.session.user) {
      return res.render("userPage/landingPage", {
        userLogged: req.session.user,
      });
    }

    if (userExist) {
      let passwordMatch = bcrypt.compareSync(
        req.body.password,
        userExist.password
      );

      if (userblock) {
        if (passwordMatch) {
          req.session.user = userExist;
          req.session.referalCode;
          res.render("userPage/landingPage", { userLogged: req.session.user });
        } else {
          res.redirect("/loginpage");
        }
      } else {
        res.redirect("/loginpage");
      }
    } else {
      res.redirect("/loginpage");
    }
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
  }
};

const otpPage = async (req, res, next) => {
  try {
    let userId = req.session.user;

    if (userId) {
      res.redirect("/");
    } else {
      res.render("userPage/otp");
    }

    console.log("get this page");
  } catch (error) {
    next(new AppError("Something went wrongUser", 500));
  }
};

const veryFyingotp = async (req, res, next) => {
  try {
    const otp = await otpCollection.findOne({ otp: req.body?.otp });

    console.log(`Datebase ${otp}`);

    if (otp) {
      const newUser = new userCollection(req.session.tempUser);

      await newUser.save();
      req.session.user = newUser;
      const newWallet = new walletCollection({
        userId: req.session.user._id,
        walletBalance: 0,
        walletTransaction: [],
      });

      await newWallet.save();

      delete req.session.tempUser;
      delete req.session.referalCode;

      let tempReferalcode = req.session.tempReferalcode;
      if (tempReferalcode) {
        await applyReferalCode(tempReferalcode);
        delete req.session.tempReferalcode;
      }

      res.send({ otpVerified: true });
    } else {
      res.send({ otpInvalid: true });
    }
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
  }
};

const resendotp = async (req, res, next) => {
  try {
    const generateOtp = Math.floor(100000 + Math.random() * 900000);

    await sendOtp(req.body.email, generateOtp);

    res.send({ otpsend: true });
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
  }
};
const productPage = async (req, res, next) => {
  try {
    const categoryData = await categoryCollection.find();
    const categoryOffers = await categoryOfferCollection.find();

    let page = Number(req.query.page) || 1;
    let limit = 8;
    let skip = (page - 1) * limit;
    let sortField = req.query.sortValue || "default";
    let categoryName = req.query.categoryName || null;

    let sortCriteria = {};
    if (sortField === "priceAscending") {
      sortCriteria = { productPrice: 1 };
    } else if (sortField === "priceDescending") {
      sortCriteria = { productPrice: -1 };
    } else if (sortField === "alphbetSortingAZ") {
      sortCriteria = { productName: 1 };
    } else if (sortField === "alphbetSortingZA") {
      sortCriteria = { productName: -1 };
    }

    let query = { isListed: true };

    if (categoryName) {
      query.parentCategory = categoryName;
    }

    let productData = await productCollection
      .find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .populate("productOfferId");

    productData = productData.map((product) => {
      let finalPrice = product.productPrice;
      let offerAmount = 0;
      let isOfferValid = false;

      const productOffer = product.productOfferId;
      const categoryOffer = categoryOffers.find(
        (offer) =>
          offer.categoryName === product.parentCategory &&
          new Date(offer.endDate) > new Date()
      );

      if (productOffer && new Date(productOffer.endDate) > new Date()) {
        offerAmount = productOffer.productOfferAmount;
        isOfferValid = true;
      } else if (categoryOffer) {
        offerAmount = categoryOffer.productOfferAmount;
        isOfferValid = true;
      }

      if (isOfferValid) {
        finalPrice -= offerAmount;
      }

      product.displayPrice = finalPrice;
      product.isOfferValid = isOfferValid;
      product.offerAmount = offerAmount;

      return product;
    });

    let count = await productCollection.countDocuments(query);

    if (req.session.user) {
      res.render("userPage/productList", {
        categoryData,
        productData,
        page,
        limit,
        count,
        sortField,
        categoryName,
      });
      console.log("entering product page");
    } else {
      res.redirect("/loginpage");
    }
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
  }
};

const productDetail = async (req, res, next) => {
  try {
    const singleData = await productCollection.findOne({ _id: req.params.id });

    const prodcutQuantity = await cartCollection.findOne({
      productQuantity: req.session.product,
    });

    if (prodcutQuantity) console.log("productt quantiy entering");

    res.render("userPage/productDetails", { singleData });
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
  }
};

const logOutting = async (req, res) => {
  try {
    req.session.user = false;
    res.redirect("/");
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
  }
};

const sortingProduct = async (req, res, next) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = 8;
    let skip = (page - 1) * limit;
    let sortField = req.query.sortValue || "default";

    let sortCriteria = {};
    if (sortField === "priceAscending") {
      sortCriteria = { productPrice: 1 };
    } else if (sortField === "priceDescending") {
      sortCriteria = { productPrice: -1 };
    } else if (sortField === "AlphbetSortingAZ") {
      sortCriteria = { productName: 1 };
    } else if (sortField === "alphbetSortingZA") {
      sortCriteria = { productName: -1 };
    }

    let productData = await productCollection
      .find({ isListed: true })
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    req.session.productData = productData;

    res.send({ success: true });
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
  }
};

const forgotPasswordGetPage = async (req, res, next) => {
  try {
    res.render("userPage/forgotPassword");
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
  }
};

const forgotOtpGrtPage = async (req, res, next) => {
  try {
    res.render("userPage/fogotPasswordOtp");
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
  }
};

const updatingForgotPassword = async (req, res, next) => {
  try {
    req.session.forgotEmail = req.body.forgetEmail;

    const emailVerification = await userCollection.findOne({
      email: req.body.forgetEmail,
    });

    if (emailVerification) {
      const generateOtp = Math.floor(100000 + Math.random() * 900000);

      console.log(generateOtp);

      const otpUser = new otpCollection({
        email: req.body.forgetEmail,
        otp: generateOtp,
      });

      await otpUser.save();
      await sendOtp(req.body.forgetEmail, generateOtp);

      res.send({ success: true });
    } else {
      res.send({ wrong: true });
    }
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
  }
};

const forgotPasswordVerifyOtp = async (req, res, next) => {
  try {
    console.log(req.body.otp);
    console.log("1");
    const otp = await otpCollection.findOne({ otp: req.body?.otp });

    console.log(`Datebase ${otp}`);

    if (otp) {
      res.send({ otpVerified: true });
    } else {
      res.send({ otpInvalid: true });
    }
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
  }
};

const forgotResendOtp = async (req, res, next) => {
  try {
    const generateOtp = Math.floor(100000 + Math.random() * 900000);
    console.log(generateOtp);
    await sendOtp(req.body.forgetEmail, generateOtp);

    res.send({ otpsend: true });
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
  }
};

const forgotPassworChangingGetPAge = async (req, res, next) => {
  try {
    res.render("userPage/UpdatingForgotChangePassword");
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
  }
};

const forgotPasswordUpdating = async (req, res, next) => {
  try {
    console.log("Entering");

    const updatingPassword = bcrypt.hashSync(
      req.body.forgotConfirmPassword,
      10
    );
    console.log(updatingPassword);

    await userCollection.updateOne(
      { email: req.session.forgotEmail },
      { $set: { password: updatingPassword } }
    );

    res.send({ success: true });
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
  }
};

const productSearching = async (req, res, next) => {
  try {
    const searchValue = req.query.id;
    const regex = new RegExp(`^${searchValue}`, "i");

    const products = await productCollection.find({ productName: regex });
    res.json(products);
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
  }
};

const googleCallback = async (req, res, next) => {
  try {
    console.log("enterin t this page ggogle callBack");

    let referalCode = Math.floor(100000 + Math.random() * 900000);

    req.session.referalCode = referalCode;

    const user = await userCollection.findOneAndUpdate(
      { email: req.user.email },
      { $set: { name: req.user.displayName, referalCode: referalCode } },
      { upsert: true, new: true }
    );

    req.session.user = user;

    res.redirect("/");
  } catch (error) {
    next(new AppError("Something went wrong User", 500));
    res.redirect("/loginpage");
  }
};

module.exports = {
  landingPage,
  loginSignupPage,
  userSave,
  otpPage,
  veryFyingotp,
  resendotp,
  login,
  productPage,
  productDetail,
  logOutting,
  sortingProduct,
  forgotPasswordGetPage,
  updatingForgotPassword,
  forgotOtpGrtPage,
  forgotPasswordVerifyOtp,
  forgotResendOtp,
  forgotPassworChangingGetPAge,
  forgotPasswordUpdating,
  productSearching,
  googleCallback,
};
