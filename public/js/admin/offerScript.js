const offerHeader = document.getElementById('offerHeader');
const addeditBtn = document.getElementById('addeditBtn'); // This button is used in EJS file
const offerModal = document.getElementById('offerModal')
const offerForm = document.getElementById('offerForm')

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
const modalTitle        = offerModal.querySelector("#modalTitle");
const title             = offerModal.querySelector("#title");
const description       = offerModal.querySelector("textarea#description");
const offerType         = offerModal.querySelector("#offerType");
const targetId          = offerModal.querySelector("#targetId");
const discountType      = offerModal.querySelector("#discountType");
const discountValue     = offerModal.querySelector("#discountValue");

const dateInputs        = offerModal.querySelectorAll("input[type='datetime-local']");
// const validFrom         = dateInputs[0];
// const validTo           = dateInputs[1];

const activeStatus      = offerModal.querySelector("input[type='checkbox']");
const saveBtn           = offerForm.querySelector("button[type='submit']");
// const offerModalcancelBtn = offerForm.querySelector("#cp-cancelBtn"); // Not present in offer modal structure
// const closeBtn          = offerModal.querySelector("button.text-gray-400"); // Close button is handled by closeModal()

let productPrice=null;
let targets = null;
const offerTargets = async ()=>{
  const res= await fetch('/admin/offers/loadTargets')
  const data = await res.json()
  targets=data.targets;
  console.log('targets',targets);
  
}
offerTargets()

// Function to toggle the target field based on offer type (from offer.ejs)
function toggleTargetField() {
    const offerType = document.getElementById('offerType').value;
    const targetField = document.getElementById('targetField');
    const targetLabel = document.getElementById('targetLabel');
    const targetIdInput = document.getElementById('targetId');

    if (offerType === 'festival') {
        targetField.classList.add('hidden');
        targetIdInput.value = '';
    } else {
        targetField.classList.remove('hidden');


        if (offerType === 'category') {
            targetLabel.textContent = 'Category';
            const select = document.getElementById('targetId');

            //reset dropdown 
            select.innerHTML = '<option value="">Select Category</option>';

            targets.categories.forEach((category)=>{
                const option = document.createElement('option');
                option.textContent = category.name;
                option.value = category._id;
                select.appendChild(option)
            })
        } else if (offerType === 'product') {
            targetLabel.textContent = 'Product';

            const select = document.getElementById('targetId');

            //reset dropdown 
            select.innerHTML = '<option value="">Select Product</option>';

            targets.products.forEach((product)=>{
                    product.variants.forEach((p)=>{
                        const option = document.createElement('option');
                        option.textContent = `${product.name} (${p.attributes.color})`;
                        option.value = p.sku;
                        select.appendChild(option)
                    })
            })
        }
    }
}


