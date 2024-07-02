const path = require("path");
const orderCollection = require("../models/orderModel");
const { log } = require("console");
const { start } = require("repl");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const formatDate = require("../helper/formmerDataHelper");
const AppError = require("../middleware/errorHandling");

const salesGetPage = async (req, res, next) => {
  try {
    let salesData = [];
    let grandTotal = 0;
    let dateValues = req.session.admin?.dateValues || null;

    if (req.session.admin?.salesData) {
      salesData = req.session.admin.salesData;
      grandTotal = salesData.reduce(
        (total, sale) => total + sale.grandTotalCost,
        0
      );
      req.session.admin.salesData = null;
    } else {
      salesData = await orderCollection
        .find()
        .populate("userId")
        .populate({
          path: "cartData.productId",
          model: "products",
          select: "productName productPrice productOfferAmount",
        })
        .exec();

      grandTotal = salesData.reduce(
        (total, sale) => total + sale.grandTotalCost,
        0
      );
    }
    req.session.grandTotal = grandTotal;

    salesData.reverse();

    res.render("adminPage/salesReport", { salesData, grandTotal, dateValues });
  } catch (error) {
    next(new AppError("Somthing went Wrong", 500));

    console.log(error.message);
  }
};

const salesReportFiltered = async (req, res, next) => {
  try {
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);

    endDate.setHours(23, 59, 59, 999);

    const salesDataFiltered = await orderCollection
      .find({
        orderDate: { $gte: startDate, $lte: endDate },
      })
      .populate("userId")
      .populate({
        path: "cartData.productId",
        model: "products",
        select: "productName productPrice productOfferAmount",
      })
      .exec();

    salesDataFiltered.forEach((sale) => {
      sale.orderDateFormatted = sale.orderDate
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "-");
    });

    req.session.admin = {
      dateValues: req.body,
      salesData: salesDataFiltered,
    };

    res.json({ success: true });
  } catch (error) {
    next(new AppError("Somthing went Wrong", 500));

    console.log(error.message);
  }
};

const salesReportFilteredLong = async (req, res, next) => {
  try {
    const filterOption = req.body.filterOption;

    const today = new Date();
    let startDate;
    switch (filterOption) {
      case "week":
        startDate = new Date(today.setDate(today.getDate() - 7));
        break;

      case "month":
        startDate = new Date(today.setMonth(today.getMonth() - 1));
        break;

      case "year":
        startDate = new Date(today.setFullYear(today.getFullYear() - 1));
        break;

      default:
        startDate = new Date(0);
    }

    const salesDataFiltered = await orderCollection
      .find({
        orderDate: { $gte: startDate, $lte: new Date() },
      })
      .populate("userId")
      .populate({
        path: "cartData.productId",
        model: "products",
        select: "productName productPrice productOfferAmount",
      })
      .exec();

    salesDataFiltered.forEach((sale) => {
      sale.orderDateFormatted = formatDate(sale.orderDate);
    });

    req.session.admin = {
      dateValues: req.body,
      salesData: salesDataFiltered,
    };

    res.json({ success: true });
  } catch (error) {
    next(new AppError("Somthing went Wrong", 500));

    console.log(error.message);
  }
};

const generatingPdf = async (req, res, next) => {
  try {
    const salesData = await orderCollection
      .find({})
      .populate("userId")
      .populate({
        path: "cartData.productId",
        model: "products",
        select: "productName productPrice productOfferAmount",
      })
      .exec();

    let grandTotal = req.session.grandTotal;

    const doc = new PDFDocument({ margin: 30 });

    let filename = "SalesReport";
    filename = encodeURIComponent(filename) + ".pdf";

    res.setHeader(
      "Content-disposition",
      'attachment; filename="' + filename + '"'
    );
    res.setHeader("Content-type", "application/pdf");

    doc.on("data", (chunk) => res.write(chunk));
    doc.on("end", () => res.end());

    doc.fontSize(20).text("Sales Report Farm Fresh", 110, 57, {
      align: "center",
      underline: true,
    });
    doc.moveDown();

    doc
      .fontSize(20)
      .text(`Total Orders:${salesData.length}`, { align: "left" });
    doc.fontSize(20).text(`Total Revenue:${grandTotal}`, { align: "left" });
    doc.moveDown();

    const drawRow = (y, order, index) => {
      doc.lineWidth(0.5).rect(30, y, 550, 80).stroke();

      doc.fontSize(15).text(`Order#: ${index + 1}`, 40, y + 5);
      doc.fontSize(12).text(`Order No: ${order.orderNumber}`, 40, y + 25);
      doc.text(
        `Date: ${new Date(order.orderDate).toLocaleDateString()}`,
        250,
        y + 25
      );
      doc.text(`Total Cost: ₹${order.grandTotalCost}`, 40, y + 40);
      doc.text(`Payment Method: ${order.paymentType}`, 250, y + 40);
      doc.text(`Payment Status: ${order.orderStatus}`, 40, y + 55);

      doc.text("Products:", 250, y + 55);
      let productText = "";
      order.cartData.forEach((product) => {
        productText += ` - ${product.productId.productName}: ${product.productQuantity}\n`;
      });
      doc.text(productText, 350, y + 55);
    };

    let y = 150;
    salesData.forEach((order, index) => {
      drawRow(y, order, index);
      y += 100;
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });

    doc.end();
  } catch (error) {
    next(new AppError("Somthing went Wrong", 500));

    console.log(error.message);
  }
};

const salesReportSheet = async (req, res, next) => {
  try {
    const salesData = await orderCollection
      .find({})
      .populate("userId")
      .populate({
        path: "cartData.productId",
        model: "products",
        select: "productName productPrice productOfferAmount",
      })
      .exec();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");
    let grandTotal = req.session.grandTotal;

    worksheet.columns = [
      { header: "Order No", key: "orderNumber", width: 15 },
      { header: "Date", key: "orderDate", width: 15 },
      { header: "Products", key: "products", width: 30 },
      { header: "Products Quantity", key: "productsQuantity", width: 20 },
      { header: "Total Cost", key: "grandTotalCost", width: 15 },
      { header: "Payment Method", key: "paymentType", width: 15 },
      { header: "Payment Status", key: "orderStatus", width: 15 },
      { header: "Order#", key: "OrderListed", width: 15 },
      { header: "Total Revenue", key: "TotalRevenue", width: 15 },
    ];

    salesData.forEach((order) => {
      const products = order.cartData
        .map((product) => product.productId.productName)
        .join(", ");
      const productsQuantity = order.cartData
        .map((product) => product.productQuantity)
        .join(", ");

      worksheet.addRow({
        orderNumber: order.orderNumber,

        orderDate: new Date(order.orderDate).toLocaleDateString(),
        products: products,
        productsQuantity: productsQuantity,
        grandTotalCost: `₹${order.grandTotalCost}`,
        paymentType: order.paymentType,
        orderStatus: order.orderStatus,
      });
    });

    worksheet.addRow({
      OrderListed: salesData.length,
      TotalRevenue: grandTotal,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales_report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(new AppError("Somthing went Wrong", 500));

    console.log(error.message);
  }
};

module.exports = {
  salesGetPage,
  salesReportFiltered,
  salesReportFilteredLong,
  generatingPdf,
  salesReportSheet,
};
