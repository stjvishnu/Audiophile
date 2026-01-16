const walletPage = document.getElementById('walletPage')
console.log(walletPage);
const walletBtn = document.getElementById('walletBtn')

walletBtn.addEventListener('click',async (e)=>{
  console.log('Call inisde walletBtn');
  e.preventDefault();
  profileInfo.classList.add('hidden')
  addressPage.classList.add('hidden');
  ordersSection.classList.add('hidden');
  referralPage.classList.add('hidden')
  document.getElementById('myProfileEditModal').classList.add('hidden')
  document.getElementById('orderDetailsSection').classList.add('hidden')
  walletPage.classList.remove('hidden')
  document.getElementById('loader').classList.remove('hidden')
  document.body.style.overflow = 'hidden';



  try {
    const response = await axios.get('/user/profile/wallet')
    if(response.data.customMessage){
      document.getElementById('loader').classList.add('hidden')
      document.body.style.overflow = '';

      const wallet = response.data.wallet;
      console.log('wallet',wallet);
      const walletBalance = walletPage.querySelector('#walletBalance');
      walletBalance.textContent=wallet.balance
      console.log('Wallet transaction',response.data.walletTransactions);

      if(response.data.walletTransactions){
        const walletTransactions = response.data.walletTransactions;
        const transactionlist=walletPage.querySelector('#transaction-list');
        transactionlist.innerHTML=''

        walletTransactions.forEach((transaction)=>{
          const transactionDiv = document.createElement('div')
            if(transaction.type=='credit'){
              transactionDiv.innerHTML=`
              <div class="transaction-card border-2 border-gray-200 rounded-2xl p-6 hover:border-black transition-all cursor-pointer group"
              data-type="credit">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4 flex-1">
                  <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m0 0l-4-4m4 4l4-4" />
                    </svg>
                  </div>
      
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-900 text-base mb-1">Credited</h3>
                    <p class="text-sm text-gray-500">${new Date(transaction.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true
                    })}</p>
                    <p class="text-xs text-gray-400 mt-2 ${transaction.reason=='Referral'?'hidden':''}">Order ID: #${transaction.orderId}</p>
                     <p class="text-xs text-green-400 mt-2">${transaction.reason}  ${transaction.reason=='Referral '?transaction.userName:''}</p>
                  </div>
                </div>
      
                <div class="text-right ml-4">
                  <p class="text-xl font-bold text-green-600">+ ₹${transaction.amount}</p>
                  <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    success
                  </span>
                </div>
              </div>
            </div>
              `
            }else if(transaction.type=='debit'){
              transactionDiv.innerHTML=`
              <div class="transaction-card border-2 border-gray-200 rounded-2xl p-6 hover:border-black transition-all cursor-pointer group"
              data-type="debit">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4 flex-1">
                  <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20V4m0 0l4 4m-4-4l-4 4" />
                    </svg>
                  </div>
      
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-900 text-base mb-1">Debited</h3>
                    <p class="text-sm text-gray-500">${new Date(transaction.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true
                    })}</p>
                    <p class="text-xs text-gray-400 mt-2">Order ID: #${transaction.orderId}</p>
                    <p class="text-xs text-gray-400 mt-2">${transaction.reason}</p>
                  </div>
                </div>
      
                <div class="text-right ml-4">
                  <p class="text-xl font-bold text-red-600">- ₹${transaction.amount}</p>
                  <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Success
                  </span>
                </div>
              </div>
            </div>
              `
            }
            transactionlist.appendChild(transactionDiv)
        })

      }
    }


  } catch (error) {
    console.log('Error in fetching wallet',error);
    document.getElementById('loader').classList.add('hidden')
    document.body.style.overflow = '';
  }
})