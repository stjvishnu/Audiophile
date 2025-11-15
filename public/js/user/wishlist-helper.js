
 async function handleWishlist(productId,variantId,element){
  console.log('Variant id from wishlist',variantId);
  let wishlistIcon=element.querySelector('.fa-heart');
  const isWishlisted=element.dataset.iswishlisted==='true'
  console.log(isWishlisted);
  
  try{
  
  if(isWishlisted){
   const response= await axios.delete('/user/wishlist',{
    data: {productId,variantId}
  });
   const message = response.data.customMessage;
   if(message){
      showToast('success',message)
    }
    wishlistIcon.style.color='#a3a5a8'
    element.dataset.iswishlisted='false'
    const wishlistTextDiv=element.querySelector('#wishlist-text')
    if(wishlistTextDiv){
      wishlistTextDiv.innerText='Wishlist'
    }
  }else{
  const response=await axios.post('/user/wishlist',{productId,variantId});
  console.log(response);
  const message = response.data.customMessage;
   if(message){
      showToast('success',message)
    }
    wishlistIcon.style.color='#000000'
    element.dataset.iswishlisted='true'
    const wishlistTextDiv=element.querySelector('#wishlist-text')
    if(wishlistTextDiv){
      wishlistTextDiv.innerText='Wishlisted'
    }
  }
  }catch(err){
  console.log(err);
  const message = err.response.data.customMessage || 'Something went wrong';
  showToast('error', message);
  }
  
}

