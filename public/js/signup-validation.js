

    document.addEventListener('DOMContentLoaded',()=>{
        const firstNameContainer = document.getElementById('firstName');
        const lastNameContainer = document.getElementById('lastName');
        const emailContainer = document.getElementById('email');
        const mobileContainer = document.getElementById('mobile');
        const passwordContainer = document.getElementById('password');
        const confirmPasswordContainer = document.getElementById('confirmPassword')

        
        firstNameContainer.addEventListener('blur',()=>{
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

        //confirm password

        confirmPasswordContainer.addEventListener('blur',()=>{
            const confirmPassword= confirmPasswordContainer.value.trim();
            if(password !== confirmPassword) {
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
        passwordContainer.addEventListener('focus',()=>{
            removeError('password')
        }) 
        confirmPasswordContainer.addEventListener('focus',()=>{
            removeError('confirmPassword')
        }) 

        function showError(field_id, message) {
            const error_div = document.getElementById(field_id + '-error');
            error_div.textContent = message;
            error_div.classList.replace('invisible', 'visible');
        }

        // function clearErrors() {
        //     const errorElements = document.querySelectorAll('[id$="-error"]');
        //     errorElements.forEach(element => {
        //         element.textContent = '';
        //         element.classList.replace('visible', 'invisible');
        //     });
        // }

        function removeError(errType){
            const error_div = document.getElementById(errType + '-error');
            error_div.classList.replace('visible', 'invisible');

        }
    })



    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();

        // Set loading state
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';

        // Get all form values
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

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

        // Password Validation
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

        // Confirm Password Validation
        if(password !== confirmPassword) {
            showError('confirmPassword', "Passwords do not match");
            isValid = false;
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

        if(!isValid) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
            return;
        }

        this.submit();
    });



    