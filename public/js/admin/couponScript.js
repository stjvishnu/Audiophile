


const couponHeader = document.getElementById('couponHeader');
const addeditBtn = document.getElementById('addeditBtn');
const couponModal = document.getElementById('couponModal')
const couponForm = document.getElementById('couponForm')


let editId = null;
const couponCode        = couponModal.querySelector("#couponCode");
const discountType      = couponModal.querySelector("select");
const description       = couponModal.querySelector("textarea");
const numberInputs      = couponModal.querySelectorAll("input[type='number']");
const discountValue     = numberInputs[0];
const minPurchase       = numberInputs[1];
const maxDiscount       = numberInputs[2];
const usageLimit        = numberInputs[3];

const dateInputs        = couponModal.querySelectorAll("input[type='datetime-local']");
const validFrom         = dateInputs[0];
const validTo           = dateInputs[1];

const activeStatus      = couponModal.querySelector("input[type='checkbox']");
const saveBtn           = couponModal.querySelector("#saveBtn");
const couponModalcancelBtn         = couponModal.querySelector("#cp-cancelBtn");
const closeBtn          = couponModal.querySelector("button.text-gray-400");



async function openModal(mode,couponData=null){
  try {




    if(mode=='add'){
      couponForm.reset();
      clearErrors()
      couponModal.classList.remove('hidden');

      couponCode.value = "";
      discountType.value = "select discount type";
      description.value = "";
      discountValue.value = "";
      minPurchase.value = "";
      maxDiscount.value = "";
      validFrom.value = "";
      validTo.value = "";
      usageLimit.value = "";
      activeStatus.checked = true;

      saveBtn.textContent = "Save Coupon";

    }
    if(mode==='edit' && couponData){
      couponData=JSON.parse(couponData)
      editId=couponData._id

      couponCode.value = couponData.code;
      discountType.value = couponData.discountType;
      description.value = couponData.description;
      discountValue.value = couponData.discountValue;
      minPurchase.value = couponData.minPurchase;
      maxDiscount.value = couponData.maxDiscount || "";
      validFrom.value = couponData.validFrom.slice(0, 16);
      validTo.value = couponData.validTo.slice(0, 16);
      usageLimit.value = couponData.usageLimit;
      activeStatus.checked = couponData.isActive;

      saveBtn.textContent = "Update Coupon";

      couponModal.classList.remove('hidden');

    }
  } catch (error) {
   console.log('Error in open modal',error);
  }
}



couponForm.addEventListener('submit',async (e)=>{

  e.preventDefault()
  
  const isValid = validationCheckBeforeSubmit();
  console.log(isValid);

  if(!isValid){
    console.log('Call inside coupon modal close');
    showToast('error','All fields required');
    return
  }

  const payload = {
    code: couponCode.value.trim().toUpperCase(),
    discountType: discountType.value,
    description: description.value.trim(),
    discountValue: Number(discountValue.value),
    minPurchase: Number(minPurchase.value || 0),
    maxDiscount: Number(maxDiscount.value || 0),
    validFrom: validFrom.value,
    validTo: validTo.value,
    usageLimit: Number(usageLimit.value || 0),
    isActive: activeStatus.checked,
  };

  console.log('Payload',payload);

  try {
    let response;
    if(editId){
      console.log('edit id',editId);
       response =  await fetch(`/admin/coupons/${editId}`,{
        method:'PUT',
        body:JSON.stringify(payload),
        headers:{'Content-Type':'application/json'}
       })
       const data =  await response.json()
       console.log('checking data',data);
       const updatedCoupon = data?.updatedCoupon
      //  console.log('updated coupon',data.updatedCoupon);
       
        const couponRow = document.getElementById(updatedCoupon._id)
        console.log('couponRow',couponRow);
        couponRow.querySelector('.code').textContent = updatedCoupon.code
        couponRow.querySelector('.description').textContent = updatedCoupon.description
        couponRow.querySelector('.discountType').textContent = updatedCoupon.discountType
        couponRow.querySelector('.discountValue').textContent = updatedCoupon.discountValue
        couponRow.querySelector('.date').textContent =`${new Date(updatedCoupon.validFrom).toLocaleDateString()} - ${new Date(updatedCoupon.validTo).toLocaleDateString()}`
        couponRow.querySelector('.usageLimit').textContent = updatedCoupon.usageLimit
        couponRow.querySelector(`#statusBtn-${editId}`).textContent = updatedCoupon.isDeleted?'Deleted':updatedCoupon.isActive?'Active':'Inactive'

        couponModal.classList.add('hidden')
        const message = data?.customMessage;
        if(message){
          showToast('success',message);
          editId=null
        }
        // showToast('success','Coupon edited succesfully')
    }else{
      console.log('Hello  add coupon ');
       response = await fetch('/admin/coupons/',{
        method:'POST',
        body:JSON.stringify(payload),
        headers:{'Content-Type':'application/json'}
       })
       
       if(response.ok){
        const data = await response.json()  
        console.log('data',data);
        const message = data?.customMessage;
        if(message) showToast('success',message)
        setTimeout(()=>{
          window.location.reload()
        },3000)
        couponModal.classList.add('hidden')
       }


    }

    
  } catch (error) {
    console.log('Error in form submission',error);
    couponModal.classList.add('hidden')
    console.log('error',error);

  }
})

function closeModal(){
  couponModal.classList.add('hidden')
  return
}


//block coupon

