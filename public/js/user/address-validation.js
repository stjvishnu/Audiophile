document.addEventListener('DOMContentLoaded', () => {
  console.log('Setting up address form validation');
  
  // Select all required form containers/inputs for the address form
  const nameContainer = addressModal.querySelector('#name');
  const mobileContainer = addressModal.querySelector('#mobile');
  const pincodeContainer = addressModal.querySelector('#pincode');
  const localityContainer = addressModal.querySelector('#locality');
  const streetNameContainer = addressModal.querySelector('#streetName');
  const houseNameContainer = addressModal.querySelector('#houseName');
  const cityContainer = addressModal.querySelector('#city');
  const stateContainer = addressModal.querySelector('#state');
  const landmarkContainer = addressModal.querySelector('#landmark'); // Optional, but included for listeners

  let isValid = true; // Initialize a local isValid variable

  // --- Real-time Validation (on blur) ---

  // Name Validation
  nameContainer.addEventListener('blur', () => {
      const name = nameContainer.value.trim();
      isValid = true;
      if (!name) {
          showError('name', "Name is Required");
          isValid = false;
      } else if (/^\s|\s{2,}|\s$/.test(name)) {
          showError('name', "Can't start/end with spaces or have multiple spaces");
          isValid = false;
      } else if (name.replace(/\s+/g, '').length < 2) {
          showError('name', "Name must be at least 2 characters");
          isValid = false;
      } else if (!/^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/.test(name)) {
          showError('name', "Name should contain only characters");
          isValid = false;
      } else if (name.replace(/\s+/g, '').length > 20) {
          showError('name', "Maximum length is 20 characters (excluding spaces)");
          isValid = false;
      }
  });

  // Mobile Number Validation (reusing your existing logic)
  mobileContainer.addEventListener('blur', () => {
      const mobile = mobileContainer.value.trim();
      isValid = true;
      if (!mobile) {
          showError('mobile', "Mobile number is required");
          isValid = false;
      } else if (/[a-zA-Z]/.test(mobile)) {
          showError('mobile', "Cannot contain letters");
          isValid = false;
      } else if (/[^\d\s()+-]/.test(mobile)) {
          showError('mobile', "Only numbers, spaces, +,-,() are allowed");
          isValid = false;
      } else {
          const cleanedMobile = mobile.replace(/\D/g, '');
          if (cleanedMobile.length < 10) {
              showError('mobile', "Must contain at least 10 digits");
              isValid = false;
          } else if (cleanedMobile.length > 10) {
              showError('mobile', "Cannot exceed 10 digits");
              isValid = false;
          } else if (/^0+$/.test(cleanedMobile)) {
              showError('mobile', "Cannot be all zeroes");
              isValid = false;
          } else if (/^(\d)\1{9,14}$/.test(cleanedMobile)) {
              showError('mobile', 'Cannot be all repeating digits');
              isValid = false;
          }
      }
  });

  // Pincode Validation
  pincodeContainer.addEventListener('blur', () => {
      const pincode = pincodeContainer.value.trim();
      isValid = true;
      if (!pincode) {
          showError('pincode', "Pincode is required");
          isValid = false;
      } else if (!/^\d{6}$/.test(pincode)) {
          showError('pincode', "Pincode must be a 6-digit number");
          isValid = false;
      }
  });

  // Locality Validation
  localityContainer.addEventListener('blur', () => {
      const locality = localityContainer.value.trim();
      isValid = true;
      if (!locality) {
          showError('locality', "Locality/Area is required");
          isValid = false;
      } else if (locality.length < 3) {
          showError('locality', "Locality must be at least 3 characters");
          isValid = false;
      } else if (locality.length > 50) {
          showError('locality', "Locality cannot exceed 50 characters");
          isValid = false;
      }
  });
  
  // Street Name Validation
  streetNameContainer.addEventListener('blur', () => {
      const streetName = streetNameContainer.value.trim();
      isValid = true;
      if (!streetName) {
          showError('streetName', "Street Name is required");
          isValid = false;
      } else if (streetName.length < 5) {
          showError('streetName', "Street Name must be at least 5 characters");
          isValid = false;
      } else if (streetName.length > 100) {
          showError('streetName', "Street Name cannot exceed 100 characters");
          isValid = false;
      }
  });
  
  // House Name/Number Validation
  houseNameContainer.addEventListener('blur', () => {
      const houseName = houseNameContainer.value.trim();
      isValid = true;
      if (!houseName) {
          showError('houseName', "House Name/No. is required");
          isValid = false;
      } else if (houseName.length < 2) {
          showError('houseName', "House Name/No. must be at least 2 characters");
          isValid = false;
      } else if (houseName.length > 50) {
          showError('houseName', "House Name/No. cannot exceed 50 characters");
          isValid = false;
      }
  });

  // City Validation
  cityContainer.addEventListener('blur', () => {
      const city = cityContainer.value.trim();
      isValid = true;
      if (!city) {
          showError('city', "City is required");
          isValid = false;
      } else if (!/^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/.test(city)) {
          showError('city', "City should contain only characters");
          isValid = false;
      } else if (city.length < 2 || city.length > 30) {
          showError('city', "City must be between 2 and 30 characters");
          isValid = false;
      }
  });
  
  // State Validation
  stateContainer.addEventListener('blur', () => {
      const state = stateContainer.value.trim();
      isValid = true;
      if (!state) {
          showError('state', "State is required");
          isValid = false;
      } else if (!/^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/.test(state)) {
          showError('state', "State should contain only characters");
          isValid = false;
      } else if (state.length < 2 || state.length > 30) {
          showError('state', "State must be between 2 and 30 characters");
          isValid = false;
      }
  });

  landmarkContainer.addEventListener('blur',()=>{
    const landmark = landmarkContainer.value.trim();
    if (landmark && landmark.length < 2) {
      showError('landmark', "Landmark too short");
      isValid = false;
    }
  })
  
  // Landmark Validation (Optional, so only set focus listener for error removal)
  
  // --- Error Removal on Focus ---

  nameContainer.addEventListener('focus', () => { removeError('name') });
  mobileContainer.addEventListener('focus', () => { removeError('mobile') });
  pincodeContainer.addEventListener('focus', () => { removeError('pincode') });
  localityContainer.addEventListener('focus', () => { removeError('locality') });
  streetNameContainer.addEventListener('focus', () => { removeError('streetName') });
  houseNameContainer.addEventListener('focus', () => { removeError('houseName') });
  cityContainer.addEventListener('focus', () => { removeError('city') });
  stateContainer.addEventListener('focus', () => { removeError('state') });
  landmarkContainer.addEventListener('focus', () => { removeError('landmark') }); // If you ever add validation to it.
  
  function showError(field_id, message) {
    console.log('Call inside show error');
    const addressModal = document.getElementById('addressModal');
    console.log('fieldid',field_id);
    const error_div = addressModal.querySelector(`#${field_id}-error`);
      console.log(error_div);
      error_div.textContent = message;
      error_div.classList.replace('invisible', 'visible');
  }



  function removeError(errType){
    const addressModal = document.getElementById('addressModal');
    const error_div = addressModal.querySelector(`#${errType}-error`);
      error_div.classList.replace('visible', 'invisible');

  }
});

