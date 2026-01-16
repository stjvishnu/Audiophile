      
      let currentCategoryId = null; //Holds the currently selected category ID for edit operations

      
      // Modal and input element references
      
      const modal = document.getElementById('confirmationModal');
      const modalContent = document.getElementById('modalContent');
      const categoryNameSpan = document.getElementById('categoryNameToRemove');
      const editModal = document.getElementById('editModal');
      const editModalContent = document.getElementById('editModalContent');
      const categoryNameInput = document.getElementById('categoryName');
      const addModal = document.getElementById('addModal');
      const addModalContent = document.getElementById('addModalContent');
      const newCategoryNameInput = document.getElementById('newCategoryName');

      
      /**
       * Opens the Add Category modal
       */

      function openAddModal() {
        newCategoryNameInput.value = '';
        addModal.classList.remove('hidden');
        setTimeout(() => addModalContent.classList.add('show'), 10);
        document.body.classList.add('modal-open');
      }


      /**
       * Closes the Add Category modal
       */

      function closeAddModal() {
        addModalContent.classList.remove('show');
        setTimeout(() => {
          addModal.classList.add('hidden');
          document.body.classList.remove('modal-open');
        }, 300);
      }

       /**
       * Handles Add Category form submission
       * @param {Event} event
       */

      function addCategory(event) {
        event.preventDefault();

        // Validation: empty input
        if(!newCategoryNameInput.value.trim()){
          showToast('error','Valid category name required')
          return
        }

        // Validation: only alphanumeric characters allowed
        if(!/^[A-Za-z0-9]+$/.test(newCategoryNameInput.value.trim())){
          showToast('error', 'Category name can contain only letters and numbers');
          return
        }
        
        fetch('/admin/category', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newCategoryNameInput.value.replace(/\s/g, '')
          })
        })
        .then(response => {
          if (response.ok) {
            showToast('success','Category Added Successfully')
            setTimeout(()=>{
              window.location.reload();
            },3000)
          }else{
            showToast('warning','Category Already Exists')
          }
        })
        .catch(error => console.error('Error:', error))
        .finally(() => closeAddModal());

      }

      /**
       * Opens Edit Category modal
       * @param {string} id
       * @param {string} name
       */

      function openEditModal(id, name) {
        currentCategoryId = id;
        categoryNameInput.value = name;

        editModal.classList.remove('hidden');
        setTimeout(() => editModalContent.classList.add('show'), 10);

        document.body.classList.add('modal-open');
      }

      /**
       * Closes Edit Category modal
       */

      function closeEditModal() {
        editModalContent.classList.remove('show');

        setTimeout(() => {
          editModal.classList.add('hidden');
          document.body.classList.remove('modal-open');
          currentCategoryId = null;
        }, 300);
      }

      /**
       * Handles category update request
       * @param {Event} event
       */

      function updateCategory(event) {
        event.preventDefault();

        if (currentCategoryId){
          fetch(`/admin/category/${currentCategoryId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: categoryNameInput.value
            })
          })
          .then((response) => {
            console.log(response.status);
            if (response.ok) {
              showToast('success','Successfully Updated')
              setTimeout(()=>{
                window.location.reload();
              },3000)
            }else if (response.status===409){
              showToast('warning','Category Already Exists')
            }else if(response.status===404){
              showToast('warning','No Category Found')
            }})
          .catch((error) =>{
            showToast('error','Something went wrong')
             console.log('Error in updating category',error)
            })
          .finally(() => closeEditModal());
        }
      }

         /**
         * Deletes a category after confirmation
         * @param {string} categoryId
         */

          async function deleteCategory(categoryId){
            try{

              const result = await sweetAlert('warning','Are you sure ? ','You are about to delete this Category',true,true)

              if(result.isConfirmed){
                const response =  await fetch(`/admin/category/${categoryId}`,{
                  method:'DELETE'
                })

                if(response.ok){
                  await sweetAlert('success','Deleted','Category has been deleted successfully',false,false,1000)
                  window.location.reload();
                }else{
                  throw new Error ('Failed to Delete the Product')
                }

              }
            }
            catch(err){
              showToast('error','Something went wrong')
              console.log('Error in  Delete Category',err);
            }
        }


       /**
        * Restores a deleted category
        * @param {string} categoryId
        */

       async function restoreCategory(categoryId){
          try{
          const result = await sweetAlert('warning','Are you sure ? ','You are about to restore this Category',true,true)

          if(result.isConfirmed){
              const response =  await fetch(`/admin/category/restore/${categoryId}`,{
                method:'PATCH'
              })

              if(response.ok){
                await sweetAlert('success','Restored','Category has been restored successfully',false,false,1000)
                window.location.reload();
              }else{
                throw new Error ('Failed to Restore the Product')
              }
           }
          }
          catch(err){
            showToast('error','Something went wrong')
            console.log('Error in Restore Category',err);
          }
      }


      /**
       * Blocks a category
       * @param {string} categoryId
       */

      async function blockCategory(categoryId){
          try{
              const result = await sweetAlert('warning','Are you sure ? ','You are about to block this Category',true,true)

              if(result.isConfirmed){
              const response =  await fetch(`/admin/category/block/${categoryId}`,{
                method:'PATCH'
              })

              if(response.ok){
                await sweetAlert('success','Blocked','Category has been succesfully blocked',false,false,1000)
                window.location.reload();
              }else{
                throw new Error ('Failed to Block the Product')
              }
           }
          }
          catch(err){
            showToast('error','Something went wrong')
            console.log('Error in block Category',err);
          }
      }


      /**
       * Unblocks a category
       * @param {string} categoryId
       */

      async function unblockCategory(categoryId){
        try{
          const result = await sweetAlert('warning','Are you sure ? ','You are about to unBlock this Catgeory',true,true)

          if(result.isConfirmed){
            const response =  await fetch(`/admin/category/unblock/${categoryId}`,{
              method:'PATCH'
            })

            if(response.ok){
              await sweetAlert('success','unBlocked','Category has been  unBlocked succesfully',false,false,1000)
              window.location.reload();
            }else{
              throw new Error ('Failed to Block the Product')
            }
          }
        }
        catch(err){
          showToast('error','Something went wrong')
          console.log('Error in block Category',err);
        }
      }

      
    //------------- Modal Close Handlers ------------//

      if(modal){
        modal.addEventListener('click', (e) => {
          if (e.target === modal) closeModal();
        });
      }
      

      editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeEditModal();
      });

      addModal.addEventListener('click', (e) => {
        if (e.target === addModal) closeAddModal();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (!modal.classList.contains('hidden')) closeModal();
          if (!editModal.classList.contains('hidden')) closeEditModal();
          if (!addModal.classList.contains('hidden')) closeAddModal();
        }
      });

     //------------- Search Management ------------//

     let searchMode=false; //variable for managing pagination state
     const searchInput= document.getElementById('searchInput');
     filterMode=false;
     /**
     * Debounce utility to limit function execution
     * @param {Function} fn
     * @param {number} wait
     * @returns {Function}
     */


     function debounce(fn,wait){
      let timerId=null;
      return function(...args){
        clearTimeout(timerId);
        timerId=setTimeout(()=>{
          fn.apply(this, args)
        },wait)
      }
     }

     searchInput.addEventListener('input',debounce(handleSearch,500))

     let previousCategories = [];

     /**
     * Loads all categories initially for fallback rendering
     */

     async function loadCategories() {;
      const res = await fetch('/admin/category/loadCategories');
      const data = await res.json();
      previousCategories = data.categories;
    }
    loadCategories();

    /**
    * Handles live search logic
    */

     let searchTerm;

     async function handleSearch(){
      try {
        searchMode=true;

        if(searchInput.value.trim()===''){
          searchMode=false;
        }
        
        searchTerm = document.getElementById('searchInput').value.trim();
        const categoriesContainer=document.getElementById('categoriesContainer');

        categoriesContainer.innerHTML = '<div class="text-center py-8" > Searching... </div> '

        if (searchTerm === '') {
          renderCategories(previousCategories);
          return;
        }

        // Remove special characters that may break backend
        if(/[*%$?\\]/.test(searchTerm)){ 
          searchTerm=searchTerm.replaceAll(/[*%$?\\]/g,'').trim()
        }

        const response = await fetch(`/admin/category/search?searchTerm=${encodeURIComponent(searchTerm)}`);

        if (!response.ok) throw new Error('Search Failed')
    
        const data = await response.json();
        const categories = data.categories;
        renderCategories(categories);

      } catch (error) {
        console.log('Error in get handleSearch', error);
        usersContainer.innerHTML = '<div class="text-center py-8 text-red-500" > Error Loading Results </div>'
      }
     }

     /**
     * Handles pagination
     * @param {String} pageNumber
     */

     async function loadURL(pageNumber){
        try {
          console.log('Search term in loadUrl products',searchTerm);

          const response = await fetch(`/admin/category/search?searchTerm=${encodeURIComponent(searchTerm)}&page=${pageNumber}`);
          const data = await response.json();
          const categories = data.categories;
          renderCategories(categories);
        } catch (error) {
          console.log('Error in loadURL',error);
        }
     }


     /**
     * Renders category list dynamically
     * @param {Array} categories
     */

     async function renderCategories(categories){
      try {
       const categoriesContainer = document.getElementById('categoriesContainer');
       
       if(!categories || categories.length==0){
        categoriesContainer.innerHTML = '<div class="text-center py-8 text-gray-400">No Category found</div>';
        return
       }
       
       categoriesContainer.innerHTML='';

        categories.forEach((category,index)=>{
        const categoryRow = document.createElement('div');
        categoryRow.id = `category-${category._id}`
        categoryRow.className = `${category.isDeleted}?
        "bg-gray-600 backdrop-blur-sm text-gray-400 rounded-[1.5rem] p-4 grid grid-cols-12 gap-4 items-center transform transition-all duration-500 border border-gray-500 border-opacity-30 opacity-50 cursor-not-allowed"
        :
        "bg-black backdrop-blur-sm text-white rounded-[1.2rem] p-4 grid grid-cols-12 gap-4 items-center transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl border border-white border-opacity-40`

        categoryRow.style.animation = `slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${index * 0.1}s`;

        categoryRow.innerHTML = `
        
        <div class="col-span-1">${index + 1}</div>
        <div class="col-span-6 text-center ${category.isDeleted ? 'line-through' : '' }">
          ${category.name}
        </div>

        <div class="col-span-2">
           ${category.isDeleted 
            ? '<span class="text-red-500">Deleted</span>'
           : !category.isActive 
            ?'<span class="text-orange-500">Inactive</span>'
            :'<span class="text-green-500">Active</span>'
           }
        </div>


        <div class="col-span-3 space-x-3">
          <i id="editBtn" class="fa-solid fa-pen cursor-pointer 
            ${category.isDeleted ? 'pointer-events-none':''}"
            style="color: #ffffff;"
            onclick="openEditModal('${category.id}', '${category.name}')"></i>

      
          <i id="blockBtn" class="fa-solid fa-lock cursor-pointer
            ${category.isDeleted ? 'pointer-events-none':''}
            ${category.isActive ? '' : 'hidden'}"
            style="color: #cc2424;" onclick="blockCategory('${category._id}')"></i>

     
          <i id="${category._id}" class="fa-solid fa-lock-open cursor-pointer 
            ${category.isActive ? 'hidden':''}"
            style="color: #04a978;" onclick="unblockCategory('${category._id}')"></i>

          <i class="fa-solid fa-trash cursor-pointer ${category.isDeleted ? 'hidden' : ''}"
            style="color: #ffffff;" onclick="deleteCategory('${category._id }')"></i>


          <i class="fa-solid fa-trash-arrow-up cursor-pointer ${category.isDeleted ? '' : 'hidden'}"
            style="color: #ff0000;" onclick="restoreCategory('${category._id}')"></i>

        </div>
  
        `;

        categoriesContainer.appendChild(categoryRow)
       })
      } catch (error) {
        console.log('Error in rendering categories',error);
      }
     }