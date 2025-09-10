
        document.addEventListener("DOMContentLoaded", function () {
            const otpInputs = Array.from({ length: 6 }, (_, i) =>
                document.getElementById(`otp${i + 1}`)
            );
            const submitBtn = document.getElementById("submitBtn");
            const resendBtn = document.getElementById("resendBtn");
            const countdownTimer = document.getElementById("countdownTimer");
            const email = document.getElementById('email').value
            const inDiv = document.getElementById('in')
            let timeLeft = parseInt(localStorage.getItem('otpTimer')) ||  60; //60 seconds

            // Focus the first input on page load
            if (otpInputs[0]) {
                setTimeout(() => otpInputs[0].focus(), 100);
            }

            // Add input event listeners to OTP fields
            otpInputs.forEach((input, index) => {
                // Handle input
                input.addEventListener("input", (e) => {
                    // Only allow numeric input
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");

                    // Auto-focus next input
                    if (e.target.value && index < otpInputs.length - 1) {
                        otpInputs[index + 1].focus();
                    }

                    // Check if all inputs are filled
                    checkAllInputsFilled();
                });

                // Handle backspace
                input.addEventListener("keydown", (e) => {
                    if (e.key === "Backspace" && !e.target.value && index > 0) {
                        otpInputs[index - 1].focus();
                    }
                });

                // Handle paste
                input.addEventListener("paste", (e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData
                        .getData("text")
                        .replace(/[^0-9]/g, "")
                        .slice(0, 6);

                    pastedData.split("").forEach((digit, i) => {
                        if (i < otpInputs.length) {
                            otpInputs[i].value = digit;
                        }
                    });

                    // Focus the last filled input or the next empty one
                    const lastFilledIndex = Math.min(
                        pastedData.length,
                        otpInputs.length - 1
                    );
                    otpInputs[lastFilledIndex].focus();

                    checkAllInputsFilled();
                });
            });

            function checkAllInputsFilled() {
              const allFilled = otpInputs.every((input) => input.value);
              if (allFilled) {
                  submitBtn.classList.add("bg-white");
                  submitBtn.classList.remove(
                      "bg-gray-700",
                      "text-gray-300",
                      "cursor-not-allowed"
                  );
              }
          }

            // Form submission
            document.getElementById("otpVerificationForm").addEventListener("submit", function (e) {
                e.preventDefault();

                // Collect OTP
                let otp = "";
                let allFilled = true;

                otpInputs.forEach((input) => {
                    if (!input.value) {
                        allFilled = false;
                    }
                    otp += input.value;
                });

                if (!allFilled) {
                    showError("Please enter the complete 6-digit code");
                    return;
                }

                // Show loading state
                submitBtn.disabled = true;
                submitBtn.innerHTML = "Verifying...";

                // Add hidden input for the full OTP
                const otpInput = document.createElement("input");
                otpInput.type = "hidden";
                otpInput.name = "otp";
                otpInput.value = otp;
                this.appendChild(otpInput);

                // Submit the form
                this.submit();
            });


            //------ Timer Functionality ---------------

            /**
             * @function startTimer
             * @returns {void}
             * @requires {HTMLELement} resendBtn - The element to disable and enable during countdown
             * @requires {HTMLELement} inDiv - The element to hide when timer ends
             * @requires {number} timeLeft - The remaining time in seconds 
             * 
             * @description
             * At the start of the timer resend button will be disabled
             * setInterval is used do this functionality since it executes every seconds.
             * Each time decreases the value of timeLeft so it simulates like counter.
             * When counter (timeLeft) becomes zero the resend button is enabled
             */

            function startTimer() {
              resendBtn.disabled = true;
              let timer = setInterval(() => {
                  if (timeLeft < 0) {
                      clearInterval(timer);
                      inDiv.classList.add('hidden')
                      countdownTimer.textContent = '';
                      resendBtn.disabled = false;
                      localStorage.removeItem('otpTimer') // Clear stored time when timer ends
                  } else {
                      countdownTimer.textContent = `${timeLeft}s`;
                      localStorage.setItem('otpTimer',timeLeft)
                      timeLeft--;
                  }
              }, 1000)
          }

          //start timer on page loads
            startTimer()
         


            //------ Resend Otp Functionality ---------------


          /**
           *@async
           *@function resendFunctionality
           *@returns {Promise<void>} - Resolves when OTP post request is completed.Based on the response from server
           *@throws {Error} - If post request fails,handled using showToast for user and catch block for server
           *@requires {string} email - The email addres to send the otp
           * @requires {Function} showToast - Function to display toast notifications 
           * 
           * @description
           * This function gets fired on clicking the resend button
           * To persist the timer variable,it is stored in local storage,so even if refreshed,it get resumed from where tit left
           * Using fetch,a POST request is send to server
           * Response will be resolved using showToast.And promise response will be unresolved
           */

            async function resendFunctionality() {

                timeLeft = 60; //reset timer
                localStorage.setItem('otpTimer',timeLeft) //save reset time to local storage


                try {
                    const response = await fetch('/user/resend-otp', {
                        method: 'POST',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email })
                    })

                    if (response.ok) {
                        startTimer();
                        showToast('success', 'Otp send successfully')
                    } else {
                        showToast('error', 'Please try again')
                    }

                } catch (err) {
                    showToast('error', 'something went wrong');
                    console.log('resendFunctionality',err);
                }

            }

            resendBtn.addEventListener("click",resendFunctionality);




            





            // Insert at the top
            const container = document.querySelector(".bg-black");
            container.insertBefore(errorDiv, container.firstChild);

            // Reset button state
            document.getElementById("submitBtn").disabled = false;
            document.getElementById("submitBtn").innerHTML = "Verify";

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                errorDiv.remove();
            }, 3000);

        });