//called when close the address modal
function clearErrors() {
    const addressModal = document.getElementById('addressModal');
      const errorElements = addressModal.querySelectorAll('[id$="-error"]');
      errorElements.forEach(element => {
          element.textContent = '';
          element.classList.replace('visible', 'invisible');
      });
  }

// --- Validation Before Submission ---

function validationCheckBeforeSubmitAddress() {
  console.log('Call inside Validation check before submit for Address');
  
  // Get values from the addressModal inputs
  const name = addressModal.querySelector('#name').value.trim();
  const mobile = addressModal.querySelector('#mobile').value.trim();
  const pincode = addressModal.querySelector('#pincode').value.trim();
  const locality = addressModal.querySelector('#locality').value.trim();
  const streetName = addressModal.querySelector('#streetName').value.trim();
  const houseName = addressModal.querySelector('#houseName').value.trim();
  const city = addressModal.querySelector('#city').value.trim();
  const state = addressModal.querySelector('#state').value.trim();
  const landmark = addressModal.querySelector('#landmark').value.trim();

  // Clear previous errors (assuming clearErrors is defined globally)
  clearErrors(); 

  let isValid = true;

  // 1. Name Validation
  if (!name) {
      showError('name', "Name is Required");
      isValid = false;
  } else if (/^\s|\s{2,}|\s$/.test(name)) {
      showError('name', "Can't start/end with spaces or have multiple spaces");
      isValid = false;
  } else if (name.replace(/\s+/g, '').length < 2) {
      showError('name', "Name must be at least 2 characters");
      isValid = false;
  } else if (!/^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/.test(name)) {
      showError('name', "Name should contain only characters");
      isValid = false;
  } else if (name.replace(/\s+/g, '').length > 20) {
      showError('name', "Maximum length is 20 characters (excluding spaces)");
      isValid = false;
  }

  // 2. Mobile Validation (Replicating your logic)
  if (!mobile) {
      showError('mobile', "Mobile number is required");
      isValid = false;
  } else if (/[a-zA-Z]/.test(mobile)) {
      showError('mobile', "Cannot contain letters");
      isValid = false;
  } else if (/[^\d\s()+-]/.test(mobile)) {
      showError('mobile', "Only numbers, spaces, +,-,() are allowed");
      isValid = false;
  } else {
      const cleanedMobile = mobile.replace(/\D/g, '');
      if (cleanedMobile.length < 10) {
          showError('mobile', "Must contain at least 10 digits");
          isValid = false;
      } else if (cleanedMobile.length > 10) {
          showError('mobile', "Cannot exceed 10 digits");
          isValid = false;
      } else if (/^0+$/.test(cleanedMobile)) {
          showError('mobile', "Cannot be all zeroes");
          isValid = false;
      } else if (/^(\d)\1{9,14}$/.test(cleanedMobile)) {
          showError('mobile', 'Cannot be all repeating digits');
          isValid = false;
      }
  }

  // 3. Pincode Validation
  if (!pincode) {
      showError('pincode', "Pincode is required");
      isValid = false;
  } else if (!/^\d{6}$/.test(pincode)) {
      showError('pincode', "Pincode must be a 6-digit number");
      isValid = false;
  }

  // 4. Locality Validation
  if (!locality) {
      showError('locality', "Locality/Area is required");
      isValid = false;
  } else if (locality.length < 3) {
      showError('locality', "Locality must be at least 3 characters");
      isValid = false;
  } else if (locality.length > 50) {
      showError('locality', "Locality cannot exceed 50 characters");
      isValid = false;
  }
  
  // 5. Street Name Validation
  if (!streetName) {
      showError('streetName', "Street Name is required");
      isValid = false;
  } else if (streetName.length < 5) {
      showError('streetName', "Street Name must be at least 5 characters");
      isValid = false;
  } else if (streetName.length > 100) {
      showError('streetName', "Street Name cannot exceed 100 characters");
      isValid = false;
  }
  
  // 6. House Name/Number Validation
  if (!houseName) {
      showError('houseName', "House Name/No. is required");
      isValid = false;
  } else if (houseName.length < 2) {
      showError('houseName', "House Name/No. must be at least 2 characters");
      isValid = false;
  } else if (houseName.length > 50) {
      showError('houseName', "House Name/No. cannot exceed 50 characters");
      isValid = false;
  }

  // 7. City Validation
  if (!city) {
      showError('city', "City is required");
      isValid = false;
  } else if (!/^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/.test(city)) {
      showError('city', "City should contain only characters");
      isValid = false;
  } else if (city.length < 2 || city.length > 30) {
      showError('city', "City must be between 2 and 30 characters");
      isValid = false;
  }

  // 8. State Validation
  if (!state) {
      showError('state', "State is required");
      isValid = false;
  } else if (!/^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/.test(state)) {
      showError('state', "State should contain only characters");
      isValid = false;
  } else if (state.length < 2 || state.length > 30) {
      showError('state', "State must be between 2 and 30 characters");
      isValid = false;
  }

  if (landmark && landmark.length < 2) {
    showError('landmark', "Landmark too short");
    isValid = false;
  }

  function showError(field_id, message) {
    const addressModal = document.getElementById('addressModal');
    const error_div = addressModal.querySelector(`#${field_id}-error`);
    error_div.textContent = message;
    error_div.classList.replace('invisible', 'visible');
}

function clearErrors() {
  const addressModal = document.getElementById('addressModal');
    const errorElements = addressModal.querySelectorAll('[id$="-error"]');
    errorElements.forEach(element => {
        element.textContent = '';
        element.classList.replace('visible', 'invisible');
    });
}
  
  return isValid;
}