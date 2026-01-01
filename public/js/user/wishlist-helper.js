
 async function handleWishlist(productId,variantId,element){
  
  console.log('Call inside handle wishlsit');
  console.log('Variant id from wishlist',variantId);
  const wishListCountContainer= document.getElementById('wishListCountContainer');
  let wishlistIcon=element.querySelector('.fa-heart');
  const isWishlisted=element.dataset.iswishlisted==='true'  
  try{
    
  
  if(isWishlisted){
   const response= await axios.delete('/user/wishlist',{
    data: {productId,variantId}
  });
   const message = response.data.customMessage;
   if(message){
    const wishlistCount = Number(response.data.wishlistCount);
    console.log('WishList count',wishlistCount);
    wishListCountContainer.innerText=wishlistCount;
      showToast('success',message);
      if(response.data.wishlistCount=='0'){
        wishListCountContainer.classList.add('opacity-50')
      }
    }
    console.log(element.dataset)
   const isInWishlistPage = element.dataset.inwhichpage
   if(isInWishlistPage==='wishlist'){
    element.closest('.wishlist-card').remove()
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
    const wishlistCount = Number(response.data.wishlistCount);
    console.log('WishList count',wishlistCount);
    wishListCountContainer.innerText=wishlistCount;
      showToast('success',message);
      wishListCountContainer.classList.remove('opacity-50')
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
  if(err.response?.status===401){
    showToast('error','Please login to wishlist a product')
    setTimeout(()=>{
      window.location.href = '/user/login'
    },2000)
    return
  }
  const message = err.response.data.customMessage || 'Something went wrong';
  showToast('error', message);
  }
  
}

