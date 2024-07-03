const express = require("express");

const userController = require("../controller/userController.js");
const profileController = require("../controller/profileController.js");
const cartController = require("../controller/cartController.js");
const checkoutController = require("../controller/checkoutController.js");
const orderManagementController = require("../controller/orderManagementController.js");
const walletController = require("../controller/walletController.js");
const wishlistController = require("../controller/whislistController.js");
const isActive = require("../middleware/userAuth.js");
const router = express.Router();
const passport = require("passport");

router.get("/", userController.landingPage);
router.get("/loginpage", userController.loginSignupPage);
router.post("/signup", userController.userSave);
router.post("/login", userController.login);
router.get("/otp", userController.otpPage);
router.post("/verfiyotp", userController.veryFyingotp);
router.post("/resendotp", userController.resendotp);
router.get("/logout", userController.logOutting);
router.get("/forgottenGetPassword", userController.forgotPasswordGetPage);
router.get("/forgotOtp", userController.forgotOtpGrtPage);
router.post("/updatingPassword", userController.updatingForgotPassword);
router.post("/forgotPasswordVerifyOtp", userController.forgotPasswordVerifyOtp);
router.post("/forgotPasswordresendotp", userController.forgotResendOtp);
router.get(
  "/forgotPasswordGetPasswordPage",
  userController.forgotPassworChangingGetPAge
);
router.post("/forgotPasswordUpdate", userController.forgotPasswordUpdating);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://farmfresh.icu/loginpage",
  }),
  userController.googleCallback
);

// ==============Product Management================//

router.get("/productListPage", isActive, userController.productPage);
router.get("/sort", isActive, userController.sortingProduct);
router.get("/productDetail/:id", isActive, userController.productDetail);
router.get("/searchOrder", isActive, userController.productSearching);

// ==================Profile Management===============//
router.get("/profilePage", isActive, profileController.profilePage);
router.get("/editProfile", isActive, profileController.editPageProfile);
router.put("/editProfiles", isActive, profileController.editProfileUser);
router.get("/addAddress", isActive, profileController.addAddressPage);
router.post("/addNewAddress", isActive, profileController.newAddress);
router.get("/myAddress", isActive, profileController.myAddressPage);
router.get("/editAddressPage/:id", isActive, profileController.editAddressPage);
router.put("/editAddress/:id", isActive, profileController.editAndUpdate);
router.delete("/deleteAddress", profileController.deletingAddress);
router.get(
  "/changePassword",
  isActive,
  profileController.changePasswordGetPage
);
router.post("/passwordUpdate", isActive, profileController.passwordUpdating);

// ==================================CART==================================//
router.get("/cartPage", isActive, cartController.cartPage);
router.post("/addToCart", isActive, cartController.addingCart);
router.get("/minusQuantity", isActive, cartController.minimumQuantity);
router.get("/maximumQuantity", isActive, cartController.maximumQuantity);
router.delete("/delete", isActive, cartController.deletingProdcut);

// ==================CHECKOUT=====================//

router.get("/checkoutPage", isActive, checkoutController.checkOutPage);
router.post("/coupanAdding", isActive, checkoutController.coupanAdding);

// ============ORDER PAGE=============//

router.post("/orderData", isActive, checkoutController.checkOutSave);
router.post("/stockDecrase", isActive, checkoutController.stockDecreasing);
router.post("/razorPayOrder", isActive, checkoutController.razorPaying);
router.all(
  "/order/orderPlaced",
  isActive,
  checkoutController.orderPlacingRazorpay
);

router.post("/walletPayment", isActive, checkoutController.walletPayment);
router.get("/orderSuccessPage", isActive, checkoutController.orderGetPage);
router.get("/failurePayment", isActive, checkoutController.failureCheck);

// ===========================MY ORDERS PAGE========================//

router.get("/myOrdersPage", isActive, orderManagementController.myOrdersPage);
router.get(
  "/orderSingleData",
  isActive,
  orderManagementController.orderDetailsSingleUser
);
router.post(
  "/singleProductCancel",
  isActive,
  orderManagementController.singleProductCancel
);
router.get(
  "/cancelOrderUser",
  isActive,
  orderManagementController.userOrderCancelled
);
router.get("/returnUser", isActive, orderManagementController.returnUser);
router.get(
  "/downloadInvoice:id",
  isActive,
  orderManagementController.downloadInvoice
);

//    ===========================Wallet Controller==========================//
router.get("/walletGetPage", isActive, walletController.walletGetPage);

// ==============================WISHLIST PAGE======================//
router.post(
  "/whishlistGetPage",
  isActive,
  wishlistController.productAddToWishlist
);
router.get("/whishlistPage", isActive, wishlistController.wishlistGetPAge);
router.post(
  "/addingCartProductWhish",
  isActive,
  wishlistController.addingProductFromWhishlist
);
router.delete(
  "/deteleWhishlist",
  isActive,
  wishlistController.deleteProductWhishlist
);

module.exports = router;
