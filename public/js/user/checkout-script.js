console.log('Checkout script loaded');
 const placeOrderBtn = document.getElementById('placeOrder')

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

    if(paymentMethod==='razorpay' || paymentMethod==='wallet'){
      document.getElementById('loader').classList.add('hidden')
        document.body.style.overflow = '';
        showToast('error','These payment modes currently not available')
        return
    }

    const response = await axios.post('/user/checkout',{addressId,addressAtTimeOfOrder,paymentMethod})
    console.log('response',response);
    if(response.data.orderId){
      document.getElementById('loader').classList.add('hidden')
      document.body.style.overflow = '';
      console.log(response.data.orderId);
      const orderId=response.data.orderId
      window.location.href=`/user/checkout/order-success/${orderId}`
    }
    
  }catch(err){
    console.log('err',err);
    document.getElementById('loader').classList.add('hidden')
    document.body.style.overflow = '';
    const orderId= err.response.data.orderId
    console.log('orderId',orderId);
    window.location.href=`/user/checkout/order-failed/${orderId}`
    console.log('Error in checkout script',err);
  }
})