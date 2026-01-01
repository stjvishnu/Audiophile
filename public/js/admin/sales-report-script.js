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

document.getElementById('applyBtn').addEventListener('click',async (e)=>{
  e.preventDefault();
  let filter;
  console.log(endDateInput.dataset.value);
  
  console.log('inside submission');
  const filterType=selectInput.value;
  console.log(filterType);
  if(filterType === 'Custom'){
    const start = startDateInput.dataset.value;
    const end = endDateInput.dataset.value
    if(!start || !end) showToast('error','Both start and end date required !')
    filter = {start,end}
  console.log('filter check',filter);
  }
  if(!filterType) showToast('error','Please select the Range filter')
  if(filterType!='Custom')  filter=filterType.toLowerCase()


  const response = await fetch('/admin/sales-report',
                  {
                    method:'POST',
                    headers:{"Content-Type": "application/json"},
                    body:JSON.stringify({filter})
                  })
  const data = await response.json();
  if(data.orders.length>0){
    console.log(data.orders);
    
    const orders = data.orders;
    const salesCount = data.salesCount;
    const orderAmount = data.orderAmount;
    const discountAmount = data.discountAmount;
    console.log('salesCount',salesCount);

    const orderContainer = document.getElementById('orderContainer');
    orderContainer.innerHTML='';
    orders.forEach((order,index)=>{
    const row = document.createElement('tr');
    row.innerHTML=`
    <td class="p-3">${index+1}</td>

    <td class="p-3 font-semibold">${order?.orderNumber }</td>

    <td class="p-3">${order?.userId?.firstName }</td>

    <td class="p-3 text-gray-300">
       ${order?.payment.method }
    </td>

    <td class="p-3">${order?.orderStatus } </td>

    <td class="p-3">
      <div class="flex flex-col gap-1.5">
          <span class="inline-flex itemss-center gap-2 px-2 py-0.5 rounded-2xl text-xs
                       bg-gray-100/30 text-black border border-gray-700">
            <span class="font-medium">${order.items.productName }</span>
            <span class="px-1.5 py-0.5 bg-black text-white text-[10px] rounded-2xl">
              ${order.items.productColor || '—' }
            </span>
            ${order.items.quantity? 
              `<span class="px-1.5 py-0.5 bg-black rounded-2xl text-[10px] text-white">
                ${order.items.quantity }
              </span>`
             
             : ''
            }
            <span class="text-gray-500">× ${order.items.quantity }</span>
          </span>
      </div>
    </td>

    <td class="p-3">
      <span class="bg-gray-100 text-black px-3 py-1 rounded-full text-xs">
        ${order?.subTotal }
      </span>
    </td>

    <td class="p-3">
      <span class="bg-gray-100 text-black px-3 py-1 rounded-full text-xs">
        ₹ ${order?.discount }
      </span>
    </td>

    <td class="p-3">
      <span class="bg-gray-100 text-black px-3 py-1 rounded-full text-xs">
        ₹ ${order?.deliveryCharge }
      </span>
    </td>

    <td class="p-3">
      <span class="bg-gray-100 text-black px-3 py-1 rounded-full text-xs">
        ₹ ${order?.total }
      </span>
    </td>

    `
    orderContainer.appendChild(row)
  })

  salesCountContainer.textContent = salesCount || 0;
  orderAmountContainer.textContent = `₹${orderAmount}` || 0;
  discountAmountContainer.textContent=`₹${discountAmount}` || 0;
  }else{
    orderContainer.innerHTML = '';

const row = document.createElement('tr');

row.innerHTML = `
  <td colspan="10" class="p-10 text-center text-gray-400 text-lg">
    No Orders Found..!
  </td>
`;

orderContainer.appendChild(row);

    salesCountContainer.textContent =  0;
  orderAmountContainer.textContent = '₹0';
  discountAmountContainer.textContent='₹0';
  }
  
})


