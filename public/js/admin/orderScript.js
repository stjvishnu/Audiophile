console.log('Script loaded');

async function orderDetails(orderId){
  console.log('Yes call recived st orderDetsils');
  try {
    window.location.href=`/admin/orders/${orderId}`;
    
  } catch (error) {
    
  }
}
//------------- filter Management ------------//
let filterMode = false;
const paymentFilter =  document.getElementById('paymentFilter')
const statusFilter = document.getElementById('statusFilter')
paymentFilter.addEventListener('click', async()=>{
  if(paymentFilter.value.trim()!== ''){
    filterMode = true;
    loadFilter()
  }
})
statusFilter.addEventListener('click', async()=>{
  if(statusFilter.value.trim()!== ''){
    filterMode = true;
    loadFilter()
  }
})

async function loadFilter(pageNumber=1){
  console.log('hello peter');
  try {
    const paymentMethod= paymentFilter.value;
    const orderStatus =  statusFilter.value;
    searchTerm = document.getElementById('searchInput').value.trim();
    const response = await fetch(`/admin/orders/filter?paymentMethod=${paymentMethod}&orderStatus=${orderStatus}&page=${pageNumber}&searchTerm=${searchTerm}`);
    const data = await response.json()
    const orders = data.orders
    renderOrdersDesktop(orders);
    renderOrdersMobile(orders);
  } catch (error) {
    
  }
}


//------------- Search Management ------------//


let searchMode=false; //variable for managing pagination state
const searchInput= document.getElementById('searchInput');
console.log('searchInput:', searchInput);


/**
* Debounce utility to limit function execution
* @param {Function} fn
* @param {number} wait
* @returns {Function}
*/

  function debounce(fn,wait){
   let timerId=null;
   return function(...args){
     clearTimeout(timerId);
     timerId=setTimeout(()=>{
       fn.apply(this, args)
     },wait)
   }
  }

  searchInput.addEventListener('input',debounce(handleSearch,500))
  
  let previousOrders = [];
  
   /**
   * Loads all categories initially for fallback rendering
   */

   async function loadOrders() {
     
     const res = await fetch('/admin/orders/loadOrders');
     const data = await res.json();
     previousOrders = data.orders;
     console.log('previousOrders',previousOrders);
   }
   loadOrders();

    /**
    * Handles live search logic
    */
   let searchTerm;
    async function handleSearch(){
     try {
       searchMode=true;
       console.log('search INputvalue',searchInput.value);

       if(searchInput.value.trim()===''){
         searchMode=false;
       }
       
       searchTerm = document.getElementById('searchInput').value.trim();
       const ordersContainer=document.getElementById('ordersContainer');
       const ordersContainerMobile = document.getElementById('ordersContainerMobile');

       ordersContainer.innerHTML = '<div class="text-center py-8" > Searching... </div> '
       ordersContainerMobile.innerHTML = '<div class="text-center py-8" > Searching... </div> '

       if (searchTerm === '') {
        renderOrdersDesktop(previousOrders);
        renderOrdersMobile(previousOrders);

         return;
       }
       console.log('search term',searchTerm);
       // Remove special characters that may break backend
       if(/[*%$?\\]/.test(searchTerm)){ 
         searchTerm=searchTerm.replaceAll(/[*%$?\\]/g,'').trim()
       }
       
       const response = await fetch(`/admin/orders/search?searchTerm=${encodeURIComponent(searchTerm)}`);

       if (!response.ok) throw new Error('Search Failed')
   
       const data = await response.json();
       const orders = data.orders;
       console.log('Trouble orders',orders);
       renderOrdersDesktop(orders);
       renderOrdersMobile(orders);

     } catch (error) {
       console.log('Error in get handleSearch', error);
       ordersContainer.innerHTML = '<div class="text-center py-8 text-red-500" > Error Loading Results </div>'
       ordersContainerMobile.innerHTML = '<div class="text-center py-8 text-red-500" > Error Loading Results </div>'
     }
    }

/**
* Handles pagination
* @param {String} pageNumber
*/

async function loadURL(pageNumber){
 try {
   console.log('Search term in loadUrl Orders',searchTerm);
   const response = await fetch(`/admin/orders/search?searchTerm=${encodeURIComponent(searchTerm)}&page=${pageNumber}`);
   const data = await response.json();
   const orders = data.orders;
   renderOrdersDesktop(orders);
   renderOrdersMobile(orders);
 } catch (error) {
   console.log('Error in loadURL',error);
 }
}


/**
* Renders category list dynamically
* @param {Array} categories
*/

async function renderOrdersDesktop(orders){
 try {
  const ordersContainer = document.getElementById('ordersContainer');
  
  if(!orders || orders.length==0){
    
      ordersContainer.innerHTML = '<div class="text-center py-8 text-gray-400">No Order found</div>';

   return
  }
  
  
    ordersContainer.innerHTML='';


   orders.forEach((order,index)=>{
   
      const orderRow = document.createElement('tr');
    

      orderRow.style.animation = `slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${index * 0.1}s`;

      orderRow.innerHTML = `
   
      <tr class="border-b border-gray-800 hover:bg-[#222] transition"
      style="animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay:${index * 0.1} s; opacity:0;">

    <td class="px-4 sm:px-6 py-4">${index+1}</td>

    <td class="px-4 sm:px-6 py-4 font-semibold">${order?.orderNumber}</td>

    <td class="px-4 sm:px-6 py-4"> ${order?.user?.firstName || order?.userId?.firstName}</td>

    <td class="px-4 sm:px-6 py-4 text-gray-300">
      ${new Date(order.createdAt).toLocaleDateString('en-IN') }
    </td>

    <td class="px-4 sm:px-6 py-4">₹ ${order?.total}</td>

    <td class="px-4 sm:px-6 py-4">
      <span class="bg-gray-100 text-black px-3 py-1 rounded-full text-xs">
        ${order?.payment.method}
      </span>
    </td>

    <td class="px-4 sm:px-6 py-4">
      <span class="bg-gray-100 text-black px-3 py-1 rounded-full text-xs">
        ${order?.orderStatus}
      </span>
    </td>

    <td class="px-4 sm:px-6 py-4">
      <button onclick="orderDetails('${order?._id }')" 
        class="px-3 py-1 bg-white text-black rounded-lg text-xs font-semibold hover:bg-gray-200 transition">
        View
      </button>
    </td>

  </tr>
   `;

   ordersContainer.appendChild(orderRow)
  })
 } catch (error) {
   console.log('Error in rendering categories',error);
 }
}


async function renderOrdersMobile(orders){
  try {
   const ordersContainerMobile = document.getElementById('ordersContainerMobile');
   
   if(!orders || orders.length==0){
     
    ordersContainerMobile.innerHTML = '<div class="text-center py-8 text-gray-400">No Order found</div>';
 
    return
   }
   
   
   ordersContainerMobile.innerHTML='';
 
 
    orders.forEach((order,index)=>{
    
       const orderRow = document.createElement('div');
     
      orderRow.className="bg-black border border-white/30 rounded-xl p-4 space-y-3 transform transition-all duration-500 hover:scale-[1.01]"
       orderRow.style.animation = `slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${index * 0.1}s`;
 
       orderRow.innerHTML = `
    
       <div class="flex justify-between items-center text-gray-300 text-sm">
          <span>#${index+1}</span>
          <span>${new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
        </div>

        <div class="text-lg font-semibold text-white">
          Order: ${order?.orderNumber }
        </div>

        <div class="text-gray-400">
          User: <span class="text-white">${order?.user?.firstName || order?.userId?.firstName}</span>
        </div>

        <div class="text-gray-400">
          Amount:
          <span class="text-white font-semibold">₹ ${order?.total}</span>
        </div>

        <div class="flex items-center gap-2 mt-1">
          <span class="px-3 py-1 bg-gray-100 text-black rounded-xl text-xs">
            ${order?.payment.method }
          </span>

          <span class="px-3 py-1 bg-gray-100 text-black rounded-xl text-xs">
            ${order?.orderStatus}
          </span>
        </div>

        <button onclick="orderDetails('${order?._id }')"
          class="w-full bg-white text-black py-2 rounded-lg font-semibold mt-2">
          View Details
        </button>

    `;
 
    ordersContainerMobile.appendChild(orderRow)
   })
  } catch (error) {
    console.log('Error in rendering categories',error);
  }
 }