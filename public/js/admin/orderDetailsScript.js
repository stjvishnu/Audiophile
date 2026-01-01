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

 }else if(currentStatus === 'shipped'){
  shippedBtn.disabled=true;
  deliveredBtn.disabled=true;
  processingBtn.disabled=true;
  outfordeliveryBtn.disabled=false;

 }else if(currentStatus === 'outfordelivery'){
  shippedBtn.disabled=true;
  deliveredBtn.disabled=false;
  processingBtn.disabled=true;
  outfordeliveryBtn.disabled=true;

 }else if(currentStatus === 'delivered'){
  shippedBtn.disabled=true;
  deliveredBtn.disabled=true;
  processingBtn.disabled=true;
  outfordeliveryBtn.disabled=true;

 }else if(currentStatus ==='cancelled'){
  shippedBtn.disabled=true;
  deliveredBtn.disabled=true;
  processingBtn.disabled=true;
  outfordeliveryBtn.disabled=true;
  cancelledOrReturnedBtn.disabled=true;
 }else if(currentStatus === 'return-requested'){
  shippedBtn.disabled=true;
  deliveredBtn.disabled=true;
  processingBtn.disabled=true;
  outfordeliveryBtn.disabled=true;
  cancelledOrReturnedBtn.disabled=true;
 }else if(currentStatus==='partial-return'){
  shippedBtn.disabled=true;
  deliveredBtn.disabled=true;
  processingBtn.disabled=true;
  outfordeliveryBtn.disabled=true;
  cancelledOrReturnedBtn.disabled=true;
 }else if(currentStatus==='returned'){
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
    if(newStatus === 'processing'){
      processingBtn.disabled=true;
      deliveredBtn.disabled=true;
      shippedBtn.disabled=false;
      outfordeliveryBtn.disabled=true;
    
     }else if(newStatus === 'shipped'){
      shippedBtn.disabled=true;
      deliveredBtn.disabled=true;
      processingBtn.disabled=true;
      outfordeliveryBtn.disabled=false;
    
     }else if(newStatus === 'outfordelivery'){
      shippedBtn.disabled=true;
      deliveredBtn.disabled=false;
      processingBtn.disabled=true;
      outfordeliveryBtn.disabled=true;
    
     }else if(newStatus === 'delivered'){
      shippedBtn.disabled=true;
      deliveredBtn.disabled=true;
      processingBtn.disabled=true;
      outfordeliveryBtn.disabled=true;
    
     }else if(newStatus ==='cancelled' || newStatus ==='returned'){
      shippedBtn.disabled=true;
      deliveredBtn.disabled=true;
      processingBtn.disabled=true;
      outfordeliveryBtn.disabled=true;
      cancelledOrReturnedBtn.disabled=true;
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

async function returnItem(item){
  try {

    const {orderId,itemId,reason:itemReturnReason} = item.dataset;
    const result= await sweetAlert('warning','Are you sure ?',`You want to accept return request \nreason: ${itemReturnReason}!`,true,true)

    if(result.isConfirmed){
      console.log('inside confirm');
      let action= 'return-accepted'
      const response = await fetch('/admin/orders/return-item',{
        method:'POST',
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify({orderId,itemId,action})
      })
      console.log('response',response);
      const data = await response.json()
      console.log('data',data);
      if(data?.customMessage){
        showToast('success',data?.customMessage);
      }
      setTimeout(()=>{
        window.location.reload()
      },2000)
    }else if(result.isDismissed){
      let action = 'return-rejected'
      const response  = await fetch('/admin/orders/return-item',{
        method:'POST',
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify({orderId,itemId,action})
      })
      const data = await response.json()
      console.log('data',data);
      if(data?.customMessage){
        showToast('success',data?.customMessage);
      }
    }

  } catch (error) {
    console.log('Error in return item',error);
    showToast('error','Something went wrong !')
  }
}