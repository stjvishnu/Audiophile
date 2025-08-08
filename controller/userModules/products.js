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
        res.status(200).render("user/products.ejs", { products,currentPage:page,totalPages:totalPages });
      } catch (err) {
        console.error(err);
        res.send("Error occured");
      }

};

const postFilter = async (req,res)=>{
  
    try{

          const {category,subCategory,brand} = req.body;
          console.log(req.body)
          const filter={};
          
          if(category){

                const categoryArr=Array.isArray(category)?category:[category];
                const categoryDoc = await Category.find({name:{$in:categoryArr}});
                const categoryId = categoryDoc.map(doc=>doc._id)
              
                filter.category={$in:categoryId};

          }
        
          if(subCategory){

                filter.subCategory=Array.isArray(subCategory)?subCategory:[subCategory];

          }

          if(brand){

               filter.brand= Array.isArray(brand)?brand:[brand];

          }
          console.log(filter)
          const products = await Product.find(filter)
          res.status(200).render('user/products.ejs',{products})
    }
    catch(err){
      console.log('Error Happened')
      res.status(500).json({message:'error',error:err.message})
    }
    
}


const searchProducts= async (req,res)=>{
  console.log('Req received');
  const query = decodeURIComponent(req.query.search);
  console.log(query);
  const products=await Product.find({name:{$regex:query,$options:'i'}})
  res.json(products)
}

export default {
  allProducts,
  postFilter,
  searchProducts
};
