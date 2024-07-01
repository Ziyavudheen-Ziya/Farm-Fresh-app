const { compareSync } = require("bcrypt");
const profileCollection = require("../models/addressModel.js");
const userCollection = require("../models/userModel.js");
const { logOutting } = require("./userController.js");
const bcrypt = require("bcrypt");
const cartCollecction = require("../models/cartModel.js");
const walletCollection = require("../models/walletModel.js");
// const AppError = require("../middleware/errorHandling.js");
const profilePage = async (req, res) => {
  try {
    const userData = await userCollection.findOne({ _id: req.session?.user });
    const referalCode = userData?.referalCode;

    const walletData = await walletCollection.findOne({
      userId: req.session?.user,
    });

    console.log(userData);

    if (userData) {
      res.render("userPage/profile", {
        userData,
        referalCode: referalCode,
        walletData,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addAddressPage = async (req, res) => {
  try {
    res.render("userPage/addAdress");
  } catch (error) {
    console.log(error.message);
  }
};

const newAddress = async (req, res) => {
  try {
    const ID = req.session?.user._id;

    const addressExsist = await profileCollection.findOne({
      city: req.body.city,
    });

    console.log(addressExsist);

    if (addressExsist) {
      res.send({ exsist: true });
    } else {
      let newAddress = new profileCollection({
        user_id: ID,
        name: req.body.name,
        phone: req.body.phone,
        houseNumber: req.body.houseNumber,
        state: req.body.state,
        city: req.body.city,
        pincode: req.body.pincode,
      });

      await newAddress.save();
      res.send({ success: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const myAddressPage = async (req, res) => {
  try {
    const userData = await userCollection.find({
      _id: req?.session?.user?._id,
    });

    const addressData = await profileCollection.find({
      user_id: req.session?.user,
    });

    res.render("userPage/myAdress", { addressData });
  } catch (error) {
    console.log(error.message);
  }
};

const editAddressPage = async (req, res) => {
  try {
    const addressData = await profileCollection.findOne({ _id: req.params.id });

    res.render("userPage/editAddress", { addressData });
  } catch (error) {
    console.log(error.message);
  }
};

const editAndUpdate = async (req, res) => {
  try {
    const addressExsist = await profileCollection.findOne({
      _id: req.params.id,
    });

    if (addressExsist && addressExsist._id != req.params.id) {
      res.send({ exsist: true });
    } else {
      await profileCollection.updateOne(
        { _id: req.params.id },
        {
          $set: {
            user_id: req.body.user_id,
            name: req.body.name,
            phone: req.body.phone,
            houseNumber: req.body.houseNumber,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
          },
        }
      );

      res.send({ success: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deletingAddress = async (req, res) => {
  try {
    const ID = req.query.id;

    await profileCollection.deleteOne({ _id: ID });

    res.send({ deleted: true });
  } catch (error) {
    console.log(error.message);
  }
};

const editPageProfile = async (req, res) => {
  try {
    const userData = req.session?.user;

    const data = await userCollection.findOne({ _id: req.session.user });

    res.render("userPage/editProfile", { data });
  } catch (error) {
    console.log(error.message);
  }
};

const editProfileUser = async (req, res) => {
  try {
    const { name, phone, email, userId } = req.body;

    await userCollection.updateOne(
      { _id: userId },

      { $set: { name: name, phone: phone, email: email } }
    );

    res.send({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

const changePasswordGetPage = async (req, res) => {
  try {
    res.render("userPage/changePassword");
  } catch (error) {
    console.log(error.message);
  }
};

const passwordUpdating = async (req, res) => {
  try {
    const bcryptPassword = bcrypt.hashSync(req.body.confirmPassword, 10);

    const passwordExsist = await userCollection.findOne();

    const exsist = bcrypt.compareSync(
      req.body.oldpassword,
      passwordExsist.password
    );

    if (exsist) {
      await userCollection.updateOne({ password: bcryptPassword });

      res.send({ success: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  profilePage,
  addAddressPage,
  newAddress,
  myAddressPage,
  editAddressPage,
  editAndUpdate,
  deletingAddress,
  editPageProfile,
  editProfileUser,
  changePasswordGetPage,
  passwordUpdating,
};
