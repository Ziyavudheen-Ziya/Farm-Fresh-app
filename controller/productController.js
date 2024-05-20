const productCollection = require("../models/productModel.js");
const categoryCollection = require("../models/categoryModel.js");
const { exists } = require("../models/userModel.js");
const { errorMonitor } = require("nodemailer/lib/xoauth2/index.js");

const productPage = async (req, res) => {
  try {
    const productDatas = await productCollection.find();

    res.render("adminPage/productList", { productDatas });
  } catch (error) {
    console.log(error.message);
  }
};

const addProductPage = async (req, res) => {
  try {
    const categoryData = await categoryCollection.find({ isListed: true });

    res.render("adminPage/addProduct", { categoryData });
  } catch (error) {
    console.log(error.message);
  }
};

const addProduct = async (req, res) => {
  try {
    let imgFiles = [];

    

    for (let i = 0; i < req.files.length; i++) {
      imgFiles[i]=req.files[i].filename
    }

    console.log(req.files);

    console.log("van");

    const newProduct = new productCollection({
      productName: req.body.productName,
      parentCategory: req.body.parentCategory,
      productImage: imgFiles,
      productPrice: req.body.productPrice,
      productStock: req.body.productStock,
    });

    console.log(newProduct);

    const productDetails = await productCollection.find({
      productName: {
        $regex: new RegExp("^" + req.body.productName.toLowerCase() + "$", "i"),
      },
    });

    if (
      /^\s*$/.test(req.body.productName) ||
      /^\s*$/.test(req.body.productPrice) ||
      /^\s*$/.test(req.body.productStock)
    ) {
      res.send({ noValue: true });
    } else if (productDetails.length > 0 && !productDetails.productName) {
      res.send({ exists: true });
    } else {
      console.log("product saved successfully");
      await newProduct.save();
      res.send({ success: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const blockProduct = async (req, res) => {
  try {
    await productCollection.updateOne(
      { productName: req.query.id },
      { $set: { isListed: false } }
    );

    res.send({ block: true });
  } catch (error) {
    console.log(error.message);
  }
};

const unBlockProduct = async (req, res) => {
  try {
    await productCollection.updateOne(
      { productName: req.query.id },
      { $set: { isListed: true } }
    );
    res.send({ unBlock: true });
  } catch (error) {
    console.log(error.message);
  }
};

const editPage = async (req, res) => {
  try {
    console.log(`vanna vanilla ${req.params.id}`);

    
    const categoryData = await categoryCollection.find();


    const productData = await productCollection.findOne({
      _id: req.params?.id,
    });
    console.log(productData);

    res.render("adminPage/editAddProduct", { categoryData, productData });
      
    console.log("product sending");

  } catch (error) {
    console.log(error.message);
  }
};
const editProduct = async (req, res) => {
  try {
    let imgFiles = [];

    if(req.files.length==0){

       const exsistingProduct = await productCollection.findOne({_id:req.params.id})

       imgFiles = exsistingProduct.productImage
    }else{

      const exsistingProduct =await productCollection.findOne({_id:req.params.id})
      imgFiles = exsistingProduct.productImage||[]

      for (let i = 0; i < req.files.length; i++) {
        imgFiles.push(req.files[i].filename);
      }


    }

   
    
    console.log(`params work ayi ${req.params.id}`);

;

    console.log(`vann${req.files}`);

    const productDetails = await productCollection.findOne({productName:req.body.productName})

    if (
      /^\s*$/.test(req.body.productName) ||
      /^\s*$/.test(req.body.productPrice) ||
      /^\s*$/.test(req.body.productStock)
    ) {
      res.send({ noValue: true });
    } else if (productDetails && productDetails._id!=req.params.id) {
      res.send({ exists: true });
    } else {
      console.log("product saved successfully");
      await productCollection.updateOne(
        
           {_id:req.params.id},
        {
        
        $set: {
          productName: req.body.productName,
          parentCategory: req.body.parentCategory,
          productImage: imgFiles,
          productPrice: req.body.productPrice,
          productStock: req.body.productStock,
        },
      }
    );




    console.log("updated");
      res.send({ success: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};



const deleteProduct =  async(req,res)=>{


      try {

         const id = req.query.id

         await productCollection.deleteOne({_id:id})

         res.send({deleted:true})
          
        
         
      } catch (error) {
          
        console.log(error.message);
       }
}
const deleteImg = async (req, res) => {
     
  try {

   await productCollection.updateOne(
        {_id:req.query.productId},
        {$pull:{productImage:req.query.index}}
   )
    res.send({deleted:true})
      
  } catch (error) {
     console.log(error.message);
  }

};





module.exports = {
  productPage,
  addProductPage,
  addProduct,
  blockProduct,
  unBlockProduct,
  editPage,
  editProduct,
  deleteProduct,
  deleteImg
};
