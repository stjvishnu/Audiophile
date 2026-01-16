


const couponHeader = document.getElementById('couponHeader');
const addeditBtn = document.getElementById('addeditBtn');
const couponModal = document.getElementById('couponModal')
const couponForm = document.getElementById('couponForm')


const validFromInput = document.getElementById('validFrom')
const validToInput = document.getElementById('validTo')

const startPicker = flatpickr("#validFrom", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    allowInput: false,
    defaultHour: 0,
    defaultMinute: 0,
    minDate: "today",
    onChange:(selectedDates,dateStr)=>{
      endPicker.set('minDate',dateStr)
      validFromInput.setAttribute("data-value", dateStr);
    }
  });
  
  const endPicker = flatpickr("#validTo", {
    dateFormat: "Y-m-d H:i",
    enableTime: true,
    allowInput: true,
    defaultHour: 23,
    defaultMinute: 59,
    onChange:(selectedDates,dateStr)=>{
     
    validToInput.setAttribute("data-value", dateStr);
      endPicker.set('minDate',dateStr)
    }
  });


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
      couponTitle.textContent='Add New Coupon'
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
      console.log('here is the coupon data',couponData);
      
      couponData=JSON.parse(couponData)
      editId=couponData._id
      console.log('valid from',couponData.validFrom);
      couponCode.value = couponData.code;
      discountType.value = couponData.discountType;
      description.value = couponData.description;
      discountValue.value = couponData.discountValue;
      minPurchase.value = couponData.minPurchase;
      maxDiscount.value = couponData.maxDiscount || "";
      validFromInput.value = new Date(couponData.validFrom)
      validToInput.value = new Date(couponData.validTo)
      usageLimit.value = couponData.usageLimit;
      activeStatus.checked = couponData.isActive;
      couponTitle.textContent='Edit Coupon'
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
    validFrom: validFromInput.value,
    validTo: validToInput.value,
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
       console.log('updated coupon',updatedCoupon);
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
        setTimeout(()=>{
          window.location.reload()
        },3000)
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
       const statusBtn = document.getElementById(`statusBtn-${couponId}`);
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
        const statusBtn = document.getElementById(`statusBtn-${couponId}`);
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


//------------- Search Management ------------//

