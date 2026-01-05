console.log('script loaded');

const addressModal = document.getElementById('addressModal');
const addressForm = document.getElementById('addressForm');
const modalTitle =  document.getElementById('modalTitle');
const addAddressBtn = document.getElementById('addAddressBtn')
let addressId;


// addAddressBtn.addEventListener('click',async (e)=>{
//   e.preventDefault();
//   modalTitle.textContent='Add New Address';
//   addressForm.dataset.mode='add'
//   document.getElementById('formSubmitBtn').textContent = 'Save Address';
//   addressForm.reset();
//   document.getElementById('addressId').value='';
//   addressModal.classList.remove('hidden')
//   document.body.style.overflow = 'hidden'
// })

//address edit
async function openAddressEditModal(addressId){
  try{

    console.log('addressId',addressId);
    const response = await axios.get(`/user/profile/address/${addressId}`);
    const address = response.data.address;

    console.log(address);

    modalTitle.textContent='Edit Address';
    addressForm.dataset.mode='edit';
    document.getElementById('addressId').value=address._id;

    addressModal.querySelector('#name').value = address.name 
    addressModal.querySelector('#mobile').value = address.mobile
    addressModal.querySelector('#pincode').value =address.pincode
    addressModal.querySelector('#locality').value =address.locality
    addressModal.querySelector('#streetName').value = address.streetName
    addressModal.querySelector('#houseName').value = address.houseName
    addressModal.querySelector('#city').value = address.city
    addressModal.querySelector('#state').value = address.state
    addressModal.querySelector('#landmark').value = address.landmark || ''

    document.getElementById('formSubmitBtn').textContent = 'Update Address';

    document.getElementById('addressesModal').classList.add('hidden');
    document.getElementById('addressModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';

  }catch(error){
    console.log('Error in accessing edit address data',error);
    showToast('error', 'Failed to load address');
  }
}


//form submission
addressForm.addEventListener('submit', async(e)=>{
  e.preventDefault();



  console.log('Call inside form');

  const isValid = validationCheckBeforeSubmitAddress();
  if(!isValid){
    showToast('error','Recheck the input fields')
    return
  }

  try{
    const name = addressModal.querySelector('#name').value
    const mobile = addressModal.querySelector('#mobile').value
    const pincode = addressModal.querySelector('#pincode').value
    const locality = addressModal.querySelector('#locality').value
    const streetName = addressModal.querySelector('#streetName').value
    const houseName = addressModal.querySelector('#houseName').value
    const city = addressModal.querySelector('#city').value
    const state = addressModal.querySelector('#state').value
    const landmark = addressModal.querySelector('#landmark').value
  
    const formData = {
      name:name,
      mobile:mobile,
      pincode:pincode,
      locality:locality,
      streetName:streetName,
      houseName:houseName,
      city:city,
      state:state,
      landmark:landmark||'',
    }
    console.log('fomr data',formData);
    const mode = addressForm.dataset.mode;
     addressId = document.getElementById('addressId').value;
     console.log('Hello address Id',addressId);
    // let response;
    // let message;
    if(mode=='add'){
      console.log('call inside add');
      console.log('gonna add address');
      
      const response= await axios.post('/user/profile/address',formData);
      console.log('hi response in adding address',response);
       const newAddress = response.data.newAddress;
       const selectedAddressContainer =document.getElementById('selectedAddress')
       const addressIdExist = selectedAddressContainer.dataset.addressId;
       if(!addressIdExist){
        addNewAddress(newAddress);
       }
      
     const  message = response.data.customMessage;
       if(message){
         showToast('success',message);
         closeAddressModal()
       }
    }else{
      console.log('call inside edit');
      console.log('AddressId',addressId);
       const response= await axios.put(`/user/profile/address/${addressId}`,formData);
       const updatedAddress = response.data.updatedAddress;
       updateAddress(updatedAddress,addressId);
       const message = response.data.customMessage;
    if(message){
      showToast('success',message);
      closeAddressModal()
      document.getElementById('addressesModal').classList.remove('hidden');
    }
    
    
  }
  }catch(err){
    console.log('Error in sumbitting address form',err)
    const message = err.response.data.customMessage || 'Something went try wrong..!'
    showToast('error',message)
  }


})

function addNewAddress(newAddress){
 const addressContaner = document.getElementById('selectedAddress')
 const addressCard= document.createElement('div')

 addressCard.innerHTML=`
 <p class="fullName font-semibold text-gray-900">${newAddress.name }</p>
 <span class="houseName text-gray-700 mt-1.5">${newAddress.houseName },</span>
 <span class="streetName text-gray-700">${newAddress.streetName },</span>
 <span class="locality text-gray-700">${newAddress.locality },</span>
 ${newAddress.landmark?
  ` <span class="landmark text-gray-600 mt-0.5">Near ${newAddress.landmark }</span>`
 : ''}
 <p class="text-sm font-medium text-gray-900">
   <span class="city">${newAddress.city }</span>,
   <span class="state">${newAddress.state }</span>
   - <span class="pincode">${newAddress.pincode }</span>
 </p>
 <p class="mobile text-gray-600">${newAddress.mobile }</p>
 `
 addressContaner.appendChild(addressCard)
 addressContaner.dataset.addressId=newAddress._id
 document.getElementById('noAddressTag').classList.add('hidden')
}

function updateAddress(updatedAddress,addressId){
  console.log('Call inside updateaddress');
  console.log('address id inside updateAddress',`address-${addressId}`);
  const addressCard = document.getElementById(`address-${addressId}`)
  console.log('addressCard',addressCard);
  if(addressCard){
    addressCard.querySelector('.name').textContent=updatedAddress.name;
    addressCard.querySelector('.mobile').textContent=updatedAddress.mobile;
    addressCard.querySelector('.houseName').textContent=updatedAddress.houseName;
    addressCard.querySelector('.streetName').textContent=updatedAddress.streetName;
    addressCard.querySelector('.locality').textContent=updatedAddress.locality;
    addressCard.querySelector('.landmark').textContent=updatedAddress.landmark;
    addressCard.querySelector('.pincode').textContent=` ${updatedAddress.city} ${updatedAddress.state} ${updatedAddress.pincode}`

  }
}


function closeAddressModal() {
  console.log('call inisde close address modal');
  document.getElementById('addressModal').classList.add('hidden');
  // const passwordInputs=document.querySelectorAll('.pw');
  // passwordInputs.forEach((input)=>input.classList.add('hidden'))
  document.body.style.overflow = ''; 
  clearErrors();
}


async function setDefaultAddress(addressId){
  console.log('Call inside set default address');
  try{
    const response = await axios.patch(`/user/profile/address/${addressId}`)
    const address = response.data.address;
    if(address){
      const selectedAddressContainer=document.getElementById('selectedAddress')
       selectedAddressContainer.dataset.addressId = addressId;
      showToast('success','Default address updated successfully')
    }
  }catch(err){
    console.log('Error in setting default address');
  }
}
