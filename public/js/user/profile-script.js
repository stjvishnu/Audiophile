document.addEventListener('DOMContentLoaded',()=>{
  const urlParams=new URLSearchParams(window.location.search)
  const toastType=urlParams.get('toastType');
  const message = urlParams.get('toastMessage');
  if(toastType&&message){
    showToast(toastType,message)
  
  }
  
  const show = urlParams.get('show');
  if(show==='orders'){
    ordersBtn.click();
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  
})

const myProfile=document.getElementById('myProfile');
const profileInfo = document.getElementById('profile-info');
console.log(myProfile);
myProfile.addEventListener('click',()=>{
  console.log('Profile clicked');
  console.log(profileInfo);
  profileInfo.classList.remove('hidden')
  
})
console.log('Hello');

//address management 

const addressBtn = document.getElementById('addressBtn');
const addressPage = document.getElementById('addressPage');
const hello = document.getElementById('hello')

addressBtn.addEventListener('click',async(e)=>{
  console.log('Address btn clicked');
  e.preventDefault();
  console.log('page',addressPage);
  // console.log('hello',hello);
  // hello.innerHTML=''
  profileInfo.classList.add('hidden')
  addressPage.classList.remove('hidden');
  // document.body.style.position = 'fixed';

})
//________________________________________________________________________

//address add 
const addressModal = document.getElementById('addressModal');
const addressForm = document.getElementById('addressForm');
const modalTitle =  document.getElementById('modalTitle');
const addAddressBtn = document.getElementById('addAddressBtn')
let addressId;


addAddressBtn.addEventListener('click',async (e)=>{
  e.preventDefault();
  modalTitle.textContent='Add New Address';
  addressForm.dataset.mode='add'
  document.getElementById('formSubmitBtn').textContent = 'Save Address';
  addressForm.reset();
  document.getElementById('addressId').value='';
  addressModal.classList.remove('hidden')
  document.body.style.overflow = 'hidden'
})

//address edit
async function openAddressModal(addressId){
  try{
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
  
    const mode = addressForm.dataset.mode;
     addressId = document.getElementById('addressId').value;
     console.log('Hello address Id',addressId);
    // let response;
    // let message;
    if(mode=='add'){
      console.log('call inside add');
      const response= await axios.post('/user/profile/address',formData);
       const newAddress = response.data.newAddress;
       addNewAddress(newAddress);
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
    }
    
    
  }
  }catch(err){
    console.log('Error in sumbitting address form',err)
    const message = err.response.data.customMessage || 'Something went try wrong..!'
    showToast('error',message)
  }


})

function addNewAddress(newAddress){
 const addressContaner = document.getElementById('address-list')
 const addressCard= document.createElement('div')

 addressCard.innerHTML=`
 <div id='address-${newAddress._id}' class="border-2 border-gray-200 rounded-2xl p-6 min-h-[280px] hover:border-black transition-all cursor-pointer relative group">
 <div class="flex items-start justify-between mb-4">
   <div class="flex-1">
     <h3 class="name font-bold text-lg text-gray-900 mb-1">${newAddress.name}</h3>
     <p class="mobile text-sm text-gray-600">${newAddress.mobile}</p>
   </div>
   <button onclick="openAddressModal('${newAddress._id}')"
     class="text-gray-400 hover:text-black transition-colors">
     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
         d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
     </svg>
   </button>
 </div>

 <div class="space-y-2 text-sm text-gray-700">
   <p class="houseName">${newAddress.houseName}</p>
   <p class="streetName">${newAddress.streetName}</p>
   <p class="locality">${newAddress.locality}</p>
   <p class="landmark text-gray-500">${newAddress.landmark}</p>
   <p class="zip font-medium">${newAddress.city}, ${newAddress.state} - ${newAddress.pincode}</p>
 </div>

 <button id="defaultAddressBtn" onclick="setDefaultAddress('${newAddress._id}')" data-address-id="${newAddress._id}"
   class="absolute bottom-6 left-6 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
   <i class="fa-solid fa-thumbtack " style="color:${newAddress.isDefault? '#000000':'#caccce'}"
        ></i>
   

 </button>

 <button id="deleteAddressBtn" onclick="deleteAddress('${newAddress._id}')"  data-address-id="${newAddress._id}"
   class="absolute bottom-6 right-6 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
       d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
   </svg>
 </button>
</div>
 `
 addressContaner.appendChild(addressCard)
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
    addressCard.querySelector('.zip').textContent=` ${updatedAddress.city} ${updatedAddress.state} ${updatedAddress.pincode}`

  }
}


function closeAddressModal() {
  document.getElementById('addressModal').classList.add('hidden');
  // const passwordInputs=document.querySelectorAll('.pw');
  // passwordInputs.forEach((input)=>input.classList.add('hidden'))
  document.body.style.overflow = ''; 
  clearErrors();
}


async function setDefaultAddress(addressId){
  try{
    const response = await axios.patch(`/user/profile/address/${addressId}`)
    const address = response.data.address;
    if(address){
      const addressList = document.getElementById('address-list')
      const defaultIcons= addressList.querySelectorAll('#defaultAddressBtn i')
      console.log('default-icons',defaultIcons);
      defaultIcons.forEach((i)=>i.style.color='#caccce')
      const addressCard = document.getElementById(`address-${addressId}`)
      const defaultIcon=addressCard.querySelector('#defaultAddressBtn i')
      defaultIcon.style.color='#000000'

      const addressCards=document.querySelectorAll(".addressCard");
      console.log(addressCards);
      addressCards.forEach(card => {
        card.classList.remove('border-black');
        card.classList.add('border-gray-200');
      }); 

      addressCard.classList.remove('border-gray-200');
      addressCard.classList.add('border-black')

      showToast('success','Default address set')
    }
  }catch(err){

  }
}

async function deleteAddress(addressId){
  try{

    const result = await Swal.fire({
      title: 'Are you sure ? ',
      text: `You are about to delete this Address.! `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes`,
      background: '#1a1a1a',
      color: "#fff"
    })

    if (result.isConfirmed) {
      const response = await axios.delete(`/user/profile/address/${addressId}`)
      const message = response.data.customMessage;
      if(message){
        const addressCard = document.getElementById(`address-${addressId}`)
        addressCard.remove();
        await Swal.fire({
          title: `Deleted`,
          text: `Address Deleted Successfully.!`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: "#1a1a1a",
          color: "#fff"
        })
      }
      const updatedDefaultAddress=response.data.updatedDefaultAddress;
      if(updatedDefaultAddress){
        const addressCard = document.getElementById(`address-${updatedDefaultAddress._id}`)
        const defaultIcon=addressCard.querySelector('#defaultAddressBtn i')
        defaultIcon.style.color='#000000'

      }
      }else{
        throw new Error('Failed to delete the address')
      }

  }catch(err){
    console.log('Error in deleting address',err);
    showToast('error','Something went wrong while deleting the address. Try again.')
  }
}


