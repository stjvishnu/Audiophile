document.addEventListener('DOMContentLoaded',()=>{
  const urlParams=new URLSearchParams(window.location.search)
  const toastType=urlParams.get('toastType');
  const message = urlParams.get('toastMessage');
  if(toastType&&message){
    showToast(toastType,message)
  
  }
  
  
})

const myProfile=document.getElementById('myProfile');
const profileInfo = document.getElementById('profile-info');
console.log(myProfile);
myProfile.addEventListener('click',()=>{
  console.log('Profile clicked');
  console.log(profileInfo);
  
  
})
console.log('Hello');