console.log('Checkout script loaded');
 const placeOrderBtn = document.getElementById('placeOrder')
 const totalAmount = document.getElementById('totalAmount').value;
//place order management
placeOrderBtn.addEventListener('click',async(e)=>{
  e.preventDefault()
  try{
    console.log('Order btn clicked');

    document.getElementById('loader').classList.remove('hidden')
    document.body.style.overflow = 'hidden';


    const checkoutContainer=document.getElementById('checkoutPage')
    const selectedAddressContainer=checkoutContainer.querySelector('#selectedAddress')
    const addressId  = selectedAddressContainer.dataset.addressId;
    const couponCode = document.getElementById('couponCode').value;

    if(!addressId){
      showToast('error','Please select an Address to Order');
      document.getElementById('loader').classList.add('hidden')
      document.body.style.overflow = '';
      return
    }
    const addressAtTimeOfOrder={
      fullName : selectedAddressContainer.querySelector('.fullName').textContent,
      mobile : selectedAddressContainer.querySelector('.mobile').textContent,
      houseName : selectedAddressContainer.querySelector('.houseName').textContent,
      streetName : selectedAddressContainer.querySelector('.streetName').textContent,
      locality : selectedAddressContainer.querySelector('.locality').textContent,
      pincode : selectedAddressContainer.querySelector('.pincode').textContent,
      city : selectedAddressContainer.querySelector('.city').textContent,
      state : selectedAddressContainer.querySelector('.state').textContent,
      
      landmark : selectedAddressContainer.querySelector('.landmark')?.textContent || ''
      
    }

    const paymentMethod  = document.querySelector('input[name="payment"]:checked').value;
    console.log('payment method',paymentMethod);

    // if(paymentMethod==='cod'){
    //   let codValue=document.getElementById('totalAmount').value;
    //   console.log(codValue)
      
    //   if(codValue>1000){
    //     document.getElementById('loader').classList.add('hidden')
    //     document.body.style.overflow = '';
    //     showToast('error','Payment amount should be lesser than 1000 for cash on delivery')
    //     return
    //   }
    // }

    if(!paymentMethod){
      document.getElementById('loader').classList.add('hidden')
        document.body.style.overflow = '';
        showToast('error','Please select a payment method')
        return
    }
    //Payment frontend management

    
    if(paymentMethod==='cod'){

          if(totalAmount>1000){
            showToast('error','COD not allowed for orders above ₹1000')
            document.getElementById('loader').classList.add('hidden')
            document.body.style.overflow = '';
            return
          }
      try {
        console.log('Call inside cod');
        const response = await axios.post('/user/checkout',{addressId,addressAtTimeOfOrder,paymentMethod,couponCode})
        console.log('response',response);
        if(response.data.orderId){
          document.getElementById('loader').classList.add('hidden')
          document.body.style.overflow = '';
          console.log(response.data.orderId);
          const orderId=response.data.orderId
          window.location.href=`/user/checkout/order-success/${orderId}`
        }
        
      } catch (error) {
        document.getElementById('loader').classList.add('hidden');
        document.body.style.overflow = '';
      
        const customMessage = error.response?.data?.customMessage;
        const orderId = error.response?.data?.orderId;
      
        if (customMessage) {
          showToast('error', customMessage);
          return;
        }
      
        if (orderId) {
          window.location.href = `/user/checkout/order-failed/${orderId}`;
        } else {
          showToast('error', 'Order failed. Please try again.');
        }
      }
      
    }else if(paymentMethod==='razorpay'){
      let orderId;
      let amount;
      try {
        const response = await axios.post('/user/checkout',{addressId,addressAtTimeOfOrder,paymentMethod,couponCode})
        console.log('REsponse in /user/checkout',response);
        if(!response.data.orderData){
          showToast('error','Issue in completing the order ! Try gain later')
          document.getElementById('loader').classList.add('hidden')
          document.body.style.overflow = '';
          return
        }
        orderId=response.data.orderData.orderId;

        console.log('REsponse in /user/checkout',response.data);

            try {
              const orderResponse = await axios.post('/user/checkout/create-razorpay-order',{
                amount: response.data.orderData.amount,
                orderId:response.data.orderData.orderId,
              })
              
      
              console.log('REsponse in create-razorpay order',orderResponse);
      
              if(!orderResponse.data.orderId){
                showToast('error','Issue in completing the request, try again later')
              }
      
              //show razorpay payment popup
              const options = {
                key: orderResponse.data.RAZORPAY_KEY,
                amount: orderResponse.data.rzpOrder.amount,
                currency: orderResponse.data.rzpOrder.currency,
                order_id: orderResponse.data.rzpOrder.id, // Order ID from backend
                handler:async  (response) => {
                  console.log('razorpay response',response); // Payment details
                  // Step 3: Send payment details to backend for verification
                      try {
                        const verify = await axios.post("/user/checkout/verify-payment", {
                          orderId: orderResponse.data.orderId,
                          addressId,
                          addressAtTimeOfOrder,
                          razorpay_order_id: response.razorpay_order_id,
                          razorpay_payment_id:  response.razorpay_payment_id,
                          razorpay_signature: response.razorpay_signature
                        });
              
                        console.log('verify',verify);
                        
                        if(verify.data.orderId){
                          orderId=verify.data.orderId;
                          document.getElementById('loader').classList.add('hidden')
                          document.body.style.overflow = '';  
                          window.location.href=`/user/checkout/order-success/${verify.data.orderId}`
                        }else{
                          await sweetAlert('error','Payment Failed','Your transaction has failed',false,false,3000)
                          document.getElementById('loader').classList.add('hidden')
                          document.body.style.overflow = '';  
                          window.location.href=`/user/checkout/order-failed/${orderId}`
                        }

                      } catch (error) {
                        console.log('Error in verifying payment',error);
                        document.getElementById('loader').classList.add('hidden')
                        document.body.style.overflow = '';                    
                      }
                
                },
                modal: {
                  ondismiss : async ()=>{
                    console.log('modal closed')
                  const isCancelled= await axios.delete(`/user/checkout/cancel-razorpay-order/${orderId}`)
                  if(isCancelled.data.customMessage){
                    document.getElementById('loader').classList.add('hidden')
                    document.body.style.overflow = '';  
                    showToast('error',isCancelled.data.customMessage)
                    return
                  }
                    
                  }
                }
              };
                         const rzp = new Razorpay(options);
                        
                        rzp.on('payment.failed',async ()=>{
                          console.log('Call recieved inside razorpay failed on method');
                          await sweetAlert('error','Payment Failed','Your transaction has failed',false,false,3000)
                          document.getElementById('loader').classList.add('hidden')
                          document.body.style.overflow = '';                   
                          window.location.href=`/user/checkout/order-failed/${orderId}`
                        })
                
                        rzp.open();

            }
            
            catch (error) {
              console.log('Error in creating razorpay order',error);
              document.getElementById('loader').classList.add('hidden')
              document.body.style.overflow = '';              
            }


      } catch (error) {
        console.log('Error in razorpay payament',error)
        const message = error.response.data.customMessage || 'Error while placing the order, Please try again later'
        if(message) showToast('error',message)
        
        document.getElementById('loader').classList.add('hidden')
        document.body.style.overflow = '';
      }
    }else if(paymentMethod==='wallet'){
      try {
        
      const totalAmount=document.getElementById('totalAmount').value;
      const walletResponse = await axios.get('/user/profile/wallet')
        if(totalAmount>walletResponse.data.wallet.balance){
          console.log('helloooooooooooo');
          showToast('error','Checkout amount is higher than wallet balance, Please Use another payment method')
          document.getElementById('loader').classList.add('hidden')
          document.body.style.overflow = '';
          return
        } 

        console.log('Waallet response',walletResponse);
        
          if(walletResponse.data.wallet){
            try {
              const response = await axios.post('/user/checkout/',{addressId,addressAtTimeOfOrder,paymentMethod,couponCode})
              console.log('order response',response);
            document.getElementById('loader').classList.add('hidden')
            document.body.style.overflow = '';
            console.log(response.data.orderId);
            const orderId=response.data.orderId
            window.location.href=`/user/checkout/order-success/${orderId}`
            } catch (error) {
              document.getElementById('loader').classList.add('hidden');
              document.body.style.overflow = '';
            
              const customMessage = error.response?.data?.customMessage;
              const orderId = error.response?.data?.orderId;
            
              if (customMessage) {
                showToast('error', customMessage);
                return;
              }
            
              if (orderId) {
                window.location.href = `/user/checkout/order-failed/${orderId}`;
              } else {
                showToast('error', 'Order failed. Please try again.');
              }
            }
            
            
         }


        
      } catch (error) {
        console.log('Error in order placement using wallet',error);
        document.getElementById('loader').classList.add('hidden')
        document.body.style.overflow = '';  
        const message = error.response.data.customMessage || 'Error while placing the order, Please try again later'
        if(message) showToast('error',message)
      }
     }

  }catch(err){
    console.log('err',err);
    document.getElementById('loader').classList.add('hidden')
    document.body.style.overflow = '';
    console.log('Error in checkout script',err);
    const message = error.response.data.customMessage || 'Error while placing the order, Please try again later'
    if(message) showToast('error',message)
  }
})