async function renderCart(cart){
  try {
    const cartItemsList = document.getElementById('cartItemsList');

    cart?.items.forEach((item)=>{
      cartItemsList.innerHTML='';
      const div = document.createElement(div);
      div.innerHTML=`
      <li  class="flex py-6">
      <div  class="size-20 shrink-0 overflow-hidden rounded-[2rem] border border-gray-200">
        <img src="${item.imgUrl }"
             alt="${item.name }"
             class="size-full object-cover" />
      </div>

      <div class="ml-4 flex flex-1 flex-col">
        <div>
          <div class="flex justify-between text-base font-medium text-gray-900">
            <h3>
              <a href="#" class="text-md">${item.name }</a>
            </h3>
            <p  class="item-price ml-4 text-sm">₹${item.itemTotal }</p>
          </div>

          <p class="mt-1 text-sm text-gray-500">${item.color }</p>
        </div>

        <div class="flex flex-1 items-end justify-between text-sm">
          <div class="flex items-center space-x-2">
            <p class="text-gray-500 text-md">Qty</p>
            
            <form class="max-w-xs">
              <div class="relative flex items-center">
                <button type="button" onclick="decrementItem(this)"

                        data-input-counter-decrement="counter-input-${item.productId }"
                        data-product="${item.productId }"
                        data-product-color="${item.color }"
                        data-variant="${item.variantId }"
                        class="decBtn shrink-0 bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 inline-flex items-center justify-center border border-gray-300 rounded-md h-5 w-5 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                  <svg class="w-2 h-2 text-gray-900 dark:text-white" aria-hidden="true"
                       xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M1 1h16" />
                  </svg>
                </button>

                <input type="text"
                       
                       data-input-counter
                       class="qtyInput shrink-0 text-gray-900 border-0 bg-transparent text-sm font-normal focus:outline-none focus:ring-0 max-w-[2.5rem] text-center"
                       value="${item.quantity }"
                       readonly />

                <button type="button" onclick="incrementItem(this)"
                      
                        data-input-counter-increment="counter-input-${item.productId }"
                        data-product="${item.productId}"
                        data-product-color="${item.color }"
                        data-variant="${item.variantId }"
                        class="incBtn shrink-0 bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 inline-flex items-center justify-center border border-gray-300 rounded-md h-5 w-5 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                  <svg class="w-2 h-2 text-gray-900 dark:text-white"
                       xmlns="http://www.w3.org/2000/svg" fill="none"
                       viewBox="0 0 18 18">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 1v16M1 9h16" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          <div class="flex">
            <button 
                    onclick="removeItem(this)"
                    data-variant="${item.variantId }"
                    type="button"
                    class="removeBtn  font-medium text-indigo-600 hover:text-indigo-500">
              Remove
            </button>
          </div>
        </div>
      </div>
    </li>

      `
      cartItemsList.appendChild(div)
    })

  } catch (error) {
    console.log('Error in rendering cart',error);
  }
}


let appliedCouponCode = null;


async function applyCoupon(){
  console.log('call inside apply couponss');
  try {
    const couponCode =document.getElementById('couponCode').value;
    console.log('coupon code', couponCode);
    const total = document.getElementById('totalAmount').value;

    if(!couponCode && !appliedCouponCode) {
      console.log('hello');
      return
    }

    if(!couponCode){
      showToast('error','Invalid Coupon')
      return
    }

    const response = await axios.post('/user/checkout/apply-coupon',{couponCode,total})
    console.log('response cart ',response?.data?.cart);
    if(response?.data?.customMessage){
      const message = response?.data?.customMessage;
      const cart = response?.data?.cart;
      appliedCouponCode=couponCode;
      renderCheckoutCart(cart)
      showToast('success',message)
    }

  } catch (error) {
    console.log('Error in apply coupon',error);
    const message = error?.response?.data?.customMessage||'Something went wrong';
    if(message) showToast('error',message)

  }
}

async function removeCoupon(){
  try {
    refreshCheckoutCart();
    document.getElementById('couponCode').value=''
  } catch (error) {
    console.log('Error in removing coupon',error);
  }
}


async function getCoupons(){
  try {
    const response = await axios.get('/user/coupons')
    if(response.data.coupons){
      renderCoupons(response.data.coupons)
    }
  } catch (error) {
    console.log('Error in getting Coupons',error);
  }
}

async function renderCoupons(coupons){
  if( coupons.length<0) return
  const couponContainer = document.getElementById('couponContainer');
  console.log('couponContainer',couponContainer);
  
  if(couponContainer) couponContainer.innerHTML='';
  
   if (coupons && coupons.length > 0) { 
    coupons.forEach((coupon)=>{
    const div = document.createElement('div')
    div.innerHTML=`
        <div class="bg-transparent border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between">

          <!-- Left block: Description + Discount -->
          <div class="flex items-center gap-4 min-w-0">
            <p class="text-gray-900 font-semibold min-w-[170px]">
               ${coupon.description}
            </p>
        
            <span class="text-sm font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full whitespace-nowrap">
              OFF  ${coupon.discountValue}  ${coupon.discountType === 'percentage' ? '%' : '₹' }
            </span>
          </div>
        
          <!-- Right: Coupon Code -->
          <button
          class="bg-black text-white text-sm font-mono
                 min-w-[210px] px-4 py-2
                 rounded-lg hover:bg-gray-900 transition
                 flex items-center justify-between gap-2 whitespace-nowrap"
          onclick="navigator.clipboard.writeText('${coupon.code}')"
        >
          <span>${coupon.code}</span>
          <span class="text-xs opacity-70">COPY</span>
        </button>
        
        
        </div>
        `
        if(couponContainer)  couponContainer.appendChild(div)
       }) 
    
  } else { 
    const p = document.createElement('p')
    p.className = "text-gray-500 text-sm"
    p.innerHTML=`No coupons available at the moment.`
    if(couponContainer)couponContainer.appendChild(p)
   } 
  

}