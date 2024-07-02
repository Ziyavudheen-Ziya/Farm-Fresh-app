const mongoose = require("mongoose");

const productOfferSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "products",
    },
    productName: { type: String, required: true },
    productOfferAmount: { type: Number, required: true },
    startDate: {
      type: Date,
      required: true,
      default: new Date().toLocaleString(),
    },
    endDate: { type: Date, required: true },
    currentstatus: { type: Boolean, required: true, default: true },
  },
  { strictPopulate: false },
  { timestamps: true }
);

module.exports = mongoose.model("productOffer", productOfferSchema);