let searchMode=false; //variable for managing pagination state
let filterMode=false
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

   let previousCoupons = [];
  
   /**
   * Loads all coupons initially for fallback rendering
   */

   async function loadOffers() {
     
     const res = await fetch('/admin/coupons/loadCoupons');
     const data = await res.json();
     previousCoupons = data.coupons;
     console.log('previousOffers',previousCoupons);
   }
   loadOffers();

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
          const couponsContainerDesktop=document.getElementById('couponsContainerDesktop');
          const couponsContainerTablet = document.getElementById('couponsContainerTablet');
          const couponsContainerMobile = document.getElementById('couponsContainerMobile');
   
          couponsContainerDesktop.innerHTML = '<div class="text-center py-8" > Searching... </div> '
          couponsContainerTablet.innerHTML = '<div class="text-center py-8" > Searching... </div> '
          couponsContainerMobile.innerHTML = '<div class="text-center py-8" > Searching... </div> '
   
          if (searchTerm === '') {
            renderCouponsDesktop(previousCoupons);
            renderCouponsTablet(previousCoupons);
            renderCouponsMobile(previousCoupons);
   
            return;
          }
          console.log('search term',searchTerm);
          // Remove special characters that may break backend
          if(/[*%$?\\]/.test(searchTerm)){ 
            searchTerm=searchTerm.replaceAll(/[*%$?\\]/g,'').trim()
          }
          
          const response = await fetch(`/admin/coupons/search?searchTerm=${encodeURIComponent(searchTerm)}`);
   
          if (!response.ok) throw new Error('Search Failed')
      
          const data = await response.json();
          const coupons = data.coupons;
          console.log('Trouble coupons',coupons);
          renderCouponsDesktop(coupons);
          renderCouponsTablet(coupons);
          renderCouponsMobile(coupons);
   
        } catch (error) {
          console.log('Error in get handleSearch', error);
          couponsContainerDesktop.innerHTML = '<div class="text-center py-8 text-red-500" > Error Loading Results </div>'
          couponsContainerTablet.innerHTML = '<div class="text-center py-8 text-red-500" > Error Loading Results </div>'
          couponsContainerMobile.innerHTML = '<div class="text-center py-8 text-red-500" > Error Loading Results </div>'
          
        }
       }

         /**
        * Handles pagination
        * @param {String} pageNumber
        */

        async function loadURL(pageNumber){
            try {
            console.log('Search term in loadUrl Orders',searchTerm);
            const response = await fetch(`/admin/coupons/search?searchTerm=${encodeURIComponent(searchTerm)}&page=${pageNumber}`);
            const data = await response.json();
            const coupons = data.coupons;
            renderCouponsDesktop(coupons);
            renderCouponsTablet(coupons);
            renderCouponsMobile(coupons);
            } catch (error) {
            console.log('Error in loadURL',error);
            }
        }


        /**
        * Renders category list dynamically
        * @param {Array} categories
        */

    async function renderCouponsDesktop(coupons){
        try {
        const couponsContainerDesktop = document.getElementById('couponsContainerDesktop');
        
        if(!coupons || coupons.length==0){
        
          couponsContainerDesktop.innerHTML = '<div class="text-center py-8 text-gray-400">No Coupons found</div>';
    
        return
        }
        
        
        couponsContainerDesktop.innerHTML='';
    
    
        coupons.forEach((c,i)=>{
        
            const couponRow = document.createElement('tr');
        
    
            couponRow.style.animation = `slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${i * 0.1}s`;
    
            couponRow.innerHTML = `
        
            <tr  id="${c._id}" class=" border-b ${c.isDelete ?'bg-gray-600':'' }  border-gray-800 hover:bg-[#191a19] transition" >

                <td class="index px-3 py-5">${i+1}</td>

                <td class="code px-4 py-5 font-semibold">${c.code}</td>

                <td class="description px-4 py-5 text-gray-400 truncate max-w-xs">${c.description}</td>

                <td class="discountType px-4 py-5 capitalize">
                  ${c.discountType}
                </td>
                <td class="discountValue px-4 py-5">
                  ${c.discountValue}
                </td>

                <td class="date px-4 py-5 text-sm text-gray-400">
                  ${new Date(c.validFrom).toLocaleDateString()} -
                   ${new Date(c.validTo).toLocaleDateString()} 
                </td>

                <td class="usageLimit px-4 py-5 text-sm">${c.usageLimit}</td>

                <td class="px-4 py-5">
                  <span id="statusBtn-${c._id}"  class="px-3 py-1 rounded-full text-xs font-medium 

                    ${c.isDelete ? 'bg-red-900/50 text-red-300' : (c.isActive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300') }">
                    
                    ${c.isDelete ? 'Deleted' : (c.isActive ? 'Active' : 'Inactive')}
                </span>
                </td>

                <td class="px-4 py-5 flex gap-2 items-center">
                  
                  <i class="fa-solid fa-pen cursor-pointer hover:text-gray-300 
                  ${c.isDeleted ? 'opacity-50 pointer-events-none':''}"
                  style="color: #ffffff;" onclick="openModal( 'edit','${JSON.stringify(c)}' )"></i>

                  <i id="blockBtn-${c._id}" class="fa-solid fa-lock cursor-pointer hover:text-red-300
                  ${c.isDeleted ? 'opacity-50 pointer-events-none':''}
                  ${c.isActive ? '' : 'hidden'}"
                  style="color: #cc2424;" onclick="blockCoupon('${c._id }')"></i>


                  <i id="unblockBtn-${c._id}" class="fa-solid fa-lock-open cursor-pointer hover:text-green-300
                  ${c.isActive ? 'hidden':''}"
                  style="color: #04a978;" onclick="unblockCoupon('${c._id }')"></i>

                  <i id="deleteBtn-${c._id}"  class="fa-solid fa-trash cursor-pointer hover:text-red-300 ${c.isDelete ? 'hidden' : ''}"
                    style="color: #ffffff;" onclick="deleteCoupon('${c._id }')"></i>

                  <i id="restoreBtn-${c._id}" class="fa-solid fa-trash-arrow-up cursor-pointer hover:text-red-400 ${c.isDelete ? '' : 'hidden'}"
                  style="color: #ff0000;" onclick="restoreCoupon('${c._id }')"></i>

                </td>

              </tr>
        `;
    
        couponsContainerDesktop.appendChild(couponRow)
        })
        } catch (error) {
        console.log('Error in rendering coupons',error);
        }
    }



    async function renderCouponsTablet(coupons){
        try {
        const couponsContainerTablet = document.getElementById('couponsContainerTablet');
        
        if(!coupons || coupons.length==0){
        
          couponsContainerTablet.innerHTML = '<div class="text-center py-8 text-gray-400">No Offers found</div>';
    
        return
        }
        
        
        couponsContainerTablet.innerHTML='';
    
    
        coupons.forEach((c,i)=>{
        
            const couponRow = document.createElement('tr');
        
    
            couponRow.style.animation = `slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${i * 0.1}s`;
    
            couponRow.innerHTML = `
        
            <tr id="tablet-${c._id}" class="border-b ${c.isDelete ?'bg-gray-600':'' } border-gray-800 hover:bg-[#191a19] transition"
                    >
                    <td class="px-3 py-4">
                      <div class="font-semibold">${c.code}</div>
                      <div class="text-xs text-gray-400 mt-1 truncate max-w-[150px]">${c.description}</div>
                    </td>
                    <td class="px-3 py-4">
                      <div class="capitalize text-gray-400 text-xs">${c.discountType}</div>
                      <div class="font-medium">${c.discountValue}</div>
                    </td>
                    <td class="px-3 py-4 text-xs text-gray-400">
                      <div>${new Date(c.validFrom).toLocaleDateString()}</div>
                      <div>${new Date(c.validTo).toLocaleDateString()}</div>
                    </td>
                    <td class="px-3 py-4">
                      <span id="tablet-statusBtn-${c._id}" class="px-2 py-1 rounded-full text-xs font-medium ${ c.isDelete ? 'bg-red-900/50 text-red-300' : (c.isActive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300') }">
                        ${c.isDelete ? 'Deleted' : (c.isActive ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td class="px-3 py-4">
                      <div class="flex gap-2 items-center">
                        <i class="fa-solid fa-pen cursor-pointer hover:text-gray-300 ${c.isDeleted ? 'opacity-50 pointer-events-none':''}" style="color: #ffffff;" onclick="openModal('edit','${JSON.stringify(c)}')"></i>
                        <i id="tablet-blockBtn-${c._id}" class="fa-solid fa-lock cursor-pointer hover:text-red-300 ${c.isDeleted ? 'opacity-50 pointer-events-none':''} ${c.isActive ? '' : 'hidden'}" style="color: #cc2424;" onclick="blockCoupon('${c._id }')"></i>
                        <i id="tablet-unblockBtn-${c._id}" class="fa-solid fa-lock-open cursor-pointer hover:text-green-300 ${c.isActive ? 'hidden':''}" style="color: #04a978;" onclick="unblockCoupon('${c._id }')"></i>
                        <i id="tablet-deleteBtn-<%=c._id%>" class="fa-solid fa-trash cursor-pointer hover:text-red-300 ${c.isDelete ? 'hidden' : ''}" style="color: #ffffff;" onclick="deleteCoupon('${c._id}')"></i>
                        <i id="tablet-restoreBtn-${c._id}" class="fa-solid fa-trash-arrow-up cursor-pointer hover:text-red-400 ${c.isDelete ? '' : 'hidden'}" style="color: #ff0000;" onclick="restoreCoupon('${c._id }')"></i>
                      </div>
                    </td>
                  </tr>
        `;
    
        couponsContainerTablet.appendChild(couponRow)
        })
        } catch (error) {
        console.log('Error in rendering coupons',error);
        }
    }
   
   
   async function renderCouponsMobile(coupons){
     try {
      const couponsContainerMobile = document.getElementById('couponsContainerMobile');
      
      if(!coupons || coupons.length==0){
        
        couponsContainerMobile.innerHTML = '<div class="text-center py-8 text-gray-400">No Order found</div>';
    
       return
      }
      
      
      couponsContainerMobile.innerHTML='';
    
    
      coupons.forEach((c,i)=>{
       
        const couponRow = document.createElement('div');
        
        couponRow.className="bg-black border border-white/30 rounded-xl p-4 space-y-3 transform transition-all duration-500 hover:scale-[1.01]"
        couponRow.style.animation = `slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${i * 0.1}s`;
    
          couponRow.innerHTML = `
          <div class="bg-black border border-gray-700 rounded-xl p-3 sm:p-4 space-y-3" id="mobile-card-${c._id}">

          <div class="flex justify-between items-center pb-2 border-b border-gray-800">
            <span class="text-xs font-semibold bg-gray-800 px-2 py-1 rounded text-gray-300"># ${i+1}</span>
            <span class="text-xs text-gray-500">
              ${new Date(c.validFrom).toLocaleDateString()} -
              ${new Date(c.validTo).toLocaleDateString()} 
            </span>
          </div>

          <div class="text-lg sm:text-xl font-bold uppercase">${c.code}</div>

          <div class="text-sm space-y-2">
             <p class="text-gray-300">${c.description}</p>

            <div class="flex justify-between items-center">
              <p class="font-semibold">
                ${c.discountValue} 
                ${c.discountType === 'percentage'
                 ? '% off'
                 : '₹ off'
               }
              </p>
              <p class="text-gray-400 text-xs capitalize">(${c.discountType})</p>
            </div>
          </div>

          <div class="flex justify-between items-center pt-2">
            <p class="text-gray-400 text-xs sm:text-sm">Usage: <span class="text-white font-medium">${c.usageLimit}</span></p>

            <span class="px-2 sm:px-3 py-1 text-xs rounded-full font-medium 
               ${c.isActive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}">
              ${c.isActive?'Active':'Inactive'}
            </span>
          </div>
          
          <div class="flex gap-3 sm:gap-4 pt-3 border-t border-gray-800">
            <button onclick="openModal('edit','${JSON.stringify(c)}')" 
              class="text-base sm:text-lg text-white hover:text-gray-300 ${c.isDeleted ? 'opacity-50 pointer-events-none':''}"
              aria-label="Edit Coupon">
              <i class="fa-solid fa-pen"></i>
            </button>
            
            <button onclick="blockCoupon('${c._id }')" 
              class="text-base sm:text-lg text-red-500 hover:text-red-300 ${c.isDeleted ? 'opacity-50 pointer-events-none':''} ${c.isActive ? '' : 'hidden'}"
              id="mobile-blockBtn-${c._id}" aria-label="Block Coupon">
              <i class="fa-solid fa-lock"></i>
            </button>
            <button onclick="unblockCoupon('${c._id}')" 
              class="text-base sm:text-lg text-green-500 hover:text-green-300 ${c.isActive ? 'hidden':''}"
              id="mobile-unblockBtn-${c._id}" aria-label="Unblock Coupon">
              <i class="fa-solid fa-lock-open"></i>
            </button>
            
            <button onclick="deleteCoupon('${c._id}')" 
              class="text-base sm:text-lg text-red-400 hover:text-red-200 ${c.isDeleted ? 'hidden' : ''}"
              id="mobile-deleteBtn-${c._id}" aria-label="Delete Coupon">
              <i class="fa-solid fa-trash"></i>
            </button>
            <button onclick="restoreCoupon('${c._id}')" 
              class="text-base sm:text-lg text-red-600 hover:text-red-400 ${c.isDeleted ? '' : 'hidden'}"
              id="mobile-restoreBtn-${c._id}" aria-label="Restore Coupon">
              <i class="fa-solid fa-trash-arrow-up"></i>
            </button>
          </div>

        </div>
       `;
    
       couponsContainerMobile.appendChild(couponRow)
      })
     } catch (error) {
       console.log('Error in rendering coupons',error);
     }
    }
   

