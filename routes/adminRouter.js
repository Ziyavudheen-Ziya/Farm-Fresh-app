const express = require("express");
const adminController = require("../controller/adminController.js");
const categoryController = require("../controller/categoryController.js");
const productController = require("../controller/productController.js");
const orderMangement = require("../controller/adminOrderManagementController.js");
const adminRouter = express.Router();
const uploads = require("../services/multer.js");

adminRouter.get("/admin", adminController.adminLoginPage);
adminRouter.post("/dashbord", adminController.admincheck);

adminRouter.get("/userdetails", adminController.userdetails);
adminRouter.get("/blockUser", adminController.blockUser);
adminRouter.get("/unBlockUser", adminController.unBlockUser);
adminRouter.get('/adminlogout',adminController.logoutPage)

//    =================Category Controller================
adminRouter.get("/category", categoryController.category);
adminRouter.post("/addCategory", categoryController.addcategory);
adminRouter.post("/editCategory", categoryController.editCategory);
adminRouter.get("/listCategory", categoryController.listCategory);
adminRouter.get("/unListCategory", categoryController.unListCategory);

// ==================Product Controller==============
adminRouter.get("/productsdetails", productController.productPage);
adminRouter.get("/addProduct", productController.addProductPage);
adminRouter.post("/addProducts", uploads.any(), productController.addProduct);
adminRouter.get("/blockProduct", productController.blockProduct);
adminRouter.get("/unBlockProduct", productController.unBlockProduct);
adminRouter.get("/editPage/:id", productController.editPage);
adminRouter.post(
  "/editProduct/:id",
  uploads.any(),
  productController.editProduct
);
adminRouter.post("/deletepicture", productController.deleteImg);
adminRouter.delete("/deleteProduct", productController.deleteProduct);

//=========================ORDER MANAGMENT========================//
adminRouter.get("/ordersDetails", orderMangement.orderManagmentPage);
adminRouter.get("/pending", orderMangement.pending);
adminRouter.get("/shipped", orderMangement.shipped);
adminRouter.get("/delivered", orderMangement.delivered);
adminRouter.get("/returnDeliver", orderMangement.returnDeliver);
adminRouter.get("/cancelled", orderMangement.cancelled);
adminRouter.get('/viewDetails:id',orderMangement.viewDetails)
module.exports = adminRouter;