async function blockCoupon(couponId){
  try {
    const result = await sweetAlert('warning','Are you sure ? ','You are about to block this Coupon',true,true)

    if(result.isConfirmed){
      const response = await fetch(`/admin/coupons/block/${couponId}`,{
        method:'PATCH'
      })

      if(response.ok){
        await sweetAlert('success','Blocked','Coupon has been succesfully blocked',false,false,1000)

       const couponRow = document.getElementById(`${couponId}`)
       const blockBtn = document.getElementById(`blockBtn-${couponId}`);
       const unblockBtn = document.getElementById(`unblockBtn-${couponId}`);
       const statusBtn = document.getElementById(`status-${couponId}`);
       blockBtn.classList.add('hidden')
       unblockBtn.classList.remove('hidden')
       statusBtn.textContent='InActive'
       statusBtn.classList.remove('bg-green-900/50', 'text-green-300');
       statusBtn.classList.add('bg-red-900/50', 'text-red-300');
       couponRow.classList.remove('bg-gray-600')
       couponRow.classList.add('bg-black')
        // window.location.reload();
      }else{
        throw new Error ('Failed to Block the Coupon')
      }
    }
  } catch (error) {
    showToast('error','Something went wrong')
    console.log('Error in block Coupon',error);   
  }
}

//unblock coupon

async function unblockCoupon(couponId){
  console.log('Call inside unblock coupon');
  try {
    const result = await sweetAlert('warning','Are you sure ? ','You are about to unblock this Coupons',true,true)

    if(result.isConfirmed){
      const response = await fetch(`/admin/coupons/unblock/${couponId}`,{
        method:'PATCH'
      })

      if(response.ok){
        await sweetAlert('success','unblocked','Coupon has been succesfully unblocked',false,false,1000)

        const couponRow = document.getElementById(`${couponId}`)
        const blockBtn = document.getElementById(`blockBtn-${couponId}`);
        const unblockBtn = document.getElementById(`unblockBtn-${couponId}`);
        const statusBtn = document.getElementById(`status-${couponId}`);
        blockBtn.classList.remove('hidden')
        unblockBtn.classList.add('hidden')
        statusBtn.textContent='Active'
        statusBtn.classList.remove('bg-red-900/50', 'text-red-300');
        statusBtn.classList.add('bg-green-900/50', 'text-green-300');
    

        // window.location.reload();
      }else{
        throw new Error ('Failed to unBlock the Coupon')
      }
    }
  } catch (error) {
    showToast('error','Something went wrong')
    console.log('Error in unblock Coupon',error);   
  }
}

//delete coupon


async function deleteCoupon(couponId){
  console.log('Call inside block coupon');
  try {
    const result = await sweetAlert('warning','Are you sure ? ','You are about to delete this Coupons',true,true)

    if(result.isConfirmed){
      const response = await fetch(`/admin/coupons/${couponId}`,{
        method:'DELETE'
      })

      if(response.ok){
        await sweetAlert('success','Deleted','Coupon has been succesfully deleted',false,false,1000)

       const couponRow = document.getElementById(`${couponId}`)
       const deleteBtn = document.getElementById(`deleteBtn-${couponId}`);
       const statusBtn = document.getElementById(`statusBtn-${couponId}`);  
       const restoreBtn = document.getElementById(`restoreBtn-${couponId}`);

      statusBtn.textContent='Deleted';
      statusBtn.classList.remove('bg-green-900/50', 'text-green-300')
      statusBtn.classList.add('bg-red-900/50', 'text-red-300')
      couponRow.classList.remove('bg-black')
      couponRow.classList.add('bg-gray-600')
      deleteBtn.classList.add('hidden')
      restoreBtn.classList.remove('hidden')

        // window.location.reload();
      }else{
        throw new Error ('Failed to delete the Coupon')
      }
    }
  } catch (error) {
    showToast('error','Something went wrong')
    console.log('Error in delete Coupon',error);   
  }
}


//restore coupon

async function restoreCoupon(couponId){
  console.log('Call inside block coupon');
  try {
    const result = await sweetAlert('warning','Are you sure ? ','You are about to restore this Coupons',true,true)

    if(result.isConfirmed){
      const response = await fetch(`/admin/coupons/restore/${couponId}`,{
        method:'PATCH'
      })

      if(response.ok){
        const data = await response.json()
        await sweetAlert('success','Restored','Coupon has been succesfully restored',false,false,1000)
        const couponRow = document.getElementById(`${couponId}`)
        const deleteBtn = document.getElementById(`deleteBtn-${couponId}`);
        const statusBtn = document.getElementById(`statusBtn-${couponId}`); 
        const restoreBtn = document.getElementById(`restoreBtn-${couponId}`);
        statusBtn.textContent=data.updatedCoupon.isActive?'Active':'Inactive';
        statusBtn.classList.remove('bg-red-900/50', 'text-red-300')
        statusBtn.classList.add('bg-green-900/50', 'text-green-300')
        couponRow.classList.remove('bg-gray-600')
        couponRow.classList.add('bg-black')
        restoreBtn.classList.add('hidden')
        deleteBtn.classList.remove('hidden')
        
        
        // window.location.reload();
      }else{
        throw new Error ('Failed to restore the Coupon')
      }
    }
  } catch (error) {
    showToast('error','Something went wrong')
    console.log('Error in restore Coupon',error);   
  }
}

function clearErrors() {
  const errorElements = couponModal.querySelectorAll('[id$="-error"]');
  errorElements.forEach(element => {
      element.textContent = '';
      element.classList.replace('visible', 'invisible');
  });
}




