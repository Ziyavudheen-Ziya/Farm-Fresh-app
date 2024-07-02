const userCollection = require("../models/userModel");
const walletCollection = require("../models/walletModel");

module.exports = async (referalCode) => {
  console.log("entering to the referal code side pakka");
  try {
    let referalCodeExsist = await userCollection.findOne({ referalCode });

    console.log(referalCodeExsist._id);
    if (referalCodeExsist) {
      await walletCollection.updateOne(
        { userId: referalCodeExsist._id },
        {
          $inc: {
            walletBalance: 500,
          },
          $push: {
            walletTransaction: {
              transactionDate: Date.now(),
              transactionAmount: 500,
              transactionType: "Credit on referal code",
            },
          },
        }
      );
    }
  } catch (error) {
    console.log(error.message);
  }
};
