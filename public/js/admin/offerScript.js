const offerHeader = document.getElementById('offerHeader');
const addeditBtn = document.getElementById('addeditBtn'); // This button is used in EJS file
const offerModal = document.getElementById('offerModal')
const offerForm = document.getElementById('offerForm')


let editId = null;
const modalTitle        = offerModal.querySelector("#modalTitle");
const title             = offerModal.querySelector("#title");
const description       = offerModal.querySelector("textarea#description");
const offerType         = offerModal.querySelector("#offerType");
const targetId          = offerModal.querySelector("#targetId");
const discountType      = offerModal.querySelector("#discountType");
const discountValue     = offerModal.querySelector("#discountValue");

const dateInputs        = offerModal.querySelectorAll("input[type='datetime-local']");
const validFrom         = dateInputs[0];
const validTo           = dateInputs[1];

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

            validFrom.value = new Date(offerData.validFrom).toISOString().slice(0, 16);
            validTo.value = new Date(offerData.validTo).toISOString().slice(0, 16);
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
        validFrom: validFrom.value,
        validTo: validTo.value,
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