let currentUserId = null;

async function toggleUserStatus(userId, currentStatus) {

console.log('Call inside toggleUserStatus');

const newStatus = !currentStatus
const action = currentStatus ? "Block" : "UnBlock"

const result = await sweetAlert('warning', 'Are you sure ? ', `You are about to ${action} this user.! `, true, true)


if (result.isConfirmed) {
  const response = await fetch(`/admin/users/status/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          isActive: newStatus,
        })
      });

      if (response.ok){
        
         await sweetAlert('success', `${action}ed`, `User has been ${action}ed successfully.!`, false, false,1500)
         
         const userRow = document.getElementById(`user-${userId}`);
         const blockBtn = userRow.querySelector('#blockBtn');
         const unblockBtn = userRow.querySelector('#unblockBtn');
         const statusBtn = userRow.querySelector('#statusBtn')
   

         if(newStatus){
          blockBtn.classList.remove('hidden');
          unblockBtn.classList.add('hidden');
          statusBtn.textContent='Active';
          statusBtn.style.color = 'green';
          userRow.classList.remove('bg-gray-600')
          userRow.classList.add('bg-black', 'bg-opacity-90');
         }else{
          blockBtn.classList.add('hidden');
          unblockBtn.classList.remove('hidden');
          statusBtn.textContent='InActive';
          statusBtn.style.color = 'red';
          userRow.classList.remove('bg-black', 'bg-opacity-90');
          userRow.classList.add('bg-gray-600')
         }
         

         
      }else{
        console.log('Couldnot update the status')
      }

    }
}


function debounce(fn, wait) {
  let timerId = null;

  return function (...args) {
    clearTimeout(timerId)
    timerId = setTimeout(() => {
      fn.apply(this, args)
    }, wait)
  }
}

async function handleSearch() {



  try {

    //input element always emit input event whenever input value changes
    const searchTerm = document.getElementById('searchInput').value.trim();
    const usersContainer = document.getElementById('usersContainer');

    //show loading state

    usersContainer.innerHTML = '<div class="text-center py-8" > Searching... </div> '

    if(/[*%$?\\]/.test(searchTerm)){ //avoid special characters that may crash the server
      searchTerm=searchTerm.replaceAll(/[*%$?\\]/g,'').trim()
    }
  
    const response = await fetch(`/admin/users/search?searchTerm=${searchTerm}`);
  
    if (!response.ok) {
      throw new Error('Search Failed')
    }

    const users = await response.json();
    renderUsers(users);
  } catch (err) {
    console.log('Error in get handleSearch: ', err);
    usersContainer.innerHTML = '<div class="text-center py-8 teext-red-500" > Error Loading Results </div>'
  }
}

async function renderUsers(users) {
  const usersContainer = document.getElementById('usersContainer');

  if (users.length == 0) {
    usersContainer.innerHTML = '<div class="text-center py-8 text-gray-400">No users found</div>';
    usersContainer.appendChild(userElement);
  }
  usersContainer.innerHTML = '';

  users.forEach((user, index) => {

    
    const userRow = document.createElement('div');
    userRow.id = `user-${user._id}`
    userRow.className = ` ${user.isActive? 'bg-black bg-opacity-90': 'bg-gray-600' }  backdrop-blur-sm text-white rounded-lg p-4 grid grid-cols-12 gap-4 items-center transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl border border-white border-opacity-40`

    userRow.style.animation = `slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${index * 0.1}s`;

    userRow.innerHTML = `

      <div class = "col-span-1">
        <img src="${user.photo}" 
        alt="${user.firstName}"
        class="w-10 h-10 rounded-full object-cover"
        >
      </div>

      <div class="col-span-2">${user.firstName}</div>
      <div class="col-span-3">${user.email}</div>
      <div class="col-span-2">${user.mobile?user.mobile:'XXXXXXXXXX'}</div>

      <div class="col-span-2 ">
      <span id="statusBtn" class=" ${user.isActive ? "text-green-500" : "text-red-500 " } </span>w-16 py-1 rounded-full text-sm font-medium text-center inline-block">
        ${user.isActive ? "Active" : "InActive" }
      </span>
    </div>

    <div  class="col-span-2 flex space-x-3">


    <i id="blockBtn" class="
    fa-solid fa-lock cursor-pointer
    ${ user.isActive ? '':'hidden'}
    " 
    style="color: #991B1B;" onclick="toggleUserStatus('${user._id}',true)"></i>

    <i id="unblockBtn" class="
    fa-solid fa-lock-open cursor-pointer
    ${user.isActive ? 'hidden':''}
    " 
    style="color: #16A34A;" onclick="toggleUserStatus('${user._id}',false)"></i>


  </div>

  `;
  
    usersContainer.appendChild(userRow); // Now in DOM
  })
}
document.addEventListener('DOMContentLoaded', () => {
  console.log("Dom fully loaded")

  document.getElementById('searchInput').addEventListener('input', (e) => {
    console.log('Input event fired:', e.target.value);
  });
  const searchInput = document.getElementById('searchInput');
  console.log(searchInput)
  searchInput.addEventListener('input', debounce(handleSearch, 500))

})


