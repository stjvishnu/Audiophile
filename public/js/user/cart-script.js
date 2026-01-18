
const cartmodal=document.getElementById('cartModal');
const cartCountContainer = document.getElementById('cartCountContainer')
const mobcartCountContainer = document.getElementById('mobcartCountContainer')
const cancelBtn = document.getElementById('cancelBtn');
const addToCartBtn= document.querySelectorAll('.addToCartBtn')
const productContainer = document.getElementById('productContainer')
const subTotalEl         = document.getElementById('subTotal');
const discountEl = document.getElementById('discount')
const totalEl = document.getElementById('total')

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
        if(mobcartCountContainer){
          mobcartCountContainer.innerText=cartCount;
          mobcartCountContainer.classList.remove('opacity-50')
        }
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
    subTotalEl.textContent = `₹ 0`
    totalEl.textContent= `₹ 0`
    totalEl.textContent= `₹ 0`
    discountEl.textContent= `₹ 0`
    document.getElementById('loader').classList.add('hidden')
    document.body.style.overflow = '';
    document.getElementById('cartModal').classList.remove('hidden')
      return
  }

      cart.items.forEach((item)=>{
      console.log('item',item);
      
  
      let productDiv = document.createElement('div');
      productDiv.innerHTML=`
      <li class="flex py-4 sm:py-6">
  <!-- Product Image -->
  <div class="size-20 sm:size-24 shrink-0 overflow-hidden rounded-[2rem] border border-gray-200">
    <img src="${item.imgUrl}" 
         alt="${item.name}" 
         class="size-full object-cover" />
  </div>

  <!-- Product Details -->
  <div class="ml-3 sm:ml-4 flex flex-1 flex-col min-w-0">
    <div class="flex-1">
      <!-- Product Info and Price Row -->
      <div class="flex justify-between gap-3 mb-2">
        <!-- Left: Product Info -->
        <div class="flex-1 min-w-0">
          <h3 class="text-sm sm:text-base font-medium text-gray-900 line-clamp-2 mb-1">
            <a href="#">${item.name}</a>
          </h3>
          
          <div class="flex flex-wrap gap-x-3 gap-y-0.5 text-xs sm:text-sm text-gray-500">
            <p id='categoryName'>${item.category.toUpperCase()}</p>
            <p>${item.color.toUpperCase()}</p>
          </div>
          
          ${item.appliedOffer ? `
            <p class="text-[10px] sm:text-xs text-gray-400 mt-1 flex items-center gap-1">
              <i class="fas fa-gift text-black"></i>
              <span>${item.appliedOffer.toUpperCase()} OFFER APPLIED</span>
            </p>
          ` : ''}
        </div>

        <!-- Right: Price Info -->
        <div class="flex flex-col items-end shrink-0 text-right">
          <p class="text-xs sm:text-sm text-gray-400 line-through">₹ ${item.currentPrice}</p>
          <p class="text-xs sm:text-sm text-green-600 font-medium">-₹ ${item.discount}</p>
          <p id='productPrice' class="text-sm sm:text-base font-semibold text-gray-900 mt-0.5">₹ ${item.itemTotal}</p>
        </div>
      </div>

      <!-- Quantity and Remove Row -->
      <div class="flex items-center justify-between mt-1 sm:mt-2 gap-3">
        <!-- Quantity Controls -->
        <div class="flex items-center gap-2">
          <span class="text-xs sm:text-sm text-gray-500 shrink-0">Qty</span>
          
          <div class="flex items-center gap-1.5">
            <button type="button" 
                    id="decrement-button" 
                    data-input-counter-decrement="counter-input" 
                    data-product="${item.productId}" 
                    data-product-color="${item.color}" 
                    data-variant="${item.variantId}"
                    class="decrement shrink-0 bg-black hover:bg-gray-700 inline-flex items-center justify-center border border-gray-300 rounded-md h-4 w-4 sm:h-5.5 sm:w-5.5">
              <svg class="w-1 h-1 sm:w-2 sm:h-2 text-white" fill="none" viewBox="0 0 18 2">
                <path stroke="currentColor" stroke-width="2" d="M1 1h16" />
              </svg>
            </button>

            <input type="text"
                   id="counter-input"
                   data-input-counter
                   class="shrink-0 text-gray-900 border-0 bg-transparent text-sm sm:text-base font-normal focus:outline-none focus:ring-0 w-8 sm:w-10 text-center"
                   value="${item.quantity}"
                   readonly />

            <button type="button" 
                    id="increment-button" 
                    data-input-counter-increment="counter-input" 
                    data-product="${item.productId}" 
                    data-product-color="${item.color}" 
                    data-variant="${item.variantId}"
                    class="increment shrink-0 bg-black hover:bg-gray-700 inline-flex items-center justify-center border border-gray-300 rounded-md h-4 w-4 sm:h-5.5 sm:w-5.5">
              <svg class="w-1 h-1 sm:w-2 sm:h-2 text-white" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" stroke-width="2" d="M9 1v16M1 9h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Remove Button -->
        <button 
                id='remove-Button'
                data-variant="${item.variantId}"
                type="button"
                class="remove flex items-center gap-1.5 font-medium text-gray-700 hover:text-red-600 transition-colors text-xs sm:text-sm shrink-0">
          <i class="fa-regular fa-trash-can"></i>
          <span class="hidden xs:inline sm:inline">Remove</span>
        </button>
      </div>
    </div>
  </div>
</li>
      `

      productContainer.appendChild(productDiv)

      subTotalEl.textContent = `₹ ${cart.total} `;
      discountEl.textContent = `-₹ ${cart.totalDiscount} `;
      totalEl.textContent = `₹ ${cart.total} `;
})
  document.getElementById('loader').classList.add('hidden')
  document.body.style.overflow = '';

}


