const express = require("express");
const adminController = require("../controller/adminController.js");
const categoryController = require("../controller/categoryController.js");
const productController = require("../controller/productController.js");
const orderMangement = require("../controller/adminOrderManagementController.js");
const coupanController = require('../controller/coupanController.js')
const adminRouter = express.Router();
const uploads = require("../services/multer.js");
const prodcutOfferController = require('../controller/productOfferManagment.js')
const categoryOfferCollection = require('../controller/categoryOfferController.js')

const salesController = require('../controller/adminsalesReportController.js')
const adminIsActive = require('../middleware/adminAuth.js')
adminRouter.get("/admin", adminController.adminLoginPage);
adminRouter.post("/dashbord", adminController.admincheck);
adminRouter.get('/dashboardGetPage',adminController.dashboardGetPage)
adminRouter.get('/dashboardData',adminController.dashboardData)

adminRouter.get("/userdetails", adminController.userdetails);
adminRouter.get("/blockUser", adminController.blockUser);
adminRouter.get("/unBlockUser", adminController.unBlockUser);
adminRouter.get('/adminlogout',adminController.logoutPage)

//    =================Category Controller================
adminRouter.get("/category",adminIsActive, categoryController.category);
adminRouter.post("/addCategory",adminIsActive, categoryController.addcategory);
adminRouter.put("/editCategory", adminIsActive,categoryController.editCategory);
adminRouter.get("/listCategory",adminIsActive, categoryController.listCategory);
adminRouter.get("/unListCategory",adminIsActive, categoryController.unListCategory);

// ==================Product Controller==============
adminRouter.get("/productsdetails",adminIsActive, productController.productPage);
adminRouter.get("/addProduct",adminIsActive, productController.addProductPage);
adminRouter.post("/addProducts",adminIsActive, uploads.any(), productController.addProduct);
adminRouter.get("/blockProduct",adminIsActive, productController.blockProduct);
adminRouter.get("/unBlockProduct",adminIsActive, productController.unBlockProduct);
adminRouter.get("/editPage/:id", adminIsActive,productController.editPage);
adminRouter.put(
  "/editProduct/:id",
  uploads.any(),
  productController.editProduct
);
adminRouter.post("/deletepicture",adminIsActive, productController.deleteImg);
adminRouter.delete("/deleteProduct",adminIsActive, productController.deleteProduct);

//=========================ORDER MANAGMENT========================//
adminRouter.get("/ordersDetails",adminIsActive, orderMangement.orderManagmentPage);
adminRouter.get("/pending",adminIsActive, orderMangement.pending);
adminRouter.get("/shipped",adminIsActive, orderMangement.shipped);
adminRouter.get("/delivered",adminIsActive, orderMangement.delivered);
adminRouter.get("/returnDeliver",adminIsActive, orderMangement.returnDeliver);
adminRouter.get("/cancelled",adminIsActive, orderMangement.cancelled);
adminRouter.get('/viewDetails:id',adminIsActive,orderMangement.viewDetails)


// ==================================Coupan==================================//

adminRouter.get('/coupan',coupanController.coupanGetPage)
adminRouter.post('/addCoupan',coupanController.coupanAdding)
adminRouter.put('/editCoupan',coupanController.editCoupan)
adminRouter.delete('/deleteCoupan',coupanController.deleteCoupan)



// ==========================offerProduct================================//
adminRouter.get('/offerProduct',prodcutOfferController.productOfferGetPage)
adminRouter.post('/addOfferProduct',prodcutOfferController.productOfferAdding)
adminRouter.post('/productOfferEdit',prodcutOfferController.prodcutEditOffer)


// ===========================Category OfferProduct===========================//
adminRouter.get('/categoryOffer',categoryOfferCollection.categoryOfferGetPage)
adminRouter.post('/categoryOfferAdding',categoryOfferCollection.categoryAdding)
adminRouter.put('/editCategoryOffer',categoryOfferCollection.categoryOfferEdited)

// =========================Sales Report===========================//
adminRouter.get('/salesreport',salesController.salesGetPage)
adminRouter.post('/salesReportFilter',salesController.salesReportFiltered)
adminRouter.post('/salesReportLongFilter',salesController.salesReportFilteredLong)
adminRouter.get('/salesReport/download/pdf',salesController.generatingPdf)
adminRouter.get('/salesReport/download/xlsx',salesController.salesReportSheet)


// =======================Top Selling Prodcuts===================================//
adminRouter.get('/topSellingProducts',adminController.topSellingProducts)
adminRouter.get('/topSellingCategory',adminController.topSellingCategory)

module.exports = adminRouter;
