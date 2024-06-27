const { _makeLong } = require("path");
const coupanCollection = require("../models/coupanModel");
const AppError = require("../middleware/errorHandling");
const coupanGetPage = async (req, res, next) => {
  try {
    let coupanData = await coupanCollection.find();

    const coupanPerPage = 8;
    const totalPages = coupanData.length / coupanPerPage;
    const pageNo = req.body.pageNo || 1;
    const start = (pageNo - 1) * coupanPerPage;
    const end = start + coupanPerPage;

    coupanData = coupanData.slice(start, end);

    res.render("adminPage/coupanAdmin", { coupanData, totalPages });
  } catch (error) {
    next(new AppError("Something went wrong CoupanPage", 500));
  }
};

const coupanAdding = async (req, res, next) => {
  try {
    let coupanExsist = await coupanCollection.findOne({
      coupanCode: req.body.couponCode,
    });

    if (!coupanExsist) {
      let newCoupan = new coupanCollection({
        coupanCode: req.body.couponCode,
        coupanAmount: req.body.coupanAmount,
        minimumPurchase: req.body.minimumPurchase,
        startDate: req.body.startDate,
        expiryDate: req.body.expiryDate,
      });

      await newCoupan.save();
      console.log("data saved");
      res.send({ success: true });
    } else {
      res.send({ alreadyExsist: true });
    }
  } catch (error) {
    next(new AppError("Something went wrong CoupanPage", 500));
  }
};

const editCoupan = async (req, res, next) => {
  try {
    const coupanCodeExsisit = await coupanCollection.findOne({
      _id: req.query.id,
    });

    console.log("coupanId comming", coupanCodeExsisit);

    coupanCode = await coupanCollection.findOne({
      coupanCode: req.body.couponCode,
    });

    if (coupanCode) {
      if (coupanCodeExsisit) {
        await coupanCollection.updateOne(
          { _id: req.query.id },

          {
            $set: {
              coupanCode: req.body.couponCode,
              coupanAmount: req.body.coupanAmount,
              minimumPurchase: req.body.minimumPurchase,
              startDate: req.body.startDate,
              expiryDate: req.body.expiryDate,
            },
          }
        );

        res.send({ success: true });
      }
    } else {
      res.send({ coupanIsNotAVialable: true });
    }
  } catch (error) {
    next(new AppError("Something went wrong CoupanPage", 500));
  }
};

const coupanRemoving = async () => {
  try {
    const currentDate = new Date();
    console.log(currentDate);

    const result = await coupanCollection.deleteMany({
      expiryDate: { $lt: currentDate },
    });
  } catch (error) {
    next(new AppError("Something went wrong CoupanPage", 500));
  }
};

const deleteCoupan = async (req, res, next) => {
  try {
    await coupanCollection.deleteOne({ _id: req.query.id });

    res.send({ deleted: true });
  } catch (error) {
    next(new AppError("Something went wrong CoupanPage", 500));
  }
};
module.exports = {
  coupanGetPage,
  coupanAdding,
  editCoupan,
  coupanRemoving,
  deleteCoupan,
};
