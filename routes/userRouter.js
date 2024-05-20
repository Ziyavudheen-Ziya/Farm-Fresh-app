const express = require("express");

const userController = require("../controller/userController.js");
const profileController = require("../controller/profileController.js");
const cartController = require("../controller/cartController.js");
const checkoutController = require("../controller/checkoutController.js");
const orderManagementController = require("../controller/orderManagementController.js");

const router = express.Router();

router.get("/", userController.landingPage);
router.get("/loginpage", userController.loginSignupPage);
router.post("/signup", userController.userSave);
router.post("/login", userController.login);
router.get("/otp", userController.otpPage);
router.post("/verfiyotp", userController.veryFyingotp);
router.post("/resendotp", userController.resendotp);
router.get("/logout", userController.logOutting);
router.get('/forgottenGetPassword',userController.forgotPasswordGetPage)
router.get('/forgotOtp',userController.forgotOtpGrtPage)
router.post('/updatingPassword',userController.updatingForgotPassword)
router.post('/forgotPasswordVerifyOtp',userController.forgotPasswordVerifyOtp)
router.post('/forgotPasswordresendotp',userController.forgotResendOtp)
router.get('/forgotPasswordGetPasswordPage',userController.forgotPassworChangingGetPAge)
router.post('/forgotPasswordUpdate',userController.forgotPasswordUpdating)

// ==============Product Management================//

router.get("/productListPage", userController.productPage);
router.get('/sort',userController.sortingProduct)
router.get("/productDetail/:id", userController.productDetail);

// ==================Profile Management===============//
router.get("/profilePage", profileController.profilePage);
router.get("/editProfile", profileController.editPageProfile);
router.post("/editProfile", profileController.editProfileUser);
router.get("/addAddress", profileController.addAddressPage);
router.post("/addNewAddress", profileController.newAddress);
router.get("/myAddress", profileController.myAddressPage);
router.get("/editAddressPage/:id", profileController.editAddressPage);
router.post("/editAddress/:id", profileController.editAndUpdate);
router.delete("/deleteAddress", profileController.deletingAddress);
router.get('/changePassword',profileController.changePasswordGetPage)
router.post('/passwordUpdate',profileController.passwordUpdating)


// ==================================CART==================================//
router.get("/cartPage", cartController.cartPage);
router.post("/addToCart", cartController.addingCart);
router.get("/minusQuantity", cartController.minimumQuantity);
router.get("/maximumQuantity", cartController.maximumQuantity);
router.delete("/delete", cartController.deletingProdcut);

// ==================CHECKOUT=====================//

router.get("/checkoutPage", checkoutController.checkOutPage);

// ============ORDER PAGE=============//

router.post("/orderData", checkoutController.checkOutSave);
router.get("/orderSuccessPage", checkoutController.orderGetPage);
router.post("/stockDecrase", checkoutController.stockDecreasing);

// ===========================MY ORDERS PAGE========================//

router.get("/myOrdersPage", orderManagementController.myOrdersPage);
router.get("/cancelOrderUser", orderManagementController.userOrderCancelled);
router.get("/returnUser", orderManagementController.returnUser);

module.exports = router;
