
document.addEventListener('DOMContentLoaded',()=>{
  const emailContainter = document.getElementById('email');
  const passwordContainer = document.getElementById('password');

  emailContainter.addEventListener('blur',()=>{

    const email = emailContainter.value.trim();
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

  emailContainter.addEventListener('focus',()=>{
    removeError('email')
  })


  passwordContainer.addEventListener('blur',()=>{
    const password= passwordContainer.value.trim();
    if(!password) {
    showError('password', "Password is required");
    isValid = false;
} else {
    if(password !== password.trim()) {
        showError("password", "Password cannot contain spaces");
        isValid = false;
    } else if(password.length < 8) {
        showError("password", "Password must be at least 8 characters");
        isValid = false;
    } else if(password.length > 64) {
        showError("password", "Password cannot exceed 64 characters");
        isValid = false;
    } else if(!/[A-Z]/.test(password)) {
        showError("password", "Password must contain at least one uppercase letter (A-Z)");
        isValid = false;
    } else if(!/[a-z]/.test(password)) {
        showError("password", "Password must contain at least one lowercase letter (a-z)");
        isValid = false;
    } else if(!/[0-9]/.test(password)) {
        showError("password", "Password must contain at least one number (0-9)");
        isValid = false;
    } else if(!/[^a-zA-Z0-9]/.test(password)) {
        showError("password", "Password must contain at least one special character (!@#$%^&*)");
        isValid = false;
    }
}
})

  function showError(field_id, message) {
    
    const error_div = document.getElementById(field_id + '-error');
    error_div.textContent = message;
    error_div.classList.replace('invisible', 'visible');
}
function removeError(errType){
  const error_div = document.getElementById(errType + '-error');
  error_div.classList.replace('visible', 'invisible');

}

})

document.addEventListener('DOMContentLoaded',()=>{
  const form = document.getElementById('loginForm');
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    axios.post('/user/login',{email:email,password:password})
    .then((response)=>{

      //control enter if status code 2XX
      
      Toastify({
        text: response?.data?.message || " ✅ Successfully You have Logged In",
        duration: 3000,
        close: true,
        gravity: "bottom", // top or bottom
        position: "right", // left, center or right
        stopOnFocus: true,
        style: {
          background: "rgba(0, 0, 0, 0.9)",  // slightly transparent black
          color: "#fff",                      // white text
          borderRadius: "10px",               // rounded corners
          border: "1px solid #fff",           // white border
          boxShadow: "0px 4px 12px rgba(255, 255, 255, 0.2)", // soft white shadow
          fontSize: "14px",                   // slightly bigger text
          padding: "10px 15px"                // extra spacing
        }
      }).showToast();

      setTimeout(()=>{
        window.location.href='/'
      },2000)


    })
    .catch((error)=>{
      Toastify({
        text: `❌ ${error.response?.data?.message}` || "❌ Invalid Credentials, Try Again!!",
        duration: 3000,
        close: true,
        gravity: "bottom", // top or bottom
        position: "right", // left, center or right
        stopOnFocus: true,
        style: {
          background: "rgba(0, 0, 0, 0.9)",  // slightly transparent black
          color: "#fff",                      // white text
          borderRadius: "10px",               // rounded corners
          border: "1px solid #fff",           // white border
          boxShadow: "0px 4px 12px rgba(255, 255, 255, 0.2)", // soft white shadow
          fontSize: "14px",                   // slightly bigger text
          padding: "10px 15px"                // extra spacing
        }
      }).showToast();
      
    })
  })
})


