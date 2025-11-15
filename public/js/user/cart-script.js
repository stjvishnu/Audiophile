
const cartmodal=document.getElementById('cartModal');
const cancelBtn = document.getElementById('cancelBtn');
const addToCartBtn= document.getElementById('addToCartBtn')
const productContainer = document.getElementById('productContainer')
let quantity;

cancelBtn.addEventListener('click',()=>{
  document.getElementById('cartModal').classList.add('hidden')
})

addToCartBtn?.addEventListener('click',(e)=>{
  console.log('Cll reciebegvvvhjtgyhjklm.mkjhmvg');
  e.preventDefault();
  console.log('letsssss btn',e.currentTarget);
  const productId = e.currentTarget.dataset.productId;
  const variantId = e.currentTarget.dataset.variantId;
  console.log('Hello Variantttttttttttttt',variantId);
 
  
  console.log('ProductID:',productId);
  axios.post(`/user/cart/add-to-cart?`,{
    productId,
    quantity: parseInt(quantity) || 1,
    variantId
  })
  .then((response)=>{
    const cart=response.data.cart;
    if(cart){
      showToast('success','Product Added To Cart Successfully')
    }
    console.log('Product',cart);
    productContainer.innerHTML='';
    cart.items.forEach((item)=>{
      console.log('item',item);
      const productVariant = item.productId.variants.find(variant => variant.sku===item.variantId )

      if(!productVariant){
        console.log('Could not find matching variant');
        return;
      }
      console.log(productVariant);
      console.log(item.productId.variants[0].attributes.productImages[0]);

      const imgUrl = productVariant.attributes.productImages[0];
      const color = productVariant.attributes.color;
      const price = Math.round(item.quantity * productVariant.attributes.price * 0.01*(100-productVariant.attributes.discount))
  
      let productDiv = document.createElement('div');
      productDiv.innerHTML=`
      <li class="flex py-6">
      <div class="size-24 shrink-0 overflow-hidden rounded-[2rem] border border-gray-200">
        <img src="${imgUrl}" alt="Salmon orange fabric pouch with match zipper, gray zipper pull, and adjustable hip belt." class="size-full object-cover" />
      </div>
  
      <div class="ml-4 flex flex-1 flex-col">
        <div>
          <div class="flex justify-between text-base font-medium text-gray-900">
            <h3>
              <a href="#">${item.productId.name}</a>
            </h3>
            <p id='productPrice' class="ml-4">${price} ₹</p>
          </div>
          <p class="mt-1 text-sm text-gray-500">${color}</p>
        </div>
        <div class="flex flex-1 items-end justify-between text-sm">
        <div class="flex items-center space-x-2">
            <p class="text-gray-500 text-md">Qty</p>
            <form class="max-w-xs">
                <div class="relative flex items-center">
                    <button type="button" id="decrement-button" data-input-counter-decrement="counter-input" data-product-id=${item.productId._id} data-product-color=${color} data-variant-id=${productVariant.sku} class="shrink-0 bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 inline-flex items-center justify-center border border-gray-300 rounded-md h-5 w-5 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                        <svg class="w-2 h-2 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16"/>
                        </svg>
                    </button>
                    <input type="text" id="counter-input" data-input-counter class="shrink-0 text-gray-900 border-0 bg-transparent text-sm font-normal focus:outline-none focus:ring-0 max-w-[2.5rem] text-center" placeholder="" value=${item.quantity} required />
                    <button type="button" id="increment-button" data-input-counter-increment="counter-input" data-product-id=${item.productId._id} data-product-color=${color} data-variant-id=${productVariant.sku} class="shrink-0 bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 inline-flex items-center justify-center border border-gray-300 rounded-md h-5 w-5 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                        <svg class="w-2 h-2 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"/>
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    
        <div class="flex">
          <button id='remove-Button' data-variant-id=${productVariant.sku} type="button" class="font-medium text-indigo-600 hover:text-indigo-500">Remove</button>
        </div>
    </div>
      </div>
    </li>
      `
      updateSubTotal()
      productContainer.appendChild(productDiv)
      //quantity management
      const incrementButton = productDiv.querySelector('#increment-button')
      const decrementButton = productDiv.querySelector('#decrement-button')
      const removeButton = productDiv.querySelector('#remove-Button')
      

      decrementButton.addEventListener('click',()=>{
      console.log('btn clicked');

      const targetInput=productDiv.querySelector('#counter-input');
      const productPrice=productDiv.querySelector('#productPrice');
      const productId = decrementButton.dataset.productId;
      const variantId = decrementButton.dataset.variantId;
        const variantColor = decrementButton.dataset.productColor;
        console.log(variantColor);
        console.log(productId);
      const type = 'decrement'
      
        axios.post(`/user/cart/update-quantity`,{
          productId,
          variantId,
          variantColor,
          type,
        })
        .then((response)=>{
          const updatedItem = response.data.updatedItem;
            targetInput.value=updatedItem.quantity;
            productPrice.textContent=`${updatedItem.price} ₹`;
            updateSubTotal()
          
        })
        .catch((err)=>{
          if(err.response.data.customMessage=='Product is unavailable'){
            showToast('warning','Product is not available at the moment')
             productDiv.remove();
             updateSubTotal()
          }else if(err.response.data.customMessage)
          {
            showToast('warning',err.response.data.customMessage)
          }
          
          
          console.log('Error in decreasing the quantity',err)
        })
  
    })

      incrementButton.addEventListener('click',()=>{
        // console.log(incrementButton);
        const targetInput=productDiv.querySelector('#counter-input');
        const productPrice=productDiv.querySelector('#productPrice');
        const productId = incrementButton.dataset.productId;
        const variantId = incrementButton.dataset.variantId;
        const variantColor = incrementButton.dataset.productColor;
    
        const type = 'increment'
    
          axios.post(`/user/cart/update-quantity`,{
            productId,
            variantId,
            variantColor,
            type,
          })
          .then((response)=>{
            const updatedItem = response.data.updatedItem;
            targetInput.value=updatedItem.quantity
            productPrice.textContent=`${updatedItem.price} ₹`;
            updateSubTotal()
            
          })
          .catch((err)=>{
            if(err.response.data.customMessage=='Product is unavailable'){
              showToast('warning','Product is not available at the moment')
               productDiv.remove();
               updateSubTotal()
            }else if(err.response.data.customMessage)
            {
              showToast('warning',err.response.data.customMessage)
            }
            console.log(err)
            })
        
       
      })

      removeButton.addEventListener('click',()=>{
          const variantId=removeButton.dataset.variantId;
          axios.delete(`/user/cart/${variantId}`)
          .then((response)=>{
            const message = response.data.customMessage;
            if(message){
              showToast('success',message)
            }
            productDiv.remove();
            updateSubTotal()
            const updatedCart = response.data.updatedCart;
            if(!(!!updatedCart) || updatedCart.items.length===0){
              console.log('hijkgky');
           productContainer.innerHTML = `<p class="text-center text-gray-500">Your cart is empty.</p>`;
          }
             
          })
          .catch((err)=>{
            const message = err.response.data.customMessage;
            showToast('warning',message);
            console.log('Error in deleting Item from the cart',err);
          })
      })

      async function updateSubTotal(){
        console.log('Call inside updateSubTotal');
        const response = await axios.get('/user/cart');
        const cart = response.data.cart;
        let subTotal=0
         cart.items.forEach((item)=>{
          subTotal+=item.price
        })
        console.log('From updatesubtotal',subTotal);
        document.getElementById('subTotal').textContent=(subTotal ?`${parseInt(subTotal)} ₹` : `0 ₹`);

      }
      
    })
  
    document.getElementById('cartModal').classList.remove('hidden')

  

  })
  .catch(err=>{
    console.log('Error in Cart',err)
    const message=err.response.data.customMessage;
    showToast('warning',message)
  })

  
})




