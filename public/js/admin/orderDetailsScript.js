console.log('Load detailsScript.js');
const adminOrderDetailsSection = document.getElementById('adminOrderDetailsSection')
const currentStatus = adminOrderDetailsSection.querySelector('#currentStatus').value;
console.log('currentstatusinpt',currentStatus);
const processingBtn = adminOrderDetailsSection.querySelector('#processing');

  const deliveredBtn = adminOrderDetailsSection.querySelector('#delivered');
  const shippedBtn = adminOrderDetailsSection.querySelector('#shipped');
  const outfordeliveryBtn = adminOrderDetailsSection.querySelector('#outfordelivery');
  const cancelledOrReturnedBtn = adminOrderDetailsSection.querySelector('#cancelledOrReturned');

if(currentStatus === 'processing'){
  processingBtn.disabled=true;
  deliveredBtn.disabled=true;
  shippedBtn.disabled=false;
  outfordeliveryBtn.disabled=true;
  cancelledOrReturnedBtn.disabled=true;
 }else if(currentStatus === 'shipped'){
  shippedBtn.disabled=true;
  deliveredBtn.disabled=true;
  processingBtn.disabled=true;
  outfordeliveryBtn.disabled=false;
  cancelledOrReturnedBtn.disabled=true;
 }else if(currentStatus === 'outfordelivery'){
  shippedBtn.disabled=true;
  deliveredBtn.disabled=false;
  processingBtn.disabled=true;
  outfordeliveryBtn.disabled=true;
  cancelledOrReturnedBtn.disabled=true;
 }else if(currentStatus === 'delivered'){
  shippedBtn.disabled=true;
  deliveredBtn.disabled=true;
  processingBtn.disabled=true;
  outfordeliveryBtn.disabled=true;
  cancelledOrReturnedBtn.disabled=true;
 }else if(currentStatus ==='cancelled' || currentStatus ==='returned'){
  shippedBtn.disabled=true;
  deliveredBtn.disabled=true;
  processingBtn.disabled=true;
  outfordeliveryBtn.disabled=true;
  cancelledOrReturnedBtn.disabled=true;
 }
 



async function changeStatus(orderId,newStatus){
  try{
    console.log('OrderId',orderId);
  
    console.log(currentStatus);

    if(currentStatus === 'processing'){

     processingBtn.disabled=true;
     deliveredBtn.disabled=true;
     shippedBtn.disabled=false

    }else if(currentStatus === 'shipped'){
      shippedBtn.disabled=true;
      processingBtn.disabled=true;
      deliveredBtn.disabled=false;
     }else if(currentStatus === 'delivered'){
      shippedBtn.disabled=true;
      deliveredBtn.disabled=true;
      processingBtn.disabled=true;
     }

     const result= await sweetAlert('warning','Are you sure ?','You want to change the status !',true,true)

     if(result.isConfirmed){
      const response = await fetch('/admin/orders/change-order-status',{method:'POST',headers:{"Content-Type": "application/json"},body:JSON.stringify({orderId,newStatus})})

     if(!response.ok) showToast('error','Request Failed, Please Try After Sometime')

     const newStatusBtn=adminOrderDetailsSection.querySelector(`#${newStatus}`)
     console.log(newStatusBtn);
     newStatusBtn.classList.add('bg-white')
     newStatusBtn.innerHTML = `
     <i class="fa-regular fa-circle-check fa-2xl" style="color: #000000;"></i>
     `
     showToast('success','Changed Status Successfully !');
     currentStatus.value=newStatus;
     const data = await response.json();

     console.log(data);

     }

     
     //
  }catch (error){
    console.log('Error in change status',error);
  }
} 