productContainer.addEventListener('click',async (e)=>{
  const btn = e.target.closest('button');
  if(btn.classList.contains('increment')){
    try {
      console.log('Increment clicked');
      console.log(btn.dataset.product);
    const response =  await axios.post('/user/cart/update-quantity',{
        productId: btn.dataset.product,
        variantId: btn.dataset.variant,
        type: 'increment'
      })
      console.log('response',response);
      refreshCart();
    } catch (error) {
      console.log('error in increasing prorduct quantity',error);
      const message = error.response.data.customMessage;
      if(message) showToast('error',message)
      
    }
   
  }

  if (btn.classList.contains('decrement')) {
    try {
      document.getElementById('loader').classList.remove('hidden')
      document.body.style.overflow = 'hidden';
      const response = await axios.post('/user/cart/update-quantity', {
        productId: btn.dataset.product,
        variantId: btn.dataset.variant,
        type: 'decrement'
      });
      refreshCart();
    } catch (error) {
      document.getElementById('loader').classList.add('hidden')
      document.body.style.overflow = '';
      console.log('error in increasing prorduct quantity',error);
      const message = error.response.data.customMessage;
      if(message) showToast('error',message)
    }
    
  }

  if (btn.classList.contains('remove')) {
    try {
      document.getElementById('loader').classList.remove('hidden')
      document.body.style.overflow = 'hidden';
     const response  = await axios.delete(`/user/cart/${btn.dataset.variant}`);
    refreshCart();
    } catch (error) {
      document.getElementById('loader').classList.add('hidden')
      document.body.style.overflow = '';
      const message = error.response.data.customMessage;
      if(message) showToast('error',message)
    }
    
  }

})

async function refreshCart(){
  try {
    let mobcartCountContainer = document.getElementById('mobcartCountContainer')
    document.getElementById('loader').classList.remove('hidden')
    document.body.style.overflow = 'hidden';
    const res = await axios.get('/user/cart')
    if(res.data.cart){
      renderCart(res.data.cart);
      cartCountContainer.textContent = res.data.cart.cartCount;
      mobcartCountContainer.textContent = res.data.cart.cartCount;
      console.log('hello cart count in removal',cartCountContainer);

      console.log('hello cart count in removal',res.data.cart.cartCount);
      const cartCount = res.data.cart.cartCount || res.data.cart.items.length;
  cartCountContainer.textContent = cartCount;
  mobcartCountContainer.textContent = cartCount;
  if (cartCount === 0) {
    console.log('HIt 1');
    cartCountContainer.classList.add('opacity-50');
    mobcartCountContainer.classList.add('opacity-50');
    
  } else {
    console.log('hit 2');
    cartCountContainer.classList.remove('opacity-50');
    mobcartCountContainer.classList.remove('opacity-50');
    console.log('cartCountContainer',cartCountContainer);
  }
    }
  } catch (error) {
    document.getElementById('loader').classList.add('hidden')
    document.body.style.overflow = '';
    console.log('Error in refreshing cart',error);
  }
}


const cartModal = document.getElementById('cartModal');
console.log('1');
const cartOverlay = document.getElementById('cartOverlay');
cartPanel.addEventListener('click', (e) => {
  e.stopPropagation();
});

cartOverlay.addEventListener('click',()=>{
  console.log('gdvv hello');
  cartModal.classList.add('hidden');
})