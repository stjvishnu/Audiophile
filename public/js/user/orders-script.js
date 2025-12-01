const ordersSection=document.getElementById('ordersSection')
const ordersBtn= document.getElementById('ordersBtn');
const orderDetailsSectionContainer = document.getElementById('orderDetailsSection');

let orders;


ordersBtn.addEventListener('click', async (e)=>{
  console.log('orders btn clciked');
  e.preventDefault();
  profileInfo.classList.add('hidden')
  addressPage.classList.add('hidden');
  ordersSection.classList.remove('hidden')
  try{

    const response  = await axios.get('/user/profile/orders');
    if(response.data.orders){
      const ordersContainer = ordersSection.querySelector('#ordersContainer');
      ordersContainer.innerHTML='';
      orders=response.data.orders;
      console.log(orders);
      orders.forEach((order,index)=>{
        console.log(order);
        const orderCard = document.createElement('div');
        orderCard.innerHTML=`

        <div class="rounded-2xl border border-gray-300 p-6 bg-white shadow-l hover:shadow-md transition-all">
  
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-4">
            <img 
              src="${order.items[0].productImage}"
              class="w-16 h-16 rounded-3xl object-cover border" 
            />
            <div>
              <h2 class="text-lg font-semibold text-gray-900">${order.items[0].productName}</h2>
              <p class="text-sm text-gray-500">+1 more item</p>
            </div>
          </div>
          <p class="text-xl font-semibold text-gray-900">₹ ${order.total}</p>
        </div>

        <div class="my-4 border-t border-gray-200"></div>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">
              Order Id <span class="font-semibold text-gray-900">#${order.orderNumber}</span>
            </p>
            <p class="text-sm text-gray-600 mt-1">Ordered on: 4 Nov 2025</p>
          </div>

          <div class="flex flex-col items-end gap-2">
            <span class="px-4 py-1 bg-black text-white text-sm font-medium rounded-full">${order.orderStatus}</span>
            <button onclick="viewDetails('${order._id}')"  class="text-sm text-gray-700 font-medium underline-offset-2 hover:underline">
              View Details
            </button>
          </div>
        </div>

      </div>
        `
     ordersContainer.prepend(orderCard)
      })

      
    }

    
    
    
  }catch(error){

  }

  
})

