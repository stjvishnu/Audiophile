const referralPage = document.getElementById('referral-page');
const referralBtn = document.getElementById('referralBtn')

referralBtn.addEventListener('click',async ()=>{
  console.log('Referral btn clicked');

  document.getElementById('loader').classList.remove('hidden')
  document.body.style.overflow = 'hidden';
  try {
    const response = await axios.get('/user/referral')
  if(response.data.referral){
    const referralCode = document.getElementById('referralCode')
    const referralEarnings = document.getElementById('referralEarnings')
    const referralCount = document.getElementById('referralCount')
    referralCode.textContent=response.data.referral
    referralCount.textContent=response.data.referralCount
    referralEarnings.textContent=response.data.referralEarnings
  }

  profileInfo.classList.add('hidden')
  addressPage.classList.add('hidden');
  ordersSection.classList.add('hidden');
  walletPage.classList.add('hidden')

  document.getElementById('loader').classList.add('hidden')
  document.body.style.overflow = '';

  referralPage.classList.remove('hidden')
  } catch (error) {
    document.getElementById('loader').classList.add('hidden')
    document.body.style.overflow = '';
    console.log('Error in getting referral',error);
  }
  

})