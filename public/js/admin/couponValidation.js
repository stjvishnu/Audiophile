

document.addEventListener('DOMContentLoaded',()=>{
  console.log('got inside validation');
  const couponModal = document.getElementById('couponModal')
  console.log(couponModal);
  const couponCodeContainer = couponModal.querySelector('#couponCode');
  const discountTypeContainer = couponModal.querySelector('#discountType');
  const descriptionContainer = couponModal.querySelector('#description');
  const discountValueContainer = couponModal.querySelector('#discountValue');
  const minPurchaseContainer = couponModal.querySelector('#minPurchase');
  const maxDiscountContainer = couponModal.querySelector('#maxDiscount');
  const validFromContainer = couponModal.querySelector('#validFrom')
  const validToContainer = couponModal.querySelector('#validTo')
  const perUserLimitContainer = couponModal.querySelector('#perUserLimit')

  
  couponCodeContainer.addEventListener('blur',()=>{
    console.log('blur coupon code');
      const code= couponCodeContainer.value.trim();
      if(!code) {
      showError('couponCode', "Coupon is Required");
      isValid = false;
  } else if(/^\s|\s{2,}|\s$/.test(code)) {
      showError('couponCode', "Can't start/end with spaces or have multiple spaces");
      isValid = false;
  } else if(code.replace(/\s+/g,'').length < 2) {
      showError('couponCode', "Coupon must be at least 4 characters");
      isValid = false;
  } 
 else if(code.replace(/\s+/g,'').length > 15) {
      showError('couponCode', "Maximum length is 15 characters (excluding spaces)");
      isValid = false;
  }else{
    generateCoupon()
  }
  })

  //Last name

  discountTypeContainer.addEventListener('blur',()=>{
      const discountType= discountTypeContainer.value.trim();
      if (!discountType) {
        showError('discountType', "Discount type required");
      }
      if(discountType=='percentage'){
        document.getElementById('maxDiscountContainer').classList.remove('hidden')
        document.getElementById('maxDiscountContainer').disabled=false
        if(!discountType) {
          showError('discountType', "Discount type required");
          isValid = false;
       }else if(/^\s|\s{2,}|\s$/.test(discountType)) {
        showError("discountType", "Cannot start/end with spaces or have multiple spaces");
       }
       else if (maxDiscount <= 0) {
        showError('maxDiscount', "Must be greater than 0");
        isValid = false;
      }
      }
       if(discountType=='fixed') {
    console.log('hello');
    document.getElementById('maxDiscountContainer').classList.add('hidden')
    document.getElementById('maxDiscountContainer').disabled=true
  }
   
 })



  descriptionContainer.addEventListener('blur',()=>{
      const description= descriptionContainer.value.trim();
      if(!description) {
      showError('description', "description required");
      isValid = false;
  }  else if(description.length > 254) {
      showError('description', "Please enter a valid description address");
      isValid = false;
  } else if(/\.{2,}/.test(description) || /@.{0,1}$/.test(description)) {
      showError('description', 'Invalid description format');
      isValid = false;
  } 
  })

  discountValueContainer.addEventListener('blur',()=>{
    const discountValue= discountValueContainer.value.trim();
    const discountType= discountTypeContainer.value.trim();
    if(!discountValue) {
    showError('discountValue', "discount Value required");
    isValid = false;
}  else if(discountValue<1) {
    showError('discountValue', "Discount value can't be less than 0");
    isValid = false;

}
else if(discountType=='percentage'){
 if(parseInt(discountValue)>99) {
  showError('discountValue', "Discount value can't be greater than 99%");
  isValid = false;
 }
}
else if(/[a-zA-Z]/.test(discountValue)) {
  showError('discountValue', "Cannot contain letters");
  isValid = false;
} 
})

minPurchaseContainer.addEventListener('blur',()=>{
  const minPurchase= minPurchaseContainer.value.trim();

  if(!minPurchase) {
  showError('minPurchase', "Minimum purchase required");
  isValid = false;
}  else if(minPurchase<1) {
  showError('minPurchase', "Minimum purchase can't be less than 1");
  isValid = false;
} 
else if(/[a-zA-Z]/.test(minPurchase)) {
showError('minPurchase', "Cannot contain letters");
isValid = false;
} 
})


maxDiscountContainer.addEventListener('blur',()=>{
  const maxDiscount= maxDiscountContainer.value.trim();
  const minPurchase= minPurchaseContainer.value.trim();
  const discountValue= discountValueContainer.value.trim();
  const requiredMinPurchase = maxDiscount/(discountValue/100)
  if(!maxDiscount) {
  showError('maxDiscount', "Maximum discount required");
  isValid = false;
  }
// }  else if(minPurchase){
//   if(minPurchase<requiredMinPurchase) {
//     showError('minPurchase', `Minimum purchase must be at least ₹${Math.ceil(requiredMinPurchase)}`);
//     isValid = false;
//   }
// }
 
else if(maxDiscount<0) {
  showError('maxDiscount', "Maximum discount can't be less than 1");
  isValid = false;
}
else if(/[a-zA-Z]/.test(maxDiscount)) {
showError('maxDiscount', "Cannot contain letters");
isValid = false;
} 
})



perUserLimitContainer.addEventListener('blur',()=>{
  const perUserLimit= perUserLimitContainer.value.trim();
  if(!perUserLimit) {
  showError('perUserLimit', "User limit required");
  isValid = false;
}  else if(perUserLimit<0) {
  showError('perUserLimit', "User limit can't be less than 0");
  isValid = false;
}else if(/[a-zA-Z]/.test(perUserLimit)) {
showError('perUserLimit', "Cannot contain letters");
isValid = false;
} 
})




  couponCodeContainer.addEventListener('focus',()=>{
      removeError('couponCode')
  })
  descriptionContainer.addEventListener('focus',()=>{
      removeError('description')
  })
  discountTypeContainer.addEventListener('focus',()=>{
      removeError('discountType')
  })
  discountValueContainer.addEventListener('focus',()=>{
      removeError('discountValue')
  }) 
  minPurchaseContainer.addEventListener('focus',()=>{
      removeError('minPurchase')
  }) 
  maxDiscountContainer.addEventListener('focus',()=>{
      removeError('maxDiscount')
  }) 
  validFromContainer.addEventListener('focus',()=>{
      removeError('validFrom')
  }) 
  validToContainer.addEventListener('focus',()=>{
      removeError('validTo')
  }) 
  perUserLimitContainer.addEventListener('focus',()=>{
      removeError('perUserLimit')
  }) 

  function showError(field_id, message) {
    console.log('Call inside show error');
      const error_div = document.getElementById(field_id + '-error');
      console.log(error_div);
      error_div.textContent = message;
      error_div.classList.replace('invisible', 'visible');
  }



  function removeError(errType){
      const error_div = document.getElementById(errType + '-error');
      error_div.classList.replace('visible', 'invisible');

  }
})

