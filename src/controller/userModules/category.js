
import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js"
const getIems = async (req,res)=>{
  console.log('call inside getIEm');
  try {

    res.render('user/iem-category.ejs')
  } catch (error) {
    
  }


}

const getIemSubcategory = async (req,res) =>{
  try {
    console.log('call recived in getItemSubacategory');

    const {subCategory,brand} = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page-1) * limit;
    const totalDocuments = await Product.countDocuments();
    const totalPages = Math.ceil(totalDocuments/limit);
    let query={};
    if(brand) query.brand=brand;

    //sort management
    let sortOption = {createdAt:-1};
    let sortBy = req.query.sort;

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
    

        const products = await Product.aggregate([
          {$match:{subCategory:subCategory,isActive:true,isDeleted:false}},
          {$lookup:{from:'categories',localField:'category',foreignField:'_id',as:'category'}},
          {$unwind:'$category'},
          {$match:{'category.isActive':true,'category.isDeleted':false}},
          {$addFields:{'variants':{$filter:{$input:'$variants',as:'variant',cond:{$and:[{$eq:['$$variant.isActive',true]},{$eq:['$$isDeleted',false]}]}}}}},
        ])
    // const products = await Product.find({subCategory:subCategory,isActive:true,isDeleted:false}).populate({path:'category',match:{isActive:true,isDeleted:false}}) 


    res.render('user/item-list.ejs',{})
    console.log(subCategory);
  } catch (error) {
    console.log('Error in getItemSubcategory',error);
  }
}

export default{
  getIems,
  getIemSubcategory
}