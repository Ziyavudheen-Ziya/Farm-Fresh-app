const orderCollection = require("../models/orderModel.js");
const { any } = require("../services/multer.js");
const userCollection = require("../models/userModel.js");

const orderManagmentPage = async (req, res) => {
  try {

    console.log("hai");
    const orderData = await orderCollection.find().populate('userId')

    console.log(`order Data admin varunde ${orderData}`);

    res.render("adminPage/orderedList", { orderData });
  } catch (error) {
    console.log(error.message);
  }
};

const pending = async (req, res) => {
  try {

    await orderCollection.updateOne(
      { _id: req.query.id },
      {
        $set: {
          orderStatus: "pending",
        },
      }
    );

    res.send({ pending: true });

  } catch (error) {
    console.log(error.message);
  }
};

const shipped = async (req, res) => {
  try {
    await orderCollection.updateOne(
      { _id: req.query.id },
      {
        $set: {
          orderStatus: "shipped",
        },
      }
    );

    res.send({ shipped: true });

  } catch (error) {
    console.log(error.message);
  }
};

const delivered = async (req, res) => {
  try {
    await orderCollection.updateOne(
      { _id: req.query.id },
      {
        $set: {
          orderStatus: "deliverd",
        },
      }
    );

    res.send({ delivered: true });

  } catch (error) {
    console.log(error.message);
  }
};

const returnDeliver = async (req, res) => {
  try {
    await orderCollection.updateOne(
      { _id: req.query.id },
      {
        $set: {
          orderStatus: "return",
        },
      }
    );

    res.send({ returnDeliver: true });

  } catch (error) {
    console.log(error.message);
  }
};

const cancelled = async (req, res) => {
  try {
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


const viewDetails = async(req,res)=>{
    
    try {
   
      let orderNumber = req.session.orderNUmber

      const orderData = await orderCollection.findOne({orderNumber:req.params.id}).populate('addressChosen')

      




      console.log("order data varunde",orderData);


      res.render('adminPage/viewDetails',{orderData})


      
    } catch (error) {

      console.log(error.message);
      
    }
}

module.exports = {
  orderManagmentPage,
  pending,
  shipped,
  delivered,
  returnDeliver,
  cancelled,
  viewDetails
};