async function viewDetails(orderId){
  console.log(orderId);
  try{
    const order = orders.find((o)=>o._id.toString()===orderId);

    

    const orderDetailsContainer = orderDetailsSectionContainer.querySelector('.orderDetails')

    orderDetailsContainer.innerHTML='';

    order.items.forEach((item)=>{

    
    const orderCard = document.createElement('div');
    orderCard.innerHTML=`
      <div class="bg-white border-2 border-black rounded-3xl p-8 text-shadow-black">
      <div class="flex items-start justify-between">
          <div class="flex-1">
              <h2 class="text-xl text-black font-bold mb-2">${item.productName}</h2>
              <p class="text-gray-700 mb-3">Premium sound quality with noise cancellation.</p>
              <p class="text-gray-700 mb-1">color : ${item.productColor}</p>
              <p class="text-gray-700">category : ${item.categoryName || ''}</p>
              <p class="text-gray-700 mt-3">orderId: #${order.orderNumber } </p>
          </div>
          <div class="flex flex-col items-end gap-4">
              <img src="${item.productImage}"
                  alt="${item.productName}"
                  class="w-28 h-28 rounded-2xl bg-white object-cover">
              <p class="text-gray-600 font-semibold">Qty : ${item.quantity}</p>
          </div>
      </div>
    </div>
    `
    orderDetailsContainer.appendChild(orderCard)
  })

  const orderDetails = document.createElement('div')
  orderDetails.innerHTML = `
  <!-- GRID OF DETAILS -->
  <div class="grid grid-cols-3 gap-6">

      <!-- SHIPPING DETAILS -->
      <div class="bg-white border-2 border-black text-black rounded-2xl p-6">
          <h3 class="text-lg font-bold mb-4">Shipping Details</h3>
          <p class="text-sm text-gray-800 leading-relaxed">
              ${order.shippingAddress.fullName}<br>
              ${order.shippingAddress.houseName}<br>
              ${order.shippingAddress.city}<br>
              ${order.shippingAddress.locality}<br>
              ${order.shippingAddress.state}, ${order.shippingAddress.pincode}<br>
              Phone number: ${order.shippingAddress.mobile}<br>
              ${order.shippingAddress.landmark}<br>
          </p>
      </div>

      <!-- PAYMENT METHODS -->
      <div class="grid grid-row-2 bg-white rounded-2xl gap-3">
        <div class="border-2 border-black  rounded-2xl p-4" >
        <h3 class="text-lg text-black font-bold mb-4 ">Payment Method</h3>
          <ul class="space-y-2">
              <li class="text-sm text-gray-800 flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-black rounded-full"></span>
                  ${order.payment.method}<br>
              </li>
          </ul>
        </div>
        <div class="border-2 border-black rounded-2xl p-4">
        <h3 class="text-lg text-black font-bold mb-4 text-center">Status</h3>
          <div id="statusContainer" class="flex justify-center gap-10 p-2">


      ${
      order.orderStatus === 'cancelled'
        ? `
          <button class="px-8 py-1 text-sm font-semibold rounded-lg text-white bg-red-500" disabled>
            Cancelled
          </button>
        `
        : order.orderStatus === 'returned'
        ? `
          <button class="px-8 py-1 text-sm font-semibold rounded-lg text-white bg-red-500" disabled>
            Returned
          </button>
        `
        : `
          <button class="px-5 py-1 text-sm font-semibold rounded-lg 
                  ${order.orderStatus === 'delivered' ? 'bg-green-500' : 'bg-gray-200'}
                  text-black">
            ${order.orderStatus}
          </button>

          <button onclick="orderReturnCancel('${order._id}', '${order.orderStatus === 'delivered' ? 'return' : 'cancel'}')"
            class="px-5 py-1 text-sm font-semibold rounded-lg text-white 
                  ${order.orderStatus === 'delivered' ? 'bg-red-400' : 'bg-red-500'}">
            ${order.orderStatus === 'delivered' ? 'Return' : 'Cancel'}
          </button>
        `
        }

          </div>
        </div>
          
      </div>

      <!-- ORDER SUMMARY -->
      <div class="bg-white border-2 border-black  rounded-2xl p-6">
          <h3 class="text-lg text-black font-bold mb-4">Order Summary</h3>

          <div class="space-y-3">
              <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Subtotal</span>
                  <span class="text-gray-900 font-medium">₹${order.subTotal}<br></span>
              </div>
              <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Discount</span>
                  <span class="text-red-600 font-medium">${order.discount}</span>
              </div>
              <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Delivery Fee</span>
                  <span class="text-gray-900 font-medium">₹40</span>
              </div>
              <div class="border-t border-gray-300 pt-3 flex justify-between">
                  <span class="text-lg text-black font-bold">Total</span>
                  <span class="text-lg text-black font-bold">₹${order.total}</span>
              </div>
          </div>
      </div>

  </div>
  `
  orderDetailsContainer.appendChild(orderDetails)

  const hideButton = document.createElement('div')
  hideButton.innerHTML=`
  <!-- BUTTON -->
  <div class="flex justify-center gap-8 mt-8">
      <button onclick="hideOrderDetails()"
              class="bg-black text-white px-5 py-2 rounded-[2rem] text-sm font-semibold hover:bg-gray-900 hover:scale-105 transition-all">
          Hide Details
      </button>

      <button onclick="downloadInvoice('${order._id}')"
      class="bg-black text-white px-5 py-2 rounded-[2rem] text-sm font-semibold hover:bg-gray-900 hover:scale-105 transition-all">
      <i class="fa-solid fa-file-lines" style="color: #ffffff;"></i> <span class="ml-1 font-semibold text-white">invoice</span>
     </button>

  </div>
  `

  orderDetailsContainer.appendChild(hideButton)
    
  profileInfo.classList.add('hidden')
  addressPage.classList.add('hidden');
  ordersSection.classList.add('hidden')
  orderDetailsSectionContainer.classList.remove('hidden')
  const modal = orderDetailsSectionContainer.querySelector('#return-cancelModal')
  modal.querySelector('#submitBtn').dataset.orderId=`${order._id}`
  }catch(error)
  { 
    orderDetailsSectionContainer.classList.add('hidden');
    ordersSection.classList.remove('hidden')
    console.log(error);
  }
}

function hideOrderDetails(){
  orderDetailsSectionContainer.classList.add('hidden');
    ordersSection.classList.remove('hidden')
}

function closeModal(){
  document.getElementById('return-cancelModal').classList.add('hidden')
  document.body.style.overflow=''
}


async function orderReturnCancel(orderId,action){
  console.log('call recieved at orderReturnCancel');
  try {
    const result=await sweetAlert('error','Are you sure ?',`You want to ${action} the order`,true,true)
    if(result.isConfirmed){
     const modal= document.getElementById('return-cancelModal')
     modal.classList.remove('hidden')
      document.body.style.overflow='hidden';

            const submitBtn = document.getElementById('submitBtn')
            submitBtn.addEventListener('click',async (e)=>{
            e.preventDefault();
            try{
              const modal= document.getElementById('return-cancelModal');
              const orderId=modal.querySelector('#submitBtn').dataset.orderId
              const text = modal.querySelector('textarea').value.trim();
              if(!text){
                showToast('error','Please enter the reason');
                return
              }

              console.log('User typed',text);
              console.log('OrderId',orderId)

              const response = await axios.post(`/user/orders/${action}`,{orderId,reason:text})
              const message= response.data.customMessage;
              const orderDetailsContainer = orderDetailsSectionContainer.querySelector('.orderDetails')
              const statusContainer =  orderDetailsContainer.querySelector('#statusContainer');
              statusContainer.innerHTML=''
              statusContainer.innerHTML=`
              <button class="px-8 py-1 text-sm font-semibold rounded-lg text-white bg-red-500" disabled>
              Cancelled
              </button>
              `
              if(message) showToast('success',message)
              modal.querySelector('textarea').value=''
            }catch(error){
              console.log('Error in cancel,return request'),error;
              const message= response.error.data.customMessage;
              if(message) showToast('success',message)
            }
          })
      
      
    }
    
  } catch (error) {
    const modal= document.getElementById('return-cancelModal')
     modal.classList.add('hidden')
     document.body.style.overflow='';

  }
}

async function downloadInvoice(orderId){
  console.log('Call recieved inside download Invoice');
  try {
    document.getElementById('loader').classList.remove('hidden')
    document.body.style.overflow = 'hidden';
    console.log('orderId',orderId);
    const response = await axios.get(`/user/orders/download-invoice/${orderId}`,{responseType:'blob'});
    const blob = new Blob([response.data],{type:'application/pdf'});
    const url = window.URL.createObjectURL(blob);

    const contentDisposition = response.headers['content-disposition'];
    let filename = `invoice.pdf`;

    if (contentDisposition) {
      // Simple regex to extract the filename from the header
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch.length === 2) {
          filename = filenameMatch[1];
      }
    }

    const link = document.createElement('a');
    link.href=url;
    link.setAttribute('download',filename)
    document.body.appendChild(link);
    link.click()
    setTimeout(()=>{
      document.getElementById('loader').classList.add('hidden')
    document.body.style.overflow = '';
    },300)
    
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link)

    console.log("Download successfully triggered.");
  } catch (error) {
    console.log('error in download invoice',error);
  }
}

