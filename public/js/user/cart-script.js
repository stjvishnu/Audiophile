
const cartmodal=document.getElementById('cartModal');
const cancelBtn = document.getElementById('cancelBtn')
const addToCartBtn= document.getElementById('addToCartBtn')
const productContainer = document.getElementById('productContainer')


cancelBtn.addEventListener('click',()=>{
  document.getElementById('cartModal').classList.add('hidden')
})

addToCartBtn.addEventListener('click',(e)=>{
  e.preventDefault();
  const productId = e.currentTarget.dataset.productId;
  console.log(productId);
  axios.post(`/user/cart/add-to-cart?productId=${productId}`)
  .then((response)=>{
    const product=response.data.product;
    console.log(product);
    productContainer.innerHTML='';
    const productDiv = document.createElement('div');
    productDiv.innerHTML=`
    <li class="flex py-6">
    <div class="size-24 shrink-0 overflow-hidden rounded-[2rem] border border-gray-200">
      <img src="${product.variants[0].attributes.productImages[0]}" alt="Salmon orange fabric pouch with match zipper, gray zipper pull, and adjustable hip belt." class="size-full object-cover" />
    </div>

    <div class="ml-4 flex flex-1 flex-col">
      <div>
        <div class="flex justify-between text-base font-medium text-gray-900">
          <h3>
            <a href="#">${product.name}</a>
          </h3>
          <p class="ml-4">${product.variants[0].attributes.price} ₹</p>
        </div>
        <p class="mt-1 text-sm text-gray-500">${product.variants[0].attributes.color}</p>
      </div>
      <div class="flex flex-1 items-end justify-between text-sm">
      <div class="flex items-center space-x-2">
          <p class="text-gray-500 text-md">Qty</p>
          <form class="max-w-xs">
              <div class="relative flex items-center">
                  <button type="button" id="decrement-button" data-input-counter-decrement="counter-input" class="shrink-0 bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 inline-flex items-center justify-center border border-gray-300 rounded-md h-5 w-5 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                      <svg class="w-2 h-2 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16"/>
                      </svg>
                  </button>
                  <input type="text" id="counter-input" data-input-counter class="shrink-0 text-gray-900 border-0 bg-transparent text-sm font-normal focus:outline-none focus:ring-0 max-w-[2.5rem] text-center" placeholder="" value="1" required />
                  <button type="button" id="increment-button" data-input-counter-increment="counter-input" class="shrink-0 bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 inline-flex items-center justify-center border border-gray-300 rounded-md h-5 w-5 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                      <svg class="w-2 h-2 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"/>
                      </svg>
                  </button>
              </div>
          </form>
      </div>
  
      <div class="flex">
        <button type="button" class="font-medium text-indigo-600 hover:text-indigo-500">Remove</button>
      </div>
  </div>
    </div>
  </li>
    `

    productContainer.appendChild(productDiv)
    console.log('1');
    document.getElementById('cartModal').classList.remove('hidden')

    //quantity management

  console.log(document.getElementById('increment-button'))
  console.log('2');
  const incrementButton = document.querySelector('#increment-button')
  console.log(incrementButton);
  const decrementButton = document.querySelector('#decrement-button')
  console.log(decrementButton)
  

  decrementButton.addEventListener('click',()=>{
    const target = decrementButton.closest('div')
    const targetInput=target.querySelector('#counter-input');
    console.log(targetInput);
    console.log(targetInput.value)
  
    })


  })
})




