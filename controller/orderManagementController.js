const orderCollection = require("../models/orderModel");
const { login } = require("./userController");

const myOrdersPage = async (req, res) => {
  try {
    const orderData = await orderCollection.find({ userId: req.session.user });

    console.log(orderData);

    res.render("userPage/myOrders", { orderData });
  } catch (error) {
    console.log(error.message);
  }
};

const userOrderCancelled = async (req, res) => {
  try {

    console.log("Entering");
    await orderCollection.updateOne(
      { _id: req.query.id },
      {
        $set: {
          orderStatus: "cancelled",
        },
      }
    );

    res.send({ cancelled: true });
  } catch (error) {
    console.log(error.message);
  }
};

const returnUser = async (req, res) => {
  try {
    await orderCollection.updateOne(
      { _id: req.query.id },
      {
        $set: {
          orderStatus: "return",
        },
      }
    );

    res.send({ return: true });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  myOrdersPage,
  userOrderCancelled,
  returnUser,
};
