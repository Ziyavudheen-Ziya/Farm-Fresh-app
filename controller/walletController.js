const walletCollection = require("../models/walletModel");
const AppError = require("../middleware/errorHandling");
const walletGetPage = async (req, res, next) => {
  try {
    let userLogged = req.session?.user;

    let walletBal = await walletCollection.findOne({
      userId: req.session?.user,
    });
    let walletDet = await walletCollection.findOne({
      userId: req.session?.user,
    });
    const walletPerPage = 8;
    const totalPages = walletDet.walletTransaction.length / walletPerPage;
    const pageNo = req.query.pageNo || 1;
    const start = (pageNo - 1) * walletPerPage;
    const end = start + walletPerPage;
    walletDet = walletDet.walletTransaction.slice(start, end);

    res.render("userPage/wallet", {
      userLogged,
      walletBal,
      walletDet,
      totalPages,
    });
  } catch (error) {
    next(new AppError("Somthing went Wrong", 500));

    console.log(error.message);
  }
};

module.exports = {
  walletGetPage,
};
