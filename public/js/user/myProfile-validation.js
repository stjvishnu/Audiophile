

document.addEventListener('DOMContentLoaded',()=>{
  console.log('got inside validation');
  const firstNameContainer = myProfileEditModal.querySelector('#firstName');

  const lastNameContainer = myProfileEditModal.querySelector('#lastName');
  const emailContainer = myProfileEditModal.querySelector('#email');
  const mobileContainer = myProfileEditModal.querySelector('#mobile');
  const currentPasswordContainer = myProfileEditModal.querySelector('#currentPassword');
  const newPasswordContainer = myProfileEditModal.querySelector('#newPassword');
  const confirmPasswordContainer = myProfileEditModal.querySelector('#confirmPassword')

  
  firstNameContainer.addEventListener('blur',()=>{
    console.log('blur firstname');
      const firstName= firstNameContainer.value.trim();
      if(!firstName) {
      showError('firstName', "First Name is Required");
      isValid = false;
  } else if(/^\s|\s{2,}|\s$/.test(firstName)) {
      showError('firstName', "Can't start/end with spaces or have multiple spaces");
      isValid = false;
  } else if(firstName.replace(/\s+/g,'').length < 2) {
      showError('firstName', "First Name must be at least 2 characters");
      isValid = false;
  } else if(!/^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/.test(firstName)) {
      showError('firstName', "First Name should contain only characters");
      isValid = false;
  } else if(firstName.replace(/\s+/g,'').length > 15) {
      showError('firstName', "Maximum length is 15 characters (excluding spaces)");
      isValid = false;
  }
  })

  //Last name

  lastNameContainer.addEventListener('blur',()=>{
      const lastName= lastNameContainer.value.trim();
      if(!lastName) {
      showError('lastName', "Last Name required");
      isValid = false;
  } else if(/^\s|\s{2,}|\s$/.test(lastName)) {
      showError("lastName", "Cannot start/end with spaces or have multiple spaces");
      isValid = false;
  } else if(!/^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/.test(lastName)) {
      showError('lastName', "Last Name should contain only characters");
      isValid = false;
  } else if(lastName.replace(/\s+/g,'').length < 2) {
      showError('lastName', "Last Name must be at least 2 characters");
      isValid = false;
  } else if(lastName.replace(/\s+/g,'').length > 15) {
      showError('lastName', "Maximum length is 15 characters (excluding spaces)");
      isValid = false;
  }
  })

  //Email

  emailContainer.addEventListener('blur',()=>{
      const email= emailContainer.value.trim();
      if(!email) {
      showError('email', "Email required");
      isValid = false;
  } else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('email', "Please enter a valid email address");
      isValid = false;
  } else if(email.length > 254) {
      showError('email', "Please enter a valid email address");
      isValid = false;
  } else if(/\.{2,}/.test(email) || /@.{0,1}$/.test(email)) {
      showError('email', 'Invalid email format');
      isValid = false;
  } else if(/(\..*\.)|(^\.)|(\.$)/.test(email.split('@')[0])) {
      showError('email', 'Invalid dots in email name');
      isValid = false;
  }
  })

  //Mobile number
  
  mobileContainer.addEventListener('blur',()=>{
      const mobile= mobileContainer.value.trim();
      if(!mobile) {
      showError('mobile', "Mobile number is required");
      isValid = false;
  } else if(/[a-zA-Z]/.test(mobile)) {
      showError('mobile', "Cannot contain letters");
      isValid = false;
  } else if(/[^\d\s()+-]/.test(mobile)) {
      showError('mobile', "Only numbers, spaces, +,-,() are allowed");
      isValid = false;
  } else {
      const cleanedMobile = mobile.replace(/\D/g,'');
      if(cleanedMobile.length < 10) {
          showError('mobile', "Must contain at least 10 digits");
          isValid = false;
      } else if(cleanedMobile.length > 10) {
          showError('mobile', "Cannot exceed 10 digits");
          isValid = false;
      } else if(/^0+$/.test(cleanedMobile)) {
          showError('mobile', "Cannot be all zeroes");
          isValid = false;
      } else if(/^(\d)\1{9,14}$/.test(cleanedMobile)) {
          showError('mobile', 'Cannot be all repeating digits');
          isValid = false;
      }
  }
  })




  //password
  
  currentPasswordContainer.addEventListener('blur',()=>{
    console.log('Call inside currentpassword contaniier');
      const currentPassword= currentPasswordContainer.value.trim();
      if(!currentPassword) {
      showError('currentPassword', "currentPassword is required");
      isValid = false;
  } else {
      if(currentPassword !== currentPassword.trim()) {
          showError("currentPassword", "currentPassword cannot contain spaces");
          isValid = false;
      } else if(currentPassword.length < 8) {
          showError("currentPassword", "currentPassword must be at least 8 characters");
          isValid = false;
      } else if(currentPassword.length > 64) {
          showError("currentPassword", "currentPassword cannot exceed 64 characters");
          isValid = false;
      } else if(!/[A-Z]/.test(currentPassword)) {
          showError("currentPassword", "currentPassword must contain at least one uppercase letter (A-Z)");
          isValid = false;
      } else if(!/[a-z]/.test(currentPassword)) {
          showError("currentPassword", "currentPassword must contain at least one lowercase letter (a-z)");
          isValid = false;
      } else if(!/[0-9]/.test(currentPassword)) {
          showError("currentPassword", "currentPassword must contain at least one number (0-9)");
          isValid = false;
      } else if(!/[^a-zA-Z0-9]/.test(currentPassword)) {
          showError("currentPassword", "currentPassword must contain at least one special character (!@#$%^&*)");
          isValid = false;
      }
  }
  })

  newPasswordContainer.addEventListener('blur',()=>{
    const newPassword= newPasswordContainer.value.trim();
    if(!newPassword) {
    showError('newPassword', "New Password is required");
    isValid = false;
} else {
    if(newPassword !== newPassword.trim()) {
        showError("newPassword", "newPassword cannot contain spaces");
        isValid = false;
    } else if(newPassword.length < 8) {
        showError("newPassword", "newPassword must be at least 8 characters");
        isValid = false;
    } else if(newPassword.length > 64) {
        showError("newPassword", "newPassword cannot exceed 64 characters");
        isValid = false;
    } else if(!/[A-Z]/.test(newPassword)) {
        showError("newPassword", "newPassword must contain at least one uppercase letter (A-Z)");
        isValid = false;
    } else if(!/[a-z]/.test(newPassword)) {
        showError("newPassword", "newPassword must contain at least one lowercase letter (a-z)");
        isValid = false;
    } else if(!/[0-9]/.test(newPassword)) {
        showError("newPassword", "newPassword must contain at least one number (0-9)");
        isValid = false;
    } else if(!/[^a-zA-Z0-9]/.test(newPassword)) {
        showError("newPassword", "newPassword must contain at least one special character (!@#$%^&*)");
        isValid = false;
    }
}
})
confirmPasswordContainer.addEventListener('blur',()=>{
    const confirmPassword= confirmPasswordContainer.value.trim();
    if(!confirmPassword) {
    showError('confirmPassword', "Confirm Password is required");
    isValid = false;
} else {
    if(confirmPassword !== confirmPassword.trim()) {
        showError("confirmPassword", "confirmPassword cannot contain spaces");
        isValid = false;
    } else if(confirmPassword.length < 8) {
        showError("confirmPassword", "confirmPassword must be at least 8 characters");
        isValid = false;
    } else if(confirmPassword.length > 64) {
        showError("confirmPassword", "confirmPassword cannot exceed 64 characters");
        isValid = false;
    } else if(!/[A-Z]/.test(confirmPassword)) {
        showError("confirmPassword", "confirmPassword must contain at least one uppercase letter (A-Z)");
        isValid = false;
    } else if(!/[a-z]/.test(confirmPassword)) {
        showError("confirmPassword", "confirmPassword must contain at least one lowercase letter (a-z)");
        isValid = false;
    } else if(!/[0-9]/.test(confirmPassword)) {
        showError("confirmPassword", "confirmPassword must contain at least one number (0-9)");
        isValid = false;
    } else if(!/[^a-zA-Z0-9]/.test(confirmPassword)) {
        showError("confirmPassword", "confirmPassword must contain at least one special character (!@#$%^&*)");
        isValid = false;
    }
}
})

  //confirm password

  confirmPasswordContainer.addEventListener('blur',()=>{
      const confirmPassword= confirmPasswordContainer.value.trim();
      const newPassword= newPasswordContainer.value.trim();
      if(confirmPassword !== newPassword) {
      showError('confirmPassword', "Passwords do not match");
      isValid = false;
  }
  })



  firstNameContainer.addEventListener('focus',()=>{
      removeError('firstName')
  })
  lastNameContainer.addEventListener('focus',()=>{
      removeError('lastName')
  })
  emailContainer.addEventListener('focus',()=>{
      removeError('email')
  }) 
  mobileContainer.addEventListener('focus',()=>{
      removeError('mobile')
  }) 
  currentPasswordContainer.addEventListener('focus',()=>{
      removeError('currentPassword')
  }) 
  newPasswordContainer.addEventListener('focus',()=>{
      removeError('newPassword')
  }) 
  confirmPasswordContainer.addEventListener('focus',()=>{
      removeError('confirmPassword')
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
  const firstName = myProfileEditModal.querySelector('#firstName').value;
  const lastName = myProfileEditModal.querySelector('#lastName').value;
  const email= myProfileEditModal.querySelector('#email').value;
  const mobile = myProfileEditModal.querySelector('#mobile').value;
  const currentPassword = myProfileEditModal.querySelector('#currentPassword').value;
  const newPassword= myProfileEditModal.querySelector('#newPassword').value;
  const confirmPassword = myProfileEditModal.querySelector('#confirmPassword').value;

  // Clear previous errors
  clearErrors();

  // Validation starts here
  let isValid = true;

  // First Name Validation
  
  if(!firstName) {
      showError('firstName', "First Name is Required");
      isValid = false;
  } else if(/^\s|\s{2,}|\s$/.test(firstName)) {
      showError('firstName', "Can't start/end with spaces or have multiple spaces");
      isValid = false;
  } else if(firstName.replace(/\s+/g,'').length < 2) {
      showError('firstName', "First Name must be at least 2 characters");
      isValid = false;
  } else if(!/^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/.test(firstName)) {
      showError('firstName', "First Name should contain only characters");
      isValid = false;
  } else if(firstName.replace(/\s+/g,'').length > 15) {
      showError('firstName', "Maximum length is 15 characters (excluding spaces)");
      isValid = false;
  }

  // Last Name Validation
  if(!lastName) {
      showError('lastName', "Last Name required");
      isValid = false;
  } else if(/^\s|\s{2,}|\s$/.test(lastName)) {
      showError("lastName", "Cannot start/end with spaces or have multiple spaces");
      isValid = false;
  } else if(!/^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/.test(lastName)) {
      showError('lastName', "Last Name should contain only characters");
      isValid = false;
  } else if(lastName.replace(/\s+/g,'').length < 2) {
      showError('lastName', "Last Name must be at least 2 characters");
      isValid = false;
  } else if(lastName.replace(/\s+/g,'').length > 15) {
      showError('lastName', "Maximum length is 15 characters (excluding spaces)");
      isValid = false;
  }

  // Email Validation
  if(!email) {
      showError('email', "Email required");
      isValid = false;
  } else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('email', "Please enter a valid email address");
      isValid = false;
  } else if(email.length > 254) {
      showError('email', "Please enter a valid email address");
      isValid = false;
  } else if(/\.{2,}/.test(email) || /@.{0,1}$/.test(email)) {
      showError('email', 'Invalid email format');
      isValid = false;
  } else if(/(\..*\.)|(^\.)|(\.$)/.test(email.split('@')[0])) {
      showError('email', 'Invalid dots in email name');
      isValid = false;
  }

  // Mobile Validation
  if(!mobile) {
      showError('mobile', "Mobile number is required");
      isValid = false;
  } else if(/[a-zA-Z]/.test(mobile)) {
      showError('mobile', "Cannot contain letters");
      isValid = false;
  } else if(/[^\d\s()+-]/.test(mobile)) {
      showError('mobile', "Only numbers, spaces, +,-,() are allowed");
      isValid = false;
  } else {
      const cleanedMobile = mobile.replace(/\D/g,'');
      if(cleanedMobile.length < 10) {
          showError('mobile', "Must contain at least 10 digits");
          isValid = false;
      } else if(cleanedMobile.length > 10) {
          showError('mobile', "Cannot exceed 10 digits");
          isValid = false;
      } else if(/^0+$/.test(cleanedMobile)) {
          showError('mobile', "Cannot be all zeroes");
          isValid = false;
      } else if(/^(\d)\1{9,14}$/.test(cleanedMobile)) {
          showError('mobile', 'Cannot be all repeating digits');
          isValid = false;
      }
  }

  if(currentPassword || newPassword || confirmPassword){
    // Password Validation
  if(!currentPassword) {
    showError('currentPassword', "current Password is required");
    isValid = false;
} else {
    if(currentPassword !== currentPassword.trim()) {
        showError("currentPassword", "currentPassword cannot contain spaces");
        isValid = false;
    } else if(currentPassword.length < 8) {
        showError("currentPassword", "currentPassword must be at least 8 characters");
        isValid = false;
    } else if(currentPassword.length > 64) {
        showError("currentPassword", "currentPassword cannot exceed 64 characters");
        isValid = false;
    } else if(!/[A-Z]/.test(currentPassword)) {
        showError("currentPassword", "currentPassword must contain at least one uppercase letter (A-Z)");
        isValid = false;
    } else if(!/[a-z]/.test(currentPassword)) {
        showError("currentPassword", "currentPassword must contain at least one lowercase letter (a-z)");
        isValid = false;
    } else if(!/[0-9]/.test(currentPassword)) {
        showError("currentPassword", "currentPassword must contain at least one number (0-9)");
        isValid = false;
    } else if(!/[^a-zA-Z0-9]/.test(currentPassword)) {
        showError("currentPassword", "currentPassword must contain at least one special character (!@#$%^&*)");
        isValid = false;
    }
}

if(!confirmPassword) {
    showError('confirmPassword', "Confrirm Password is required");
    isValid = false;
} else {
    if(confirmPassword !== confirmPassword.trim()) {
        showError("confirmPassword", "confirmPassword cannot contain spaces");
        isValid = false;
    } else if(confirmPassword.length < 8) {
        showError("confirmPassword", "confirmPassword must be at least 8 characters");
        isValid = false;
    } else if(confirmPassword.length > 64) {
        showError("confirmPassword", "confirmPassword cannot exceed 64 characters");
        isValid = false;
    } else if(!/[A-Z]/.test(confirmPassword)) {
        showError("confirmPassword", "confirmPassword must contain at least one uppercase letter (A-Z)");
        isValid = false;
    } else if(!/[a-z]/.test(confirmPassword)) {
        showError("confirmPassword", "confirmPassword must contain at least one lowercase letter (a-z)");
        isValid = false;
    } else if(!/[0-9]/.test(confirmPassword)) {
        showError("confirmPassword", "confirmPassword must contain at least one number (0-9)");
        isValid = false;
    } else if(!/[^a-zA-Z0-9]/.test(confirmPassword)) {
        showError("confirmPassword", "confirmPassword must contain at least one special character (!@#$%^&*)");
        isValid = false;
    }
}

if(!newPassword) {
    showError('newPassword', "New Password is required");
    isValid = false;
} else {
    if(newPassword !== newPassword.trim()) {
        showError("newPassword", "newPassword cannot contain spaces");
        isValid = false;
    } else if(newPassword.length < 8) {
        showError("newPassword", "newPassword must be at least 8 characters");
        isValid = false;
    } else if(newPassword.length > 64) {
        showError("newPassword", "newPassword cannot exceed 64 characters");
        isValid = false;
    } else if(!/[A-Z]/.test(newPassword)) {
        showError("newPassword", "newPassword must contain at least one uppercase letter (A-Z)");
        isValid = false;
    } else if(!/[a-z]/.test(newPassword)) {
        showError("newPassword", "newPassword must contain at least one lowercase letter (a-z)");
        isValid = false;
    } else if(!/[0-9]/.test(newPassword)) {
        showError("newPassword", "newPassword must contain at least one number (0-9)");
        isValid = false;
    } else if(!/[^a-zA-Z0-9]/.test(newPassword)) {
        showError("newPassword", "newPassword must contain at least one special character (!@#$%^&*)");
        isValid = false;
    }
}

// Confirm Password Validation
if(newPassword !== confirmPassword) {
    showError('confirmPassword', "Passwords do not match");
    isValid = false;
}
  }

  

  function showError(field_id, message) {
    const error_div = document.getElementById(field_id + '-error');
    error_div.textContent = message;
    error_div.classList.replace('invisible', 'visible');
}

function clearErrors() {
    const errorElements = document.querySelectorAll('[id$="-error"]');
    errorElements.forEach(element => {
        element.textContent = '';
        element.classList.replace('visible', 'invisible');
    });
}

return isValid
}





// if(!isValid) {
//   submitBtn.disabled = false;
//   submitBtn.textContent = 'Create Account';
//   return;
// }