const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "users",
    },

    orderNumber: {
      type: Number,
      required: true,
    },
    orderDate: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    paymentType: {
      type: String,
      default: "toBeChosen",
    },
    orderStatus: {
      type: String,
      default: "pending",
    },
    addressChosen: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "address",
    },
    cartData: {
      type: Array,
    },
    grandTotalCost: {
      type: Number,
    },
    paymentId: {
      type: String,
    },

    coupanApplied: {
      type: mongoose.Types.ObjectId,
      default: null,
      ref: "coupan",
    },
  },

  { strictPopulate: false }
);

const orderCollection = mongoose.model("orders", orderSchema);

module.exports = orderCollection;
