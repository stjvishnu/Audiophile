import Product from "../../models/productModel.js"

const getProducts = async (req,res)=>{
 
  try{
    const products = await Product.find();
   
    res.status(200).render('user/products.ejs',{products})
  }
  catch(err){
    console.error(err)
    res.send("Error occured")
  }
}

export default{
  getProducts,
}