async function openModal(mode, offerData = null) {
    try {

        // Clear previous state and errors before opening
        offerForm.reset();
        modalTitle.textContent = "Add New Offer";
        saveBtn.textContent = "Save Offer";
        editId = null;
        offerModal.querySelector('#targetField').classList.remove('hidden'); // Ensure visible by default
        offerModal.querySelector('#targetLabel').textContent = 'Target'; // Default label

        const errorElements = offerModal.querySelectorAll('[id$="-error"]');
        errorElements.forEach(element => {
            element.textContent = '';
            element.classList.replace('visible', 'invisible');
        });


        if (mode == 'add') {

            offerModal.classList.remove('hidden');
            activeStatus.checked = true;
            const select = document.getElementById('targetId');
            select.innerHTML = '';
            select.innerHTML=`
            <option id="targetOption" value="">Select Target</option>
            `

            console.log(document.getElementById('targetId'));

        }
        if (mode === 'edit' && offerData) {
            console.log('offerData in edit',offerData);
            offerData = JSON.parse(offerData);
            editId = offerData._id

            modalTitle.textContent = "Edit Offer";
            saveBtn.textContent = "Update Offer";

            title.value = offerData.offerTitle;
            description.value = offerData.description;
            offerType.value = offerData.offerType;
            discountType.value = offerData.discountType;
            discountValue.value = offerData.discountValue;

            
            
            // Handle target field based on offer type
            if (offerData.offerType === 'festival') {
                targetId.textContent = '';
                offerModal.querySelector('#targetField').classList.add('hidden');
                
            } else if (offerData.offerType === 'product') {
               
                offerModal.querySelector('#targetField').classList.remove('hidden');
                offerModal.querySelector('#targetLabel').textContent = 'product';


                const select = offerModal.querySelector('#targetId');
                select.innerHTML = '';

                const option = document.createElement('option');
                option.value = offerData.targetSku;
                option.textContent = offerData.targetName || offerData.targetSku;
                select.appendChild(option);
                select.value = option.value;
                
            }else if (offerData.offerType === 'category'){
                targetId.textContent = offerData.targetName;
                offerModal.querySelector('#targetField').classList.remove('hidden');
                offerModal.querySelector('#targetLabel').textContent = 'category';

                const select = offerModal.querySelector('#targetId');
                select.innerHTML = '';

                const option = document.createElement('option');
                option.value = offerData.targetId;
                option.textContent = offerData.targetName || offerData.targetId;
                select.appendChild(option);
                select.value = option.value;
            }
            validFromInput.value = new Date(offerData.validFrom)
            validToInput.value = new Date(offerData.validTo)

            activeStatus.checked = offerData.isActive;

            offerModal.classList.remove('hidden');

        }
    } catch (error) {
        console.log('Error in open modal', error);
    }
}



