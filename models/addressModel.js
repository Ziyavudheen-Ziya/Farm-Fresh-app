const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  houseNumber: {
    type: Number,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },

  pincode: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("address", addressSchema);
