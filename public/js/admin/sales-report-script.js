const salesCountContainer = document.getElementById('salesCount')
const orderAmountContainer = document.getElementById('orderAmount')
const discountAmountContainer =document.getElementById('discountAmount')

const selectInput = document.getElementById('selection')

const startDateInput = document.getElementById('startDate')
const endDateInput = document.getElementById('endDate')

const startPicker = flatpickr("#startDate", {
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  allowInput: false,
  defaultHour: 0,
  defaultMinute: 0,
  maxDate: "today",
  onChange:(selectedDates,dateStr)=>{
    endPicker.set('minDate',dateStr)
    startDateInput.setAttribute("data-value", dateStr);
  }
});

const endPicker = flatpickr("#endDate", {
  dateFormat: "Y-m-d H:i",
  enableTime: true,
  allowInput: true,
  defaultHour: 23,
  defaultMinute: 59,
  onChange:(selectedDates,dateStr)=>{
   
    endDateInput.setAttribute("data-value", dateStr);
    endPicker.set('minDate',dateStr)
  }
});
let filter;
let range;
searchMode=false;
filterMode=false;
document.getElementById('applyBtn').addEventListener('click',async (e)=>{
  e.preventDefault();
  filterMode=true;
  console.log(endDateInput.dataset.value);
  
  console.log('inside submission');
  const filterType=selectInput.value;
  console.log(filterType);

  if(filterType === 'Custom'){
    const start = startDateInput.dataset.value;
    const end = endDateInput.dataset.value
    if(!start || !end) showToast('error','Both start and end date required !')
    filter = 'custom';
   range = {start,end}
  console.log('filter check',filter);
  }
  if(!filterType) showToast('error','Please select the Range filter')
  if(filterType!='Custom')  filter=filterType.toLowerCase()


  const response = await fetch('/admin/sales-report',
                  {
                    method:'POST',
                    headers:{"Content-Type": "application/json"},
                    body:JSON.stringify({filter,range:range||''})
                  })
  const data = await response.json();
  if(data.orders.length>0){
    console.log(data.orders);

    const orders = data.orders;
    const salesCount = data.salesCount;
    const orderAmount = data.orderAmount;
    const discountAmount = data.discountAmount;

    renderOrdersDesktop(orders,salesCount,orderAmount,discountAmount)
    renderOrdersTablet(orders,salesCount,orderAmount,discountAmount)
    renderOrdersMobile(orders,salesCount,orderAmount,discountAmount)

  }else{
    orderContainerDesktop.innerHTML = '';
    orderContainerTablet.innerHTML = ''
    orderContainerMobile.innerHTML = ''

      const row = document.createElement('tr');

      row.innerHTML = `
        <td colspan="10" class="p-10 text-center text-gray-400 text-lg">
          No Orders Found..!
        </td>
        `
        orderContainerDesktop.appendChild(row)

        orderContainerTablet.innerHTML=`
        <div class="text-center py-8 text-red-500" > Error Loading Results </div>
        `

        orderContainerMobile.innerHTML=`
         <div class="text-center py-8 text-red-500" > Error Loading Results </div>
        `

        salesCountContainer.textContent =  0;
        orderAmountContainer.textContent = '₹0';
        discountAmountContainer.textContent='₹0';
  }

});

  async function loadFilter(pageNumber=1){
    console.log('call inside load filter');
    try {
  
  console.log('inside submission');
  const filterType=selectInput.value;
  console.log(filterType);

  if(filterType === 'Custom'){
    const start = startDateInput.dataset.value;
    const end = endDateInput.dataset.value
    if(!start || !end) showToast('error','Both start and end date required !')
    filter = 'custom';
   range = {start,end}
  console.log('filter check',filter);
  }
  if(!filterType) showToast('error','Please select the Range filter')
  if(filterType!='Custom')  filter=filterType.toLowerCase()
  console.log('hidf ggs');
  const response = await fetch('/admin/sales-report/paginated',
                  {
                    method:'POST',
                    headers:{"Content-Type": "application/json"},
                    body:JSON.stringify({filter,range:range||'',pageNumber})
                  })
  const data = await response.json();
  if(data.orders.length>0){
    console.log(data.orders);

    const orders = data.orders;
    const salesCount = data.salesCount;
    const orderAmount = data.orderAmount;
    const discountAmount = data.discountAmount;

    renderOrdersDesktop(orders,salesCount,orderAmount,discountAmount)
    renderOrdersTablet(orders,salesCount,orderAmount,discountAmount)
    renderOrdersMobile(orders,salesCount,orderAmount,discountAmount)

  }else{
    orderContainerDesktop.innerHTML = '';
    orderContainerTablet.innerHTML = ''
    orderContainerMobile.innerHTML = ''

      const row = document.createElement('tr');

      row.innerHTML = `
        <td colspan="10" class="p-10 text-center text-gray-400 text-lg">
          No Orders Found..!
        </td>
        `
        orderContainerDesktop.appendChild(row)

        orderContainerTablet.innerHTML=`
        <div class="text-center py-8 text-gray-400" > No Orders Found..! </div>
        `

        orderContainerMobile.innerHTML=`
         <div class="text-center py-8 text-gray-400" > No Orders Found..! </div>
        `

        salesCountContainer.textContent =  0;
        orderAmountContainer.textContent = '₹0';
        discountAmountContainer.textContent='₹0';
  }


    } catch (error) {
      
    }
  }

    async function renderOrdersDesktop(orders,salesCount,orderAmount,discountAmount){

      const orderContainerDesktop = document.getElementById('orderContainerDesktop');
      orderContainerDesktop.innerHTML='';

      if(!orders || orders.length==0){
    
        orderContainerDesktop.innerHTML = '<div class="text-center py-8 text-gray-400">No Order found</div>';
  
       return
    }

      orders.forEach((order,index)=>{
        const row = document.createElement('tr')

        row.innerHTML='';
        row.innerHTML=`

        <tr  class="border-b border-gray-800 hover:bg-[#222] transition"
        style="animation: slideIn 0.6s ease forwards; animation-delay:${ index * 0.1 }s; opacity:0;">

      <td class="p-2 lg:p-3">${ index+1 }</td>
      <td class="p-2 lg:p-3 font-semibold">${ order?.orderNumber }</td>
      <td class="p-2 lg:p-3">${ order?.user?.firstName }</td>
      <td class="p-2 lg:p-3 text-gray-300">${ order?.payment.method }</td>
      <td class="p-2 lg:p-3">${ order?.orderStatus }</td>

      <td class="p-2 lg:p-3">
        <div class="flex flex-col gap-1.5">
            <span class="inline-flex items-center gap-2 px-2 py-0.5 rounded-2xl text-xs bg-gray-100/30 text-black border border-gray-700">
              <span class="font-medium">${order.items.productName}</span>
        
              <span class="px-1.5 py-0.5 bg-black text-white text-[10px] rounded-2xl">
                ${order.items.productColor || '—'}
              </span>
        
              ${order.items.quantity
                ? `<span class="px-1.5 py-0.5 bg-black rounded-2xl text-[10px] text-white">
                     × ${order.items.quantity}
                   </span>`
                : ''
              }
            </span>

        
        
        </div>

      </td>

      <td class="p-2 lg:p-3">
        <span class="bg-gray-100 text-black px-2 lg:px-3 py-1 rounded-full text-xs">
          ₹${ order?.subTotal }
        </span>
      </td>

      <td class="p-2 lg:p-3">
        <span class="bg-gray-100 text-black px-2 lg:px-3 py-1 rounded-full text-xs">
          ₹${order?.discount }
        </span>
      </td>

      <td class="p-2 lg:p-3">
        <span class="bg-gray-100 text-black px-2 lg:px-3 py-1 rounded-full text-xs">
          ₹${order?.deliveryCharge }
        </span>
      </td>

      <td class="p-2 lg:p-3">
        <span class="bg-gray-100 text-black px-2 lg:px-3 py-1 rounded-full text-xs font-semibold">
          ₹${order?.total }
        </span>
      </td>
    </tr>
        
        `

        orderContainerDesktop.appendChild(row)
      })

      salesCountContainer.textContent = salesCount || 0;
      orderAmountContainer.textContent = `₹${orderAmount}` || 0;
      discountAmountContainer.textContent=`₹${discountAmount}` || 0;

    }


    async function renderOrdersTablet(orders,salesCount,orderAmount,discountAmount){
      console.log('inside redner order tablet');
      const orderContainerTablet = document.getElementById('orderContainerTablet');
      orderContainerTablet.innerHTML='';

      if(!orders || orders.length==0){
        
        orderContainerTablet.innerHTML = '<div class="text-center py-8 text-gray-400">No Order found</div>';
  
       return
    }

      orders.forEach((order,index)=>{
        const div = document.createElement('div')

        div.innerHTML='';
        div.innerHTML=`
        <div  class="bg-black border border-white/30 rounded-xl p-4 space-y-3 transform transition-all duration-500 hover:scale-[1.01]"
            style="animation: slideIn 0.5s ease-out forwards; animation-delay:${index*0.1}s; opacity:0; transform:translateY(20px);">
        
        <div class="flex justify-between items-start">
          <div>
            <div class="text-sm text-gray-400">#${ index+1 }</div>
            <div class="text-lg font-semibold text-white mt-1">
              ${ order?.orderNumber }
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-400">User</div>
            <div class="text-white font-medium">${ order?.user.firstName }</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-gray-400">Payment:</span>
            <span class="ml-1 px-2 py-0.5 bg-gray-100 text-black rounded-lg text-xs">
              ${ order?.payment.method }
            </span>
          </div>
          <div>
            <span class="text-gray-400">Status:</span>
            <span class="ml-1 px-2 py-0.5 bg-gray-100 text-black rounded-lg text-xs">
              ${ order?.orderStatus }
            </span>
          </div>
        </div>

        <div class="space-y-1.5">
          <div class="text-sm text-gray-400">Products:</div>
          <div class="flex flex-wrap gap-1.5">
              <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs bg-gray-100/30 text-black border border-gray-700">
                <span class="font-medium">${ order.items.productName }</span>
                <span class="px-1.5 py-0.5 bg-black text-white text-[10px] rounded">
                  ${ order.items.productColor || '—' }
                </span>
                <span class="text-gray-500">× ${ order.items.quantity }</span>
              </span>
      
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-700 text-sm">
          <div>
            <div class="text-gray-400 text-xs">SubTotal</div>
            <div class="text-white font-semibold">₹${ order?.subTotal }</div>
          </div>
          <div>
            <div class="text-gray-400 text-xs">Discount</div>
            <div class="text-white font-semibold">₹${order?.discount }</div>
          </div>
          <div>
            <div class="text-gray-400 text-xs">Shipping</div>
            <div class="text-white font-semibold">₹${order?.deliveryCharge }</div>
          </div>
          <div>
            <div class="text-gray-400 text-xs">Total</div>
            <div class="text-white font-bold text-base">₹${order?.total }</div>
          </div>
        </div>
      </div>
      `
      orderContainerTablet.appendChild(div)
     })

     salesCountContainer.textContent = salesCount || 0;
     orderAmountContainer.textContent = `₹${orderAmount}` || 0;
     discountAmountContainer.textContent=`₹${discountAmount}` || 0;

    }


    async function renderOrdersMobile(orders,salesCount,orderAmount,discountAmount){

      const orderContainerMobile = document.getElementById('orderContainerMobile');
      orderContainerMobile.innerHTML='';

      if(!orders || orders.length==0){
    
        orderContainerMobile.innerHTML = '<div class="text-center py-8 text-gray-400">No Order found</div>';
  
       return
    }

      orders.forEach((order,index)=>{
        const div = document.createElement('div')

        div.innerHTML='';
        div.innerHTML=`
        <div  class="bg-black border border-white/30 rounded-xl p-3 sm:p-4 space-y-3 transform transition-all duration-500 hover:scale-[1.01]"
               style="animation: slideIn 0.5s ease-out forwards; animation-delay:${index*0.1}s; opacity:0; transform:translateY(20px);">

            <div class="flex justify-between items-center text-gray-300 text-xs sm:text-sm">
              <span>#${ index+1 }</span>
              <span>${ new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
            </div>

            <div class="text-base sm:text-lg font-semibold text-white">
              Order: ${ order?.orderNumber }
            </div>

            <div class="text-sm sm:text-base text-gray-400">
              User: <span class="text-white">${ order?.user.firstName }</span>
            </div>

            <div class="flex flex-wrap gap-2">
              <span class="px-2 sm:px-3 py-1 bg-gray-100 text-black rounded-lg text-xs sm:text-sm">
                ${ order?.payment.method }
              </span>
              <span class="px-2 sm:px-3 py-1 bg-gray-100 text-black rounded-lg text-xs sm:text-sm">
                ${ order?.orderStatus }
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs sm:text-sm">
              <div>
                <span class="text-gray-400">SubTotal:</span>
                <span class="text-white font-semibold ml-1">₹${ order?.subTotal }</span>
              </div>
              <div>
                <span class="text-gray-400">Discount:</span>
                <span class="text-white font-semibold ml-1">₹${order?.discount }</span>
              </div>
              <div>
                <span class="text-gray-400">Shipping:</span>
                <span class="text-white font-semibold ml-1">₹${order?.deliveryCharge }</span>
              </div>
              <div>
                <span class="text-gray-400">Total:</span>
                <span class="text-white font-bold ml-1 text-sm sm:text-base">₹${order?.total }</span>
              </div>
            </div>

            <button onclick="orderDetails('${ order?._id }')"
              class="w-full bg-white text-black py-2 rounded-lg font-semibold mt-2 text-sm sm:text-base hover:bg-gray-200 transition">
              View Details
            </button>
          </div>
      `
      orderContainerMobile.appendChild(div)
     })

     salesCountContainer.textContent = salesCount || 0;
     orderAmountContainer.textContent = `₹${orderAmount}` || 0;
     discountAmountContainer.textContent=`₹${discountAmount}` || 0;

    }


 


async function downloadReport(type){
  try {
    // Show loader
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
    
    console.log('Download report clicked');
    console.log('Filter:', filter);
    console.log('Type:', type);
    
    let endpoint = '';
    let filename = 'Sales-Report';
    
    if (type === 'pdf') {
      endpoint = '/admin/sales-report/download-sales-report';
    } else if (type === 'excel') {
      endpoint = '/admin/sales-report/download-sales-report-excel';
    } else {
      throw new Error('Invalid download type');
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filter,range:range||''})
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    } else {
      // Generate default filename with timestamp
      const extension = type === 'pdf' ? 'pdf' : 'xlsx';
      const timestamp = new Date().toISOString().split('T')[0];
      filename = `sales-report-${timestamp}.${extension}`;
    }
    
    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);
    
    // Hide loader with delay
    setTimeout(() => {
      if (loader) {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }, 300);
    
    console.log('Download completed successfully');
    
  } catch (error) {
    console.error('Download error:', error);
    
    
    // Hide loader on error
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
}


