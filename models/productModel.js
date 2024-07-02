const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  parentCategory: {
    type: String,
    required: true,
  },
  productImage: [{ type: String }],

  productPrice: { type: Number, required: true },
  productStock: { type: Number, required: true },
  productOfferId: {
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "productOffer",
  },
  productOfferAmount: { type: Number, default: null },
  isListed: { type: Boolean, default: true },
  Cancelled: { type: Boolean, default: false },
  categoryOfferAmount: { type: Number, default: null },
  productStockSold: { type: Number, default: 0 },
  categoryId: { type: mongoose.Types.ObjectId, default: null, ref: "category" },
});

module.exports = mongoose.model("products", productSchema);
