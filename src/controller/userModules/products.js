import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js"


const allProducts = async (req, res) => {

  
  
      try {
      
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page-1) * limit;
        const totalDocuments = await Product.countDocuments();
        const totalPages = Math.ceil(totalDocuments/limit);

        const query={};

        const {category,subCategory,brand} = req.query;
        if(category){
          const categoryDoc=await Category.findOne({name:category})
          query.category=categoryDoc._id
        }
        if(subCategory){
          query.subCategory=subCategory;
        }
        if(brand){
        query.brand=brand;
        }

        let sortOption = {createdAt:-1};  //default sort
       let sortBy= req.query.sort;
        
        if(sortBy=='alphabetical-az'){
          sortOption={name:1}
        }else if(sortBy=='alphabetical-za'){
          sortOption={name:-1}
        }else if(sortBy=='price-low-high'){
          sortOption={price:1}
        }else if(sortBy=='price-high-low'){
          sortOption={price:-1}
        }else if(sortBy=='date-old-new'){
          sortOption={date:1}
        }else if(sortBy=='date-new-old'){
          sortOption={date:-1}
        }else{
          sortOption={createdAt:-1}
        }

        const products = await Product.find(query).skip(skip).limit(limit).sort(sortOption);
        console.log(products);
        res.status(200).render("user/products.ejs", { products,currentPage:page,totalPages:totalPages });
      } catch (err) {
        console.error(err);
        res.send("Error occured");
      }

};





const searchProductsPage=(req,res)=>{
  res.render('user/searchProductsPage.ejs')
}

const singleProduct = async (req,res)=>{
  console.log('Req received at singleProduct');
  const productId= req.params.id;
  console.log(productId);
  const product=await Product.findById(productId);
  console.log(product);
  if(product){
    res.render('user/singleProduct.ejs',{product})
  }
 
}

export default {
  allProducts,
  singleProduct,
  searchProductsPage
};
