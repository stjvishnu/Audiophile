
document.addEventListener('DOMContentLoaded', () => {

  //------------------------------------------------
  // FIELD ELEMENTS
  //------------------------------------------------
  const firstNameContainer = document.getElementById('firstName');
  const lastNameContainer = document.getElementById('lastName');
  const emailContainer = document.getElementById('email');
  const mobileContainer = document.getElementById('mobile');
  const passwordContainer = document.getElementById('password');
  const confirmPasswordContainer = document.getElementById('confirmPassword');
  const referralCodeContainer = document.getElementById('referralCode')
  const submitBtn = document.getElementById('submitBtn');


  //------------------------------------------------
  // ERROR HANDLERS
  //------------------------------------------------
  function showError(field_id, message) {
    const error_div = document.getElementById(field_id + '-error');
    error_div.textContent = message;
    error_div.classList.replace('invisible', 'visible');
    return false;
  }

  function removeError(field_id) {
    const error_div = document.getElementById(field_id + '-error');
    error_div.classList.replace('visible', 'invisible');
  }

  function clearErrors() {
    document.querySelectorAll('[id$="-error"]').forEach(el => {
      el.textContent = '';
      el.classList.replace('visible', 'invisible');
    });
  }

  //------------------------------------------------
  // VALIDATORS (Individual)
  //------------------------------------------------
  function validateFirstName(firstName) {
    if (!firstName) return showError('firstName', "First Name is required");
    if (/^\s|\s{2,}|\s$/.test(firstName)) return showError('firstName', "Invalid spacing");
    if (firstName.replace(/\s+/g,'').length < 2) return showError('firstName', "Min 2 characters");
    if (!/^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(firstName)) return showError('firstName', "Only letters allowed");
    if (firstName.replace(/\s+/g,'').length > 15) return showError('firstName', "Max 15 characters");
    return true;
  }

  function validateLastName(lastName) {
    if (!lastName) return showError('lastName', "Last Name is required");
    if (/^\s|\s{2,}|\s$/.test(lastName)) return showError('lastName', "Invalid spacing");
    if (!/^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(lastName)) return showError('lastName', "Only letters allowed");
    if (lastName.replace(/\s+/g,'').length < 2) return showError('lastName', "Min 2 characters");
    if (lastName.replace(/\s+/g,'').length > 15) return showError('lastName', "Max 15 characters");
    return true;
  }

  function validateEmail(email) {
    if (!email) return showError('email', "Email required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('email', "Invalid email");
    if (email.length > 254) return showError('email', "Email too long");
    if (/\.{2,}/.test(email) || /@.{0,1}$/.test(email)) return showError('email', "Invalid format");
    if (/(\..*\.)|(^\.)|(\.$)/.test(email.split('@')[0])) return showError('email', "Invalid characters");
    return true;
  }

  function validateMobile(mobile) {
    if (!mobile) return showError('mobile', "Mobile required");
    if (/[a-zA-Z]/.test(mobile)) return showError('mobile', "Letters not allowed");
    if (/[^\d\s()+-]/.test(mobile)) return showError('mobile', "Invalid characters");

    const cleaned = mobile.replace(/\D/g,'');

    if (cleaned.length !== 10) return showError('mobile', "Must be 10 digits");
    if (/^0{10}$/.test(cleaned)) return showError('mobile', "Invalid number");
    if (/^(\d)\1{9}$/.test(cleaned)) return showError('mobile', "Repeating digits invalid");
    return true;
  }

  function validatePassword(password) {
    if (!password) return showError('password', "Password required");
    if (password !== password.trim()) return showError("password", "No surrounding spaces");
    if (password.length < 8) return showError("password", "Min 8 characters");
    if (password.length > 64) return showError("password", "Max 64");
    if (!/[A-Z]/.test(password)) return showError("password", "Need uppercase");
    if (!/[a-z]/.test(password)) return showError("password", "Need lowercase");
    if (!/[0-9]/.test(password)) return showError("password", "Need a number");
    if (!/[^A-Za-z0-9]/.test(password)) return showError("password", "Need special character");
    return true;
  }

  function validateConfirmPassword(password, confirmPassword) {
    if (password !== confirmPassword) return showError('confirmPassword', "Passwords do not match");
    return true;
  }


  //------------------------------------------------
  // FINAL FORM VALIDATOR
  //------------------------------------------------
  function validateSignupForm(data) {
    const f = validateFirstName(data.firstName);
    const l = validateLastName(data.lastName);
    const e = validateEmail(data.email);
    const m = validateMobile(data.mobile);
    const p = validatePassword(data.password);
    const c = validateConfirmPassword(data.password, data.confirmPassword);

    return f && l && e && m && p && c;
  }


  //------------------------------------------------
  // ON BLUR (Field-level)
  //------------------------------------------------
  firstNameContainer.addEventListener('blur', () => validateFirstName(firstNameContainer.value.trim()));
  lastNameContainer.addEventListener('blur', () => validateLastName(lastNameContainer.value.trim()));
  emailContainer.addEventListener('blur', () => validateEmail(emailContainer.value.trim()));
  mobileContainer.addEventListener('blur', () => validateMobile(mobileContainer.value.trim()));
  passwordContainer.addEventListener('blur', () => validatePassword(passwordContainer.value.trim()));
  confirmPasswordContainer.addEventListener('blur', () =>
    validateConfirmPassword(passwordContainer.value.trim(), confirmPasswordContainer.value.trim())
  );


  //------------------------------------------------
  // ON FOCUS (remove error)
  //------------------------------------------------
  ['firstName','lastName','email','mobile','password','confirmPassword'].forEach(id => {
    document.getElementById(id).addEventListener('focus', () => removeError(id));
  });


  //------------------------------------------------
  // FORM SUBMIT (AXIOS VERSION)
  //------------------------------------------------
  document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    const data = {
      firstName: firstNameContainer.value.trim(),
      lastName: lastNameContainer.value.trim(),
      email: emailContainer.value.trim(),
      mobile: mobileContainer.value.trim(),
      password: passwordContainer.value.trim(),
      confirmPassword: confirmPasswordContainer.value.trim(),
      referralCode: referralCodeContainer.value.trim()
    };

    clearErrors();

    // Validate all fields
    if (!validateSignupForm(data)) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
      showToast('error', "Please fix the errors");
      return;
    }

    // -----------------------------------
    // AXIOS REQUEST
    // -----------------------------------
    try {
      const response = await axios.post('/user/signup', data);

      const message = response.data.customMessage
      if(message){
        showToast("success", message);
        console.log(response.data.redirect)
        setTimeout(() => {
            window.location.href = `${response.data.redirect}`;
          }, 1500);    
      } 

      
    } catch (err) {
      const msg = err.response?.data?.customMessage || "Something went wrong";
      showToast("error", msg);
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    }
  });

});

