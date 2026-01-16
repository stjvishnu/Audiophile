import Cart from '../models/cartModal.js'
import Offers from '../models/offerModel.js'
import Products from '../models/productModel.js'

const calculateCart = async (cart,charge=null)=>{
  console.log('control inside calculatecart');
  console.log('charge',charge);
  try {
  let total = 0;
  let totalDiscount = 0;
  let subTotal=0
  let cartCount=0
    const now = new Date()
  const festivalOffers = await Offers.find({offerType:'festival',isActive:true,isDelete:false,validFrom:{$lte:now},validTo:{$gte: now}})
    console.log('festivaloffer',festivalOffers);
  const resultItems = [];


  

  for(let item of cart.items){

    let appliedOffer = null;
    let discount = 0;
    let price = item.currentPrice;
    console.log('item',item);
    const bestFestivalOffer = getBestFestivalOffer(price,festivalOffers)
    const product = await Products.findOne({_id:item.productId._id,'variants.sku':item.variantId},{name:1,category:1,brand:1,variants:{$elemMatch:{sku:item.variantId}}}).populate('category')

    console.log('product',product);

    const productOffer = await Offers.findOne({offerType:'product',targetSku:product.variants[0].sku,isActive:true,isDelete:false})

    console.log('product offer',productOffer);
    const categoryOffer = await Offers.findOne({offerType:'category',targetId:product.category._id,isActive:true,isDelete:false});

    console.log('category offer',categoryOffer);

    if      (productOffer) appliedOffer=productOffer
    else if (categoryOffer) appliedOffer=categoryOffer
    else if (bestFestivalOffer) appliedOffer = bestFestivalOffer
    console.log('applied offer',appliedOffer);
    if(appliedOffer){
      if(appliedOffer.discountType=='percentage'){
        discount = Math.round(price * (appliedOffer.discountValue/100))
      } else {
        discount = Math.round(appliedOffer.discountValue);
      }
    }

    const finalPrice = Math.round(Math.max(price - discount, 0));
    const itemTotal = Math.round(finalPrice*item.quantity);
    const originalItemTotal = Math.round(price * item.quantity);

    subTotal+=originalItemTotal
    total+=itemTotal;
    totalDiscount += discount * item.quantity;
    console.log('item',product.brand);

    resultItems.push({
      productId: product._id,
      name:product.name,
      imgUrl:product.variants[0].attributes.productImages[0],
      color:product.variants[0].attributes.color,
      variantId:product.variants[0].sku,
      quantity: item.quantity,
      category: product.category.name,
      brand:product.brand,
      currentPrice:item.currentPrice,
      itemTotal,
      discount,
      appliedOffer:appliedOffer?.offerType || null
    });
    
  }
  cartCount=resultItems.length;
  if(total<1000){
    total+=charge
  }
  console.log('itemsasss',resultItems);
  return {
    items:resultItems,
    charge:total>1000?0:charge,
    subTotal,
    total,
    totalDiscount,
    cartCount
  }

  } catch (error) {
    console.log('error in calculatecart',error);
  }
  

  
}

function getBestFestivalOffer(price,festivalOffers){

  let bestOffer = null;
  let maxDiscount = 0;

  for(let offer of festivalOffers){
    let discount = 0;

    if(offer.discountType=='percentage'){
      discount=price* (offer.discountValue/100)
    }else{
      discount=offer.discountValue;
    }

    if(discount>maxDiscount){
      maxDiscount=discount;
      bestOffer=offer
    }
  }
  return bestOffer
}

export default calculateCart