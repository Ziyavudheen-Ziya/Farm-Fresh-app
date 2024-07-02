const express = require("express");
const adminController = require("../controller/adminController.js");
const categoryController = require("../controller/categoryController.js");
const productController = require("../controller/productController.js");
const orderMangement = require("../controller/adminOrderManagementController.js");
const coupanController = require("../controller/coupanController.js");
const adminRouter = express.Router();
const uploads = require("../services/multer.js");
const prodcutOfferController = require("../controller/productOfferManagment.js");
const categoryOfferCollection = require("../controller/categoryOfferController.js");
const salesController = require("../controller/adminsalesReportController.js");
const adminActive = require("../middleware/adminAuth.js");

adminRouter.get("/admin", adminController.adminLoginPage);
adminRouter.get("/getPageDashboard", adminController.dashboardGetPage);
adminRouter.post("/dashbord", adminController.admincheck);
adminRouter.get("/dashboardData", adminController.dashboardData);

adminRouter.get("/userdetails", adminController.userdetails);
adminRouter.get("/blockUser", adminController.blockUser);
adminRouter.get("/unBlockUser", adminController.unBlockUser);
adminRouter.get("/adminlogout", adminController.logoutPage);

//    =================Category Controller================
adminRouter.get("/category", adminActive, categoryController.category);
adminRouter.post("/addCategory", adminActive, categoryController.addcategory);
adminRouter.put("/editCategory", adminActive, categoryController.editCategory);
adminRouter.get("/listCategory", adminActive, categoryController.listCategory);
adminRouter.get(
  "/unListCategory",
  adminActive,
  categoryController.unListCategory
);

// ==================Product Controller==============
adminRouter.get("/productsdetails", adminActive, productController.productPage);
adminRouter.get("/addProduct", adminActive, productController.addProductPage);
adminRouter.post(
  "/addProducts",
  adminActive,
  uploads.any(),
  productController.addProduct
);
adminRouter.get("/blockProduct", adminActive, productController.blockProduct);
adminRouter.get(
  "/unBlockProduct",
  adminActive,
  productController.unBlockProduct
);
adminRouter.get("/editPage/:id", adminActive, productController.editPage);
adminRouter.put(
  "/editProduct/:id",
  uploads.any(),
  productController.editProduct
);
adminRouter.post("/deletepicture", adminActive, productController.deleteImg);
adminRouter.delete(
  "/deleteProduct",
  adminActive,
  productController.deleteProduct
);

//=========================ORDER MANAGMENT========================//
adminRouter.get(
  "/ordersDetails",
  adminActive,
  orderMangement.orderManagmentPage
);
adminRouter.get("/pending", adminActive, orderMangement.pending);
adminRouter.get("/shipped", adminActive, orderMangement.shipped);
adminRouter.get("/delivered", adminActive, orderMangement.delivered);
adminRouter.get("/returnDeliver", adminActive, orderMangement.returnDeliver);
adminRouter.get("/cancelled", adminActive, orderMangement.cancelled);
adminRouter.get("/viewDetails:id", adminActive, orderMangement.viewDetails);

// ==================================Coupan==================================//

adminRouter.get("/coupan", adminActive, coupanController.coupanGetPage);
adminRouter.post("/addCoupan", adminActive, coupanController.coupanAdding);
adminRouter.put("/editCoupan", adminActive, coupanController.editCoupan);
adminRouter.delete("/deleteCoupan", adminActive, coupanController.deleteCoupan);

// ==========================offerProduct================================//
adminRouter.get(
  "/offerProduct",
  adminActive,
  prodcutOfferController.productOfferGetPage
);
adminRouter.post(
  "/addOfferProduct",
  adminActive,
  prodcutOfferController.productOfferAdding
);
adminRouter.post(
  "/productOfferEdit",
  adminActive,
  prodcutOfferController.prodcutEditOffer
);

// ===========================Category OfferProduct===========================//
adminRouter.get(
  "/categoryOffer",
  adminActive,
  categoryOfferCollection.categoryOfferGetPage
);
adminRouter.post(
  "/categoryOfferAdding",
  adminActive,
  categoryOfferCollection.categoryAdding
);
adminRouter.put(
  "/editCategoryOffer",
  adminActive,
  categoryOfferCollection.categoryOfferEdited
);

// =========================Sales Report===========================//
adminRouter.get("/salesreport", adminActive, salesController.salesGetPage);
adminRouter.post(
  "/salesReportFilter",
  adminActive,
  salesController.salesReportFiltered
);
adminRouter.post(
  "/salesReportLongFilter",
  adminActive,
  salesController.salesReportFilteredLong
);
adminRouter.get(
  "/salesReport/download/pdf",
  adminActive,
  salesController.generatingPdf
);
adminRouter.get(
  "/salesReport/download/xlsx",
  adminActive,
  salesController.salesReportSheet
);

// =======================Top Selling Prodcuts===================================//
adminRouter.get(
  "/topSellingProducts",
  adminActive,
  adminController.topSellingProducts
);
adminRouter.get(
  "/topSellingCategory",
  adminActive,
  adminController.topSellingCategory
);

module.exports = adminRouter;
