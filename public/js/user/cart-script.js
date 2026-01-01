
const cartmodal=document.getElementById('cartModal');
const cartCountContainer = document.getElementById('cartCountContainer')
const cancelBtn = document.getElementById('cancelBtn');
const addToCartBtn= document.querySelectorAll('.addToCartBtn')
const productContainer = document.getElementById('productContainer')
const subTotalEl         = document.getElementById('subTotal');

cancelBtn.addEventListener('click',()=>{
  document.getElementById('cartModal').classList.add('hidden')
})

addToCartBtn?.forEach((btn)=>{

btn.addEventListener('click',async (e)=>{
  console.log('Call recieved in add to cart btn inside cart script');
  e.preventDefault();
  
  //enabling loader
  document.getElementById('loader').classList.remove('hidden')
  document.body.style.overflow = 'hidden';


  const productId = e.currentTarget.dataset.productId;
  const variantId = e.currentTarget.dataset.variantId;
 
  
  console.log('ProductID:',productId);

  try {
    const res= await axios.post(`/user/cart/add-to-cart?`,{productId,quantity:1,variantId});
    console.log('response',res);
    if(res.data.cart){
        showToast('success','Product Added To Cart Successfully')
        console.log('CartCantainercpunt',cartCountContainer);
        console.log(res.data.cart);
        const cartCount = Number(res.data.cart.cartCount);
        console.log(cartCount);
        cartCountContainer.innerText=cartCount; 
        cartCountContainer.classList.remove('opacity-50');
        renderCart(res.data.cart);

        document.getElementById('loader').classList.add('hidden')
        document.body.style.overflow = '';
        document.getElementById('cartModal').classList.remove('hidden')
        
    }
  } catch (error) {
    console.log('Error in add to Cart',error)
    document.getElementById('loader').classList.add('hidden')
    document.body.style.overflow = '';
    if(error.response.status===401){
      showToast('error','Please login to wishlist a product')
    setTimeout(()=>{
      window.location.href = '/user/login'
    },2000)
    return
    }
    const message=error?.response?.data?.customMessage || 'Some thing Went Wrong';
    showToast('warning',message)
  }

  })
})

   
function renderCart(cart){
  console.log('inside renderCart',cart);
  productContainer.innerHTML='';

  if (!cart || !cart.items.length) {
    productContainer.innerHTML = `<p class="text-center text-gray-500">Your cart is empty.</p>`;
    subTotalEl.textContent = `0 ₹`
    document.getElementById('loader').classList.add('hidden')
    document.body.style.overflow = '';
    document.getElementById('cartModal').classList.remove('hidden')
      return
  }

      cart.items.forEach((item)=>{
      console.log('item',item);
      
  
      let productDiv = document.createElement('div');
      productDiv.innerHTML=`
      <li class="flex py-6">
      <div class="size-24 shrink-0 overflow-hidden rounded-[2rem] border border-gray-200">
          <img src="${item.imgUrl}" alt="Salmon orange fabric pouch with match zipper, gray zipper pull, and adjustable hip belt." class="size-full object-cover" />
      </div>
  
      <div class="ml-4 flex flex-1 flex-col">
          <div>
          <div class="flex justify-between text-base font-medium text-gray-900">
              <h3>
              <a href="#">${item.name}</a>
              </h3>
              <p id='productPrice' class="ml-1">${item.itemTotal} ₹</p>
          </div>
          <p id='categoryName' class="mt-1 text-sm  text-gray-600">${item.category}</p>
          <p class="mt-1 text-sm text-gray-500">${item.color}</p>
          ${
              item.appliedOffer
              ? `<p class="text-xs text-green-600">${item.appliedOffer} offer applied</p>`
              : ``
          }
          </div>
          <div class="flex flex-1 items-end justify-between text-sm">
          <div class="flex items-center space-x-2">
              <p class="text-gray-500 text-md">Qty</p>
              <form class="max-w-xs">
                  <div class="relative flex items-center">
                      <button type="button" id="decrement-button" data-input-counter-decrement="counter-input" data-product=${item.productId} data-product-color=${item.color} data-variant=${item.variantId} class="decrement shrink-0 bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 inline-flex items-center justify-center border border-gray-300 rounded-md h-5 w-5 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                          <svg class="w-2 h-2 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16"/>
                          </svg>
                      </button>
                      <input type="text" id="counter-input" data-input-counter class="shrink-0 text-gray-900 border-0 bg-transparent text-sm font-normal focus:outline-none focus:ring-0 max-w-[2.5rem] text-center" placeholder="" value=${item.quantity} required />
                      <button type="button" id="increment-button" data-input-counter-increment="counter-input" data-product=${item.productId} data-product-color=${item.color} data-variant=${item.variantId} class="increment shrink-0 bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 inline-flex items-center justify-center border border-gray-300 rounded-md h-5 w-5 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                          <svg class="w-2 h-2 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"/>
                          </svg>
                      </button>
                  </div>
              </form>
          </div>
      
          <div class="flex">
          <button id='remove-Button' data-variant=${item.variantId} type="button" class="remove font-medium text-indigo-600 hover:text-indigo-500">Remove</button>
          </div>
      </div>
      </div>
      </li>
      `

      productContainer.appendChild(productDiv)

      subTotalEl.textContent = `${cart.total} ₹`;
})

}


productContainer.addEventListener('click',async (e)=>{

  if(e.target.classList.contains('increment')){
    console.log('Increment clicked');
    console.log(e.target.dataset.product);
    await axios.post('/user/cart/update-quantity',{
      productId: e.target.dataset.product,
      variantId: e.target.dataset.variant,
      type: 'increment'
    })
    refreshCart();
  }

  if (e.target.classList.contains('decrement')) {
    await axios.post('/user/cart/update-quantity', {
      productId: e.target.dataset.product,
      variantId: e.target.dataset.variant,
      type: 'decrement'
    });
    refreshCart();
  }

  if (e.target.classList.contains('remove')) {
    await axios.delete(`/user/cart/${e.target.dataset.variant}`);
    refreshCart();
  }

})

async function refreshCart(){
  try {
    const res = await axios.get('/user/cart')
    if(res.data.cart){
      renderCart(res.data.cart);
      cartCountContainer.textContent = res.data.cart.cartCount;
      cartCountContainer.classList.toggle(
      'opacity-50',
      res.data.cart.cartCount === 0
  );
    }
  } catch (error) {
    console.log('Error in refreshing cart',error);
  }
}