function validationCheckBeforeSubmit(){
  console.log('Call inside Validation check before submit ');
  const code = couponModal.querySelector('#couponCode').value;
  const discountType = couponModal.querySelector('#discountType').value;
  const description = couponModal.querySelector('#description').value;
  const discountValue = couponModal.querySelector('#discountValue').value;
  const minPurchase = couponModal.querySelector('#minPurchase').value;
  const maxDiscount = couponModal.querySelector('#maxDiscount').value;
  const validFrom = couponModal.querySelector('#validFrom').value
  const validTo = couponModal.querySelector('#validTo').value
  const perUserLimit = couponModal.querySelector('#perUserLimit').value.trim();
  console.log('perUserLimit',perUserLimit);


  // Clear previous errors
  clearErrors();

  // Validation starts here
  let isValid = true;

  // First Name Validation
  
  if(!code) {
    showError('couponCode', "Coupon is Required");
    isValid = false;
} else if(/^\s|\s{2,}|\s$/.test(code)) {
    showError('couponCode', "Can't start/end with spaces or have multiple spaces");
    isValid = false;
} 
else if(code.replace(/\s+/g,'').length > 15) {
    showError('couponCode', "Maximum length is 15 characters (excluding spaces)");
    isValid = false;
}


if (!discountType) {
  showError('discountType', "Discount type required");
  isValid= false;
}
if(discountType=='percentage'){
  document.getElementById('maxDiscountContainer').classList.remove('hidden')
  document.getElementById('maxDiscountContainer').disabled=false
  if(!discountType) {
    showError('discountType', "Discount type required");
    isValid = false;
 }else if(/^\s|\s{2,}|\s$/.test(discountType)) {
  showError("discountType", "Cannot start/end with spaces or have multiple spaces");
 }
 else if (maxDiscount <= 1) {
  showError('maxDiscount', "Must be greater than 0");
  isValid = false;
}
}
 if(discountType=='fixed') {
console.log('hello');
document.getElementById('maxDiscountContainer').classList.add('hidden')
document.getElementById('maxDiscountContainer').disabled=true
}


if(!description) {
  showError('description', "description required");
  isValid = false;
}  else if(description.length > 254) {
  showError('description', "Please enter a valid description address");
  isValid = false;
} else if(/\.{2,}/.test(description) || /@.{0,1}$/.test(description)) {
  showError('description', 'Invalid description format');
  isValid = false;
} 


  if(!discountValue) {
    showError('discountValue', "discount Value required");
    isValid = false;
}  else if(discountValue<1) {
    showError('discountValue', "Discount value can't be less than 1");
    isValid = false;
}else if(/[a-zA-Z]/.test(discountValue)) {
  showError('discountValue', "Cannot contain letters");
  isValid = false;
}else if(discountType=='percentage' && discountValue>99){
  showError('discountValue', "Discount percentage cannot exceed 99%");
}else if(discountType=='percentage' && minPurchase<1){
  showError('minPurchase', `Minimum purchase cannot be less than 1 `);
}else if(discountType=='fixed' && discountValue<0){
  showError('minPurchase', "discount value cannot be less than 1");
}



if(!minPurchase) {
  showError('minPurchase', "Minimum purchase required");
  isValid = false;
}  else if(minPurchase<1) {
  showError('minPurchase', "Minimum purchase can't be less than 1");
  isValid = false;
}else if(/[a-zA-Z]/.test(minPurchase)) {
showError('mobile', "Cannot contain letters");
isValid = false;
}else if(discountType ==='fixed' && Number(discountValue)>Number(minPurchase)){
  console.log('inisde trouble shooting');
  isValid=false;
  showError('discountValue','Discount value should be less than minimum purchase')
}




if(!validFrom){
  showError('validFrom','Please select a valid date')
  isValid = false;
}

const today = new Date();
today.setHours(0,0,0,0); //makes 00:00 am 

if(new Date(validFrom)<today){
  showError('validFrom','Start date cannot be a day before today')
  isValid = false;
}



if(!validTo){
  showError('validTo','Please select a valid date')
  isValid = false;
}

if(isNaN(new Date(validTo).getTime())){
  showError('validTo', "Please select a valid expiry date");
  isValid = false;
}
console.log('hello mwonu 1');
if(new Date(validTo)<new Date(validFrom)){
  showError('validTo', "Expiry date must be AFTER start date");
  isValid = false;
}

console.log('hello mwonu 2');

if(!perUserLimit) {
  showError('perUserLimit', "User limit required");
  isValid = false;
}  else if(Number(perUserLimit)<0) {
  showError('perUserLimit', "User limit can't be less than 0");
  isValid = false;
}else if(/[a-zA-Z]/.test(perUserLimit)) {
showError('perUserLimit', "Cannot contain letters");
isValid = false;
} 


function showError(field_id, message) {
  
  const error_div = couponModal.querySelector(`#${field_id}-error`);
  error_div.textContent = message;
  error_div.classList.replace('invisible', 'visible');
}

function clearErrors() {
  const errorElements = couponModal.querySelectorAll('[id$="-error"]');
  errorElements.forEach(element => {
      element.textContent = '';
      element.classList.replace('visible', 'invisible');
  });
}

return isValid
}


function generateCoupon(){
  const couponModal = document.getElementById('couponModal');
  const couponCodeContainer = couponModal.querySelector('#couponCode');
  const code= couponCodeContainer.value.trim()
  const prefix = code!==''?code.toUpperCase():'COUP'
  const randomPart = Math.random().toString(36).substring(2,8).toUpperCase();
  const couponCode = prefix+'-'+randomPart;
  couponCodeContainer.value=couponCode

}