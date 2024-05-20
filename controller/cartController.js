const cartCollection = require("../models/cartModel.js");
const { updateOne } = require("../models/userModel.js");
const userCollection = require("../models/userModel.js");
const productCollection = require("../models/productModel.js");
const { find } = require("../models/otpModel.js");
const { productDetail } = require("./userController.js");

const cartPage = async (req, res) => {
  try {
    let cartData = await cartCollection.find({ userId: req.session.user._id }).populate('productId')

      console.log(`cartData varund ${cartData}`);


    res.render("userPage/cart", { cartData });
  } catch (error) {
    console.log(error.message);
  }
};
const addingCart = async (req, res) => {
  try {
    
    const currentUserId = req.session.user._id;

     let prodcutStock = await productCollection.findOne({_id:req.query.id})

     
     const limit = prodcutStock.productStock;


         if(prodcutStock.productStock<0){

                res.send({empty:true})
         }else{


          if (currentUserId) {
            const existingCart = await cartCollection.findOne({
              userId: currentUserId,
              productId: req.query.id,
            });
      
            if (!existingCart) {
             
              const price = await productCollection.findOne({ _id: req.query.id });
              const newCart = new cartCollection({
                userId: currentUserId,
                productId: req.query.id,
                productQuantity: 1, 
                totalCostProduct: price.productPrice, 
              });
              await newCart.save();
               res.send({ success: true });
            } else {
              
              
              if (existingCart.productQuantity < limit) {
               
                await cartCollection.updateOne(
                  { _id: existingCart._id },
                  { $inc: { productQuantity: 1 } }
                );
      
               
                const price = await productCollection.findOne({ _id: req.query.id });
                const totalCost = price.productPrice * (existingCart.productQuantity + 1);
                await cartCollection.updateOne(
                  { _id: existingCart._id },
                  { $set: { totalCostProduct: totalCost } }
                );
                 res.send({ success: true });
              } else {
                
                 res.send({ limitExceeded: true });
              }            
        
            }
      
          } else {
      
            console.log(error.message);
          
          }

         }
   
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};






const minimumQuantity = async (req, res) => {
  try {
    const productData = await productCollection.findOne({ _id: req.query.id });

    const cartData = await cartCollection
      .findOne({ productId: req.query.id })
      .populate("productId");

    if (productData && cartData.productQuantity > 1) {
      await cartCollection.updateOne(
        { productId: req.query.id },
        {
          $inc: {
            productQuantity: -1,
          },
        }
      );

      const updateCartData = await cartCollection.findOne({
        productId: req.query.id,
      });
      const updateTotalCoast =
        updateCartData.productQuantity * productData.productPrice;

      await cartCollection.updateOne(
        { productId: req.query.id },
        {
          $set: {
            totalCostProduct: updateTotalCoast,
          },
        }
      );

      res.send({
        lessminimum: true,
        updateTotalCoast,
        updateQuantity: updateCartData.productQuantity,
      });
    } else {
      res.send({ minimum: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const maximumQuantity = async (req, res) => {
  try {
    const product = await productCollection.findOne({ _id: req.query.id });
    const cartData = await cartCollection.findOne({ productId: req.query.id });

    let limit = product.productStock;

    if (product&& cartData.productQuantity < limit) {
         await cartCollection.updateOne(
        { productId: req.query.id },
        {
          $inc: { productQuantity: 1 },
        }
      );


      const updateCartData = await cartCollection.findOne({
        productId: req.query.id,
      });

      const updateTotalCoast = updateCartData.productQuantity * product.productPrice;

      console.log(`updating total cost ${updateTotalCoast}`);

      await cartCollection.updateOne(
        { productId: req.query.id },
        {
          $set: {
            totalCostProduct: updateTotalCoast,
          },
        }
      );

      res.send({
        addQuantity: true,
        updateTotalCoast,
        updateQuantity: updateCartData.productQuantity,
      });
    } else {
      res.send({ maximum: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deletingProdcut = async (req, res) => {
  try {
    const Id = req.query.id;

    await cartCollection.deleteOne({ _id: Id });

    res.send({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  cartPage,
  addingCart,
  minimumQuantity,
  maximumQuantity,
  deletingProdcut,
};
