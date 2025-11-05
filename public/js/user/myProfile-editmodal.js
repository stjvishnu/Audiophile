

const myProfileEditModal=document.getElementById('myProfileEditModal')
const profileToUpdate=document.getElementById('profile-info')
const profileForm = document.getElementById('profileForm');
const mainProfileName = document.getElementById('mainProfileName');
const mainProfileImg = document.getElementById('mainProfileImg');
const loginUserEmail = document.getElementById('loginUserEmail')


const changePassword = document.getElementById('changePassword');
changePassword.addEventListener('click',()=>{
  
  const passwordInputs=document.querySelectorAll('.pw');
  passwordInputs.forEach((input)=>input.classList.remove('hidden'))
})


profileForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  const validation=validationCheckBeforeSubmit()
  if(!validation){
    showToast('error','Recheck your inputs before saving')
    return
  }
  
  console.log('Form clicked');
  
  const profilePreview = myProfileEditModal.querySelector('#profilePreview')
  const firstName=myProfileEditModal.querySelector('#firstName').value;
  const lastName=myProfileEditModal.querySelector('#lastName').value;
  const email=myProfileEditModal.querySelector('#email').value;
  const mobile=myProfileEditModal.querySelector('#mobile').value;

  const currentPassword = myProfileEditModal.querySelector('#currentPassword')?.value;
  const newPassword = myProfileEditModal.querySelector('#newPassword')?.value;
  const confirmPassword = myProfileEditModal.querySelector('#confirmPassword')?.value;
  const userEmail = loginUserEmail.value;
  const isEmailChanged = email ==userEmail;

  const formData = new FormData();

  formData.append('userEmail', userEmail);
  formData.append('firstName', firstName);
  formData.append('lastName', lastName);
  formData.append('mobile', mobile);

  if (currentPassword && newPassword && confirmPassword) {
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);
  }


  const imageFile = myProfileEditModal.querySelector('#profileImageInput').files[0]
 
  
  if(imageFile){
    formData.append('profileImg',imageFile)
  }
  // console.log(imageFile);
  console.log('Form Data',Object.fromEntries(formData.entries()));

  try{
    if(!isEmailChanged){
      formData.append('newEmail', email);
 

    axios.post('/user/profile/request-email-change',formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then((response)=>{
      document.getElementById('profileForm').reset();
      window.location.href = response.data.redirectUrl;    
    })
    .catch((err)=>{
      console.log('Error in updating email',err);
      const message = err.response.data.customMessage || 'Something went wrong!';
      showToast('error',message)
    })
    }else{
      axios.post('/user/profile',formData,{headers: { 'Content-Type': 'multipart/form-data'}})
    .then((response)=>{
      document.getElementById('profileForm').reset();
      document.querySelectorAll('.pw input').forEach(input => input.value = '');

      const user= response.data.user;
      myProfileEditModal.classList.add('hidden');
      document.body.style.position = '';
      console.log(profileToUpdate);
      mainProfileName.textContent= `${user.firstName} ${user.lastName}`
      mainProfileImg.src= user.profileImg || 'https://res.cloudinary.com/dsvedpviz/image/upload/v1762330777/Gemini_Generated_Image_ggevjtggevjtggev_s9c1kb.png'


;
      profileToUpdate.querySelector('#firstName').textContent=user.firstName
      profileToUpdate.querySelector('#lastName').textContent=user.lastName
      profileToUpdate.querySelector('#email').textContent=user.email
      profileToUpdate.querySelector('#mobile').textContent=user.mobile
      profileToUpdate.querySelector('#loginUserEmail').value=user.email;
      console.log('Trouble shooting',profileToUpdate.querySelector('#profilePreview'));
      profileToUpdate.querySelector('#profilePreview').src=user.profileImg || 'https://res.cloudinary.com/dsvedpviz/image/upload/v1762330777/Gemini_Generated_Image_ggevjtggevjtggev_s9c1kb.png'


;
      document.body.style.position = '';
      showToast('success',response.data.customMessage)
  
    })
    .catch((err)=>{
      console.log('Erro in submitting profile data');
      document.body.style.position = '';
      console.log(err);
      const message = err.response?.data?.customMessage || 'Something went wrong!';
      showToast('error',message)
      document.body.style.position = '';
    })
    }

  }
  
  catch(err){
    console.error('Error in submitting profile data', err);
    showToast('error', err.response?.data?.customMessage || 'Error updating profile');
  }


})



function closeEditModal() {
  document.getElementById('myProfileEditModal').classList.add('hidden');
  const passwordInputs=document.querySelectorAll('.pw');
  passwordInputs.forEach((input)=>input.classList.add('hidden'))
  document.body.style.position = '';
}