offerForm.addEventListener('submit', async (e) => {

    e.preventDefault()
  
    // Assuming validationCheckBeforeSubmit() is globally available from offerValidation.js
    const isValid = validationCheckBeforeSubmit();
    console.log(isValid);
    if (!isValid) {
        console.log('Validation failed for offer form.');
        // Assuming showToast is globally available
        showToast('error', 'Please correct the errors in the form.');
        return
    }

    const payload = {
        offerTitle: title.value.trim(),
        description: description.value.trim(),
        offerType: offerType.value,
        targetId: offerType.value === 'festival' ? undefined : targetId.value,
        discountType: discountType.value,
        discountValue: Number(discountValue.value),
        validFrom: validFromInput.dataset.value,
        validTo: validToInput.dataset.value,
        isActive: activeStatus.checked,
    };

    try {
        let response;
        if (editId) {
            response = await fetch(`/admin/offers/${editId}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' }
            })

        } else {
            console.log('Hello add offer ');
            response = await fetch('/admin/offers/', {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const data = await response.json();

        if (response.ok) {
             // Assuming showToast is globally available
            showToast('success', data.customMessage || 'Offer saved successfully');
            
            // NOTE: Unlike coupon.ejs, we are not manually updating the table row for ADD/EDIT success.
            // A page reload might be needed, or the updated EJS row needs to be re-rendered.
            // For now, only close the modal and show success toast.
            
            offerModal.classList.add('hidden');
            window.location.reload(); // Simple solution for updating the table

        } else {
            // Handle server-side validation or error message
            showToast('error', data.customMessage || 'Failed to save offer.');
        }


    } catch (error) {
        console.log('Error in form submission', error);
        offerModal.classList.add('hidden')
        showToast('error', 'An unexpected error occurred.');

    }
})

function closeModal() {
    offerModal.classList.add('hidden')
    return
}


// block offer

async function blockOffer(offerId) {
    try {
        // Assuming sweetAlert is globally available
        const result = await sweetAlert('warning', 'Are you sure ? ', 'You are about to block this Offer', true, true)

        if (result.isConfirmed) {
            const response = await fetch(`/admin/offers/block/${offerId}`, {
                method: 'PATCH'
            })

            if (response.ok) {
                await sweetAlert('success', 'Blocked', 'Offer has been successfully blocked', false, false, 1000)

                const offerRow = document.getElementById(`${offerId}`)
                const blockBtn = document.getElementById(`blockBtn-${offerId}`);
                const unblockBtn = document.getElementById(`unblockBtn-${offerId}`);
                const statusBtn = document.getElementById(`statusBtn-${offerId}`);
                const mobileBlockBtn = document.getElementById(`mobile-blockBtn-${offerId}`);
                const mobileUnblockBtn = document.getElementById(`mobile-unblockBtn-${offerId}`);
                const mobileStatusBtn = document.getElementById(`mobile-statusBtn-${offerId}`);
                
                // Desktop
                if (blockBtn) blockBtn.classList.add('hidden');
                if (unblockBtn) unblockBtn.classList.remove('hidden');
                if (statusBtn) {
                    statusBtn.textContent = 'Inactive';
                    statusBtn.classList.remove('bg-green-900/50', 'text-green-300');
                    statusBtn.classList.add('bg-red-900/50', 'text-red-300');
                }
                
                // Mobile
                if (mobileBlockBtn) mobileBlockBtn.classList.add('hidden');
                if (mobileUnblockBtn) mobileUnblockBtn.classList.remove('hidden');
                if (mobileStatusBtn) {
                    mobileStatusBtn.textContent = 'Inactive';
                    mobileStatusBtn.classList.remove('bg-green-900/50', 'text-green-300');
                    mobileStatusBtn.classList.add('bg-red-900/50', 'text-red-300');
                }

            } else {
                throw new Error('Failed to Block the Offer')
            }
        }
    } catch (error) {
        showToast('error', 'Something went wrong');
        console.log('Error in block Offer', error);
    }
}

// unblock offer

async function unblockOffer(offerId) {
    console.log('Call inside unblock offer');
    try {
         // Assuming sweetAlert is globally available
        const result = await sweetAlert('warning', 'Are you sure ? ', 'You are about to unblock this Offer', true, true)

        if (result.isConfirmed) {
            const response = await fetch(`/admin/offers/unblock/${offerId}`, {
                method: 'PATCH'
            })

            if (response.ok) {
                await sweetAlert('success', 'Unblocked', 'Offer has been successfully unblocked', false, false, 1000)

                const offerRow = document.getElementById(`${offerId}`)
                const blockBtn = document.getElementById(`blockBtn-${offerId}`);
                const unblockBtn = document.getElementById(`unblockBtn-${offerId}`);
                const statusBtn = document.getElementById(`statusBtn-${offerId}`);
                const mobileBlockBtn = document.getElementById(`mobile-blockBtn-${offerId}`);
                const mobileUnblockBtn = document.getElementById(`mobile-unblockBtn-${offerId}`);
                const mobileStatusBtn = document.getElementById(`mobile-statusBtn-${offerId}`);

                // Desktop
                if (blockBtn) blockBtn.classList.remove('hidden');
                if (unblockBtn) unblockBtn.classList.add('hidden');
                if (statusBtn) {
                    statusBtn.textContent = 'Active';
                    statusBtn.classList.remove('bg-red-900/50', 'text-red-300');
                    statusBtn.classList.add('bg-green-900/50', 'text-green-300');
                }
                
                // Mobile
                if (mobileBlockBtn) mobileBlockBtn.classList.remove('hidden');
                if (mobileUnblockBtn) mobileUnblockBtn.classList.add('hidden');
                if (mobileStatusBtn) {
                    mobileStatusBtn.textContent = 'Active';
                    mobileStatusBtn.classList.remove('bg-red-900/50', 'text-red-300');
                    mobileStatusBtn.classList.add('bg-green-900/50', 'text-green-300');
                }

            } else {
                throw new Error('Failed to unblock the Offer')
            }
        }
    } catch (error) {
        showToast('error', 'Something went wrong')
        console.log('Error in unblock Offer', error);
    }
}

// delete offer


async function deleteOffer(offerId) {
    console.log('Call inside delete offer');
    try {
         // Assuming sweetAlert is globally available
        const result = await sweetAlert('warning', 'Are you sure ? ', 'You are about to delete this Offer', true, true)

        if (result.isConfirmed) {
            const response = await fetch(`/admin/offers/${offerId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                await sweetAlert('success', 'Deleted', 'Offer has been successfully deleted', false, false, 1000)

                const offerRow = document.getElementById(`${offerId}`)
                const deleteBtn = document.getElementById(`deleteBtn-${offerId}`);
                const restoreBtn = document.getElementById(`restoreBtn-${offerId}`);
                const statusBtn = document.getElementById(`statusBtn-${offerId}`);
                const mobileDeleteBtn = document.getElementById(`mobile-deleteBtn-${offerId}`);
                const mobileRestoreBtn = document.getElementById(`mobile-restoreBtn-${offerId}`);
                const mobileStatusBtn = document.getElementById(`mobile-card-${offerId}`).querySelector('.px-3.py-1'); // Status span in mobile card

                // Desktop
                if (statusBtn) {
                    statusBtn.textContent = 'Deleted';
                    statusBtn.classList.remove('bg-green-900/50', 'text-green-300', 'bg-red-900/50'); // remove active/inactive green/red
                    statusBtn.classList.add('bg-red-900/50', 'text-red-300'); // set to red for deleted
                }
                if (offerRow) offerRow.classList.add('bg-gray-600');
                if (deleteBtn) deleteBtn.classList.add('hidden');
                if (restoreBtn) restoreBtn.classList.remove('hidden');

                // Mobile
                if (mobileStatusBtn) {
                     mobileStatusBtn.textContent = 'Deleted';
                     mobileStatusBtn.classList.remove('bg-green-900/50', 'text-green-300');
                     mobileStatusBtn.classList.add('bg-red-900/50', 'text-red-300');
                }
                if (mobileDeleteBtn) mobileDeleteBtn.classList.add('hidden');
                if (mobileRestoreBtn) mobileRestoreBtn.classList.remove('hidden');


            } else {
                throw new Error('Failed to delete the Offer')
            }
        }
    } catch (error) {
        showToast('error', 'Something went wrong')
        console.log('Error in delete Offer', error);
    }
}


// restore offer

async function restoreOffer(offerId) {
    console.log('Call inside restore offer');
    try {
         // Assuming sweetAlert is globally available
        const result = await sweetAlert('warning', 'Are you sure ? ', 'You are about to restore this Offer', true, true)

        if (result.isConfirmed) {
            const response = await fetch(`/admin/offers/restore/${offerId}`, {
                method: 'PATCH'
            })

            if (response.ok) {
                const data = await response.json()
                await sweetAlert('success', 'Restored', 'Offer has been successfully restored', false, false, 1000)
                
                const offerRow = document.getElementById(`${offerId}`)
                const deleteBtn = document.getElementById(`deleteBtn-${offerId}`);
                const restoreBtn = document.getElementById(`restoreBtn-${offerId}`);
                const statusBtn = document.getElementById(`statusBtn-${offerId}`);
                const mobileDeleteBtn = document.getElementById(`mobile-deleteBtn-${offerId}`);
                const mobileRestoreBtn = document.getElementById(`mobile-restoreBtn-${offerId}`);
                const mobileStatusBtn = document.getElementById(`mobile-card-${offerId}`).querySelector('.px-3.py-1');

                const newStatus = data.updatedOffer.isActive ? 'Active' : 'Inactive';
                const newBgClass = data.updatedOffer.isActive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300';

                // Desktop
                if (statusBtn) {
                    statusBtn.textContent = newStatus;
                    statusBtn.classList.remove('bg-red-900/50', 'text-red-300', 'bg-green-900/50', 'text-green-300');
                    statusBtn.classList.add(...newBgClass.split(' '));
                }
                if (offerRow) offerRow.classList.remove('bg-gray-600'); // Remove deleted background
                if (restoreBtn) restoreBtn.classList.add('hidden');
                if (deleteBtn) deleteBtn.classList.remove('hidden');
                
                // Mobile
                if (mobileStatusBtn) {
                    mobileStatusBtn.textContent = newStatus;
                    mobileStatusBtn.classList.remove('bg-red-900/50', 'text-red-300', 'bg-green-900/50', 'text-green-300');
                    mobileStatusBtn.classList.add(...newBgClass.split(' '));
                }
                if (mobileRestoreBtn) mobileRestoreBtn.classList.add('hidden');
                if (mobileDeleteBtn) mobileDeleteBtn.classList.remove('hidden');

            } else {
                throw new Error('Failed to restore the Offer')
            }
        }
    } catch (error) {
        showToast('error', 'Something went wrong')
        console.log('Error in restore Offer', error);
    }
}

//------------- filter Management ------------//
let filterMode = false;
const offerFilter =  document.getElementById('offerFilter')
offerFilter.addEventListener('click', async()=>{
  if(offerFilter.value.trim()!== ''){
    filterMode = true;
    loadFilter()
  }
})


async function loadFilter(pageNumber=1){
  console.log('hello peter');
  try {
    const offer= offerFilter.value;
    searchTerm = document.getElementById('searchInput').value.trim();
    const response = await fetch(`/admin/offers/filter?offer=${offer}&page=${pageNumber}&searchTerm=${searchTerm}`);
    const data = await response.json()
    const offers = data.offers
    renderOffersDesktop(offers);
    renderOffersTablet(offers);
    renderOffersMobile(offers);
  } catch (error) {
    console.log('Error in load Filter',error);
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

   let previousOffers = [];
  
   /**
   * Loads all categories initially for fallback rendering
   */

   async function loadOffers() {
     
     const res = await fetch('/admin/offers/loadOffers');
     const data = await res.json();
     previousOffers = data.offers;
     console.log('previousOffers',previousOffers);
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
          const offersContainerDesktop=document.getElementById('offersContainerDesktop');
          const offersContainerTablet = document.getElementById('offersContainerTablet');
          const offersContainerMobile = document.getElementById('offersContainerMobile');
   
          offersContainerDesktop.innerHTML = '<div class="text-center py-8" > Searching... </div> '
          offersContainerTablet.innerHTML = '<div class="text-center py-8" > Searching... </div> '
          offersContainerMobile.innerHTML = '<div class="text-center py-8" > Searching... </div> '
   
          if (searchTerm === '') {
            renderOffersDesktop(previousOffers);
            renderOffersTablet(previousOffers);
            renderOffersMobile(previousOffers);
   
            return;
          }
          console.log('search term',searchTerm);
          // Remove special characters that may break backend
          if(/[*%$?\\]/.test(searchTerm)){ 
            searchTerm=searchTerm.replaceAll(/[*%$?\\]/g,'').trim()
          }
          
          const response = await fetch(`/admin/offers/search?searchTerm=${encodeURIComponent(searchTerm)}`);
   
          if (!response.ok) throw new Error('Search Failed')
      
          const data = await response.json();
          const offers = data.offers;
          console.log('Trouble offers',offers);
          renderOffersDesktop(offers);
          renderOffersTablet(offers);
          renderOffersMobile(offers);
   
        } catch (error) {
          console.log('Error in get handleSearch', error);
          offersContainerDesktop.innerHTML = '<div class="text-center py-8 text-red-500" > Error Loading Results </div>'
          offersContainerTablet.innerHTML = '<div class="text-center py-8 text-red-500" > Error Loading Results </div>'
          offersContainerMobile.innerHTML = '<div class="text-center py-8 text-red-500" > Error Loading Results </div>'
          
        }
       }

         /**
        * Handles pagination
        * @param {String} pageNumber
        */

        async function loadURL(pageNumber){
            try {
            console.log('Search term in loadUrl Orders',searchTerm);
            const response = await fetch(`/admin/offers/search?searchTerm=${encodeURIComponent(searchTerm)}&page=${pageNumber}`);
            const data = await response.json();
            const offers = data.offers;
            renderOffersDesktop(offers);
            renderOffersTablet(offers);
            renderOffersMobile(offers);
            } catch (error) {
            console.log('Error in loadURL',error);
            }
        }


        /**
        * Renders category list dynamically
        * @param {Array} categories
        */

    async function renderOffersDesktop(offers){
        try {
        const offersContainerDesktop = document.getElementById('offersContainerDesktop');
        
        if(!offers || offers.length==0){
        
            offersContainerDesktop.innerHTML = '<div class="text-center py-8 text-gray-400">No Offers found</div>';
    
        return
        }
        
        
        offersContainerDesktop.innerHTML='';
    
    
        offers.forEach((o,i)=>{
        
            const orderRow = document.createElement('tr');
        
    
            orderRow.style.animation = `slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${i * 0.1}s`;
    
            orderRow.innerHTML = `
        
            <tr id="${o._id}" class=" border-b  ${o.isDelete ?'bg-gray-600':'' }  border-gray-800 hover:bg-[#191a19] slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${i * 0.1}s transition">

                <td class="index px-3 py-5">${i+1}</td>

                <td class="title px-3 py-5 font-semibold">${o.offerTitle}</td>

                <td class="offerType px-3 py-5 capitalize">
                  ${o.offerType}
                </td>

                <td class="target px-4 py-5 text-sm text-gray-400 truncate max-w-[150px]">
                  ${o.targetName || 'N/A'}
                </td>

                <td class="discount px-4 py-5">
                  <div class="font-medium">${o.discountValue}${o.discountType === 'percentage' ? '%' : '₹'}</div>
                  <div class="text-xs text-gray-400 capitalize">${o.discountType}</div>
                </td>

                <td class="date px-4 py-5 text-sm text-gray-400">
                  <div>${new Date(o.validFrom).toLocaleDateString()}</div>
                  <div>${new Date(o.validTo).toLocaleDateString()}</div>
                </td>

                <td class="px-4 py-5">
                  <span id="statusBtn-${o._id}"  class="px-3 py-1 rounded-full text-xs font-medium

                    ${o.isDelete ? 'bg-red-900/50 text-red-300' : (o.isActive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300') }">

                    ${o.isDelete ? 'Deleted' : (o.isActive ? 'Active' : 'Inactive')}
                </span>
                </td>

                <td class="px-4 py-5 flex gap-2 items-center">

                  <i class="fa-solid fa-pen cursor-pointer hover:text-gray-300
                  ${o.isDeleted ? 'opacity-50 pointer-events-none':''}"
                  style="color: #ffffff;" onclick="openModal( 'edit','${JSON.stringify(o)}' )"></i>

                  <i id="blockBtn-${o._id}" class="fa-solid fa-lock cursor-pointer hover:text-red-300
                  ${o.isDeleted ? 'opacity-50 pointer-events-none':''}
                  ${o.isActive ? '' : 'hidden'}"
                  style="color: #cc2424;" onclick="blockOffer('${o._id }')"></i>


                  <i id="unblockBtn-${o._id}" class="fa-solid fa-lock-open cursor-pointer hover:text-green-300
                  ${o.isActive ? 'hidden':''}"
                  style="color: #04a978;" onclick="unblockOffer('${o._id }')"></i>

                  <i id="deleteBtn-${o._id}"  class="fa-solid fa-trash cursor-pointer hover:text-red-300 ${o.isDelete ? 'hidden' : ''}"
                    style="color: #ffffff;" onclick="deleteOffer('${o._id }')"></i>

                  <i id="restoreBtn-${o._id}" class="fa-solid fa-trash-arrow-up cursor-pointer hover:text-red-400 ${o.isDelete ? '' : 'hidden'}"
                  style="color: #ff0000;" onclick="restoreOffer('${o._id}')"></i>

                </td>

              </tr>
        `;
    
        offersContainerDesktop.appendChild(orderRow)
        })
        } catch (error) {
        console.log('Error in rendering offers',error);
        }
    }



    async function renderOffersTablet(offers){
        try {
        const offersContainerTablet = document.getElementById('offersContainerTablet');
        
        if(!offers || offers.length==0){
        
            offersContainerTablet.innerHTML = '<div class="text-center py-8 text-gray-400">No Offers found</div>';
    
        return
        }
        
        
        offersContainerTablet.innerHTML='';
    
    
        offers.forEach((o,i)=>{
        
            const orderRow = document.createElement('tr');
        
    
            orderRow.style.animation = `slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${i * 0.1}s`;
    
            orderRow.innerHTML = `
        
            <tr id="tablet-${o._id}" class="border-b ${o.isDelete ?'bg-gray-600':'' } border-gray-800 hover:bg-[#191a19] transition">
                    <td class="px-3 py-4">
                      <div class="font-semibold">${o.offerTitle}</div>
                      <div class="text-xs text-gray-400 capitalize mt-1">${o.offerType} Offer</div>
                    </td>
                    <td class="px-3 py-4 text-gray-400 text-xs truncate max-w-[120px]">
                      ${o.targetName || 'N/A'}
                    </td>
                    <td class="px-3 py-4">
                      <div class="font-medium">${o.discountValue}${o.discountType === 'percentage' ? '%' : '₹'}</div>
                      <div class="text-xs text-gray-400 capitalize">${o.discountType}</div>
                    </td>
                    <td class="px-3 py-4 text-xs text-gray-400">
                      <div>${new Date(o.validFrom).toLocaleDateString}</div>
                      <div>${new Date(o.validTo).toLocaleDateString()}</div>
                    </td>
                    <td class="px-3 py-4">
                      <span id="tablet-statusBtn-${o._id}" class="px-2 py-1 rounded-full text-xs font-medium ${ o.isDelete ? 'bg-red-900/50 text-red-300' : (o.isActive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300') }">
                        ${o.isDelete ? 'Deleted' : (o.isActive ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td class="px-3 py-4">
                      <div class="flex gap-2 items-center">
                        <i class="fa-solid fa-pen cursor-pointer hover:text-gray-300 ${o.isDeleted ? 'opacity-50 pointer-events-none':''}" style="color: #ffffff;" onclick="openModal('edit','${JSON.stringify(o)}')"></i>
                        <i id="tablet-blockBtn-${o._id}" class="fa-solid fa-lock cursor-pointer hover:text-red-300 ${o.isDeleted ? 'opacity-50 pointer-events-none':''} ${o.isActive ? '' : 'hidden'}" style="color: #cc2424;" onclick="blockOffer('${ o._id }')"></i>
                        <i id="tablet-unblockBtn-${o._id}" class="fa-solid fa-lock-open cursor-pointer hover:text-green-300 ${o.isActive ? 'hidden':''}" style="color: #04a978;" onclick="unblockOffer('${ o._id }')"></i>
                        <i id="tablet-deleteBtn-${o._id}" class="fa-solid fa-trash cursor-pointer hover:text-red-300 ${ o.isDelete ? 'hidden' : ''}" style="color: #ffffff;" onclick="deleteOffer('${o._id }')"></i>
                        <i id="tablet-restoreBtn-${o._id}" class="fa-solid fa-trash-arrow-up cursor-pointer hover:text-red-400 ${ o.isDelete ? '' : 'hidden'}" style="color: #ff0000;" onclick="restoreOffer('${o._id }')"></i>
                      </div>
                    </td>
                  </tr>
        `;
    
        offersContainerTablet.appendChild(orderRow)
        })
        } catch (error) {
        console.log('Error in rendering offers',error);
        }
    }
   
   
   async function renderOffersMobile(offers){
     try {
      const offersContainerMobile = document.getElementById('offersContainerMobile');
      
      if(!offers || offers.length==0){
        
        offersContainerMobile.innerHTML = '<div class="text-center py-8 text-gray-400">No Order found</div>';
    
       return
      }
      
      
      offersContainerMobile.innerHTML='';
    
    
       offers.forEach((o,i)=>{
       
        const orderRow = document.createElement('div');
        
         orderRow.className="bg-black border border-white/30 rounded-xl p-4 space-y-3 transform transition-all duration-500 hover:scale-[1.01]"
          orderRow.style.animation = `slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${i * 0.1}s`;
    
          orderRow.innerHTML = `
       
          <div class="flex justify-between items-center pb-2 border-b border-gray-800">
          <span class="text-xs font-semibold bg-gray-800 px-2 py-1 rounded text-gray-300"># ${i+1}</span>
          <span class="text-xs text-gray-500">
            ${new Date(o.validFrom).toLocaleDateString()} -
            ${new Date(o.validTo).toLocaleDateString()}
          </span>
        </div>

        <div class="text-lg sm:text-xl text-gray-300 font-bold">${o.offerTitle}</div>

        <div class="flex justify-between items-center text-sm">
          <div>
            <p class="text-gray-400 text-xs mb-1">Type</p>
            <p class="font-semibold capitalize">${o.offerType} Offer</p>
          </div>
          <div class="text-right">
            <p class="text-gray-400 text-xs mb-1">Discount</p>
            <p class="font-semibold">
              ${o.discountValue}${o.discountType === 'percentage' ? '%' : '₹'} off
            </p>
          </div>
        </div>
        
        <div class="flex justify-between items-center pt-2 border-t border-gray-800">
          <div>
            <p class="text-gray-400 text-xs mb-1">Target</p>
            <p class="text-white font-medium text-sm truncate max-w-[180px]">${o.targetName || 'N/A' }</p>
          </div>

          <span id="mobile-statusBtn-${o._id}" class="px-2 sm:px-3 py-1 text-xs rounded-full font-medium
            ${o.isActive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300' }">
            ${o.isActive?'Active':'Inactive'}
          </span>
        </div>

        <div class="flex gap-3 sm:gap-4 pt-3 border-t border-gray-800">
          <button onclick="openModal('edit','${JSON.stringify(o)}')"
            class="text-base sm:text-lg text-white hover:text-gray-300 ${o.isDeleted ? 'opacity-50 pointer-events-none':''}"
            aria-label="Edit Offer">
            <i class="fa-solid fa-pen"></i>
          </button>

          <button onclick="blockOffer('${ o._id }')"
            class="text-base sm:text-lg text-red-500 hover:text-red-300 ${o.isDeleted ? 'opacity-50 pointer-events-none':''} ${o.isActive ? '' : 'hidden'}"
            id="mobile-blockBtn-${o._id}" aria-label="Block Offer">
            <i class="fa-solid fa-lock"></i>
          </button>
          <button onclick="unblockOffer('${ o._id }')"
            class="text-base sm:text-lg text-green-500 hover:text-green-300 ${o.isActive ? 'hidden':''}"
            id="mobile-unblockBtn-${o._id}" aria-label="Unblock Offer">
            <i class="fa-solid fa-lock-open"></i>
          </button>

          <button onclick="deleteOffer('${o._id }')"
            class="text-base sm:text-lg text-red-400 hover:text-red-200 ${o.isDeleted ? 'hidden' : ''}"
            id="mobile-deleteBtn-${o._id}" aria-label="Delete Offer">
            <i class="fa-solid fa-trash"></i>
          </button>
          <button onclick="restoreOffer('${o._id }')"
            class="text-base sm:text-lg text-red-600 hover:text-red-400 ${o.isDeleted ? '' : 'hidden'}"
            id="mobile-restoreBtn-${o._id}" aria-label="Restore Offer">
            <i class="fa-solid fa-trash-arrow-up"></i>
          </button>
        </div>
       `;
    
       offersContainerMobile.appendChild(orderRow)
      })
     } catch (error) {
       console.log('Error in rendering offers',error);
     }
    }
   