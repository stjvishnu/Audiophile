
  /**
    * Deletes a category after confirmation
    * @param {string} productId
    */

    async function deleteProduct(productId) {
      try {

        const result = await sweetAlert('warning','Are you sure ? ','You are about to delete this user.! ',true,true)

        if (result.isConfirmed) {
          const response = await fetch(`/admin/products/soft-delete/${productId}`, {
            method: 'DELETE'
          })

          if (response.ok) {
            await sweetAlert('success','Deleted','Product has been deleted successfully',false,false,1000)
            window.location.reload();
          } else {
            throw new Error('Failed to delete the product')
          }
        }


      } catch (err) {
        showToast('error','Something went wrong')
        console.log('Error in  Delete Product',err);
      }

}

async function restoreProduct(productId) {


  try {

    const result = await sweetAlert('warning','Are you sure ? ','You are about to restore this Product !',true,true)


    if (result.isConfirmed) {
      const response = await fetch(`/admin/products/restore-deleted-product/${productId}`, {
        method: 'PATCH'
      })

      

      if (response.ok) {

        await sweetAlert('success','Restored','Category has been restored successfully',false,false,1000)

        window.location.reload()
      } else {
        throw new Error('Failed to restore product')
      }



    }

  } catch (err) {
    showToast('error','Something went wrong')
    console.log('Error in Restore Category',err);
  }


}


async function blockProduct(productId) {

  try {

    const result = await sweetAlert('warning','Are you sure ? ','You want to Block this Product.! ',true,true)

    if (result.isConfirmed) {
      const response = await fetch(`/admin/products/block-product/${productId}`, {
        method: 'PATCH'
      })

      if (response.ok) {
        await sweetAlert('success','Blocked','Product has been succesfully blocked',false,false,1000)

        window.location.reload()
      } else {
        throw new Error('Failed to block product')
      }
    }

  } catch (err) {
    showToast('error','Something went wrong')
    console.log('Error in block Category',err);
  }

}

async function unblockProduct(productId) {

  try {

    const result = await sweetAlert('warning','Are you sure ? ','You are about to unBlock this Product.!',true,true)

    if (result.isConfirmed) {
      const response = await fetch(`/admin/products/unblock-product/${productId}`, {
        method: 'PATCH'
      })

      if (response.ok) {
        await sweetAlert('success','unBlocked','Product has been  unBlocked succesfully',false,false,1000)

        window.location.reload()
      } else {
        throw new Error('Failed to unblock product')
      }
    }

  } catch (err) {
    showToast('error','Something went wrong')
    console.log('Error in block Category',err);
  }

}



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
       
       let previousProducts = [];
       
        /**
        * Loads all categories initially for fallback rendering
        */

        async function loadProducts() {
          
          const res = await fetch('/admin/products/loadProducts');
          const data = await res.json();
          previousProducts = data.products;
        }
        loadProducts();

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
            const productsContainer=document.getElementById('productsContainer');
    
            productsContainer.innerHTML = '<div class="text-center py-8" > Searching... </div> '
    
            if (searchTerm === '') {
              renderProducts(previousProducts);
              return;
            }
    
            // Remove special characters that may break backend
            if(/[*%$?\\]/.test(searchTerm)){ 
              searchTerm=searchTerm.replaceAll(/[*%$?\\]/g,'').trim()
            }
    
            const response = await fetch(`/admin/products/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    
            if (!response.ok) throw new Error('Search Failed')
        
            const data = await response.json();
            const products = data.products;
            renderProducts(products);
    
          } catch (error) {
            console.log('Error in get handleSearch', error);
            productsContainer.innerHTML = '<div class="text-center py-8 text-red-500" > Error Loading Results </div>'
          }
         }

    /**
     * Handles pagination
     * @param {String} pageNumber
     */

     async function loadURL(pageNumber){
      try {
        console.log('Search term in loadUrl products',searchTerm);
        const response = await fetch(`/admin/products/search?searchTerm=${encodeURIComponent(searchTerm)}&page=${pageNumber}`);
        const data = await response.json();
        const products = data.products;
        renderProducts(products);
      } catch (error) {
        console.log('Error in loadURL',error);
      }
   }
   

    /**
     * Renders category list dynamically
     * @param {Array} categories
     */

    async function renderProducts(products){
      try {
       const productsContainer = document.getElementById('productsContainer');
       
       if(!products || products.length==0){
        productsContainer.innerHTML = '<div class="text-center py-8 text-gray-400">No Category found</div>';
        return
       }
       
       productsContainer.innerHTML='';

        products.forEach((product,index)=>{
        const productRow = document.createElement('div');
        productRow.id = `product-${product._id}`
        productRow.className = `${product.isDeleted?
          
        "bg-gray-600 backdrop-blur-sm text-gray-400 rounded-lg p-3 grid grid-cols-12 gap-4 items-center transform transition-all duration-500 border border-gray-500 border-opacity-30 opacity-50 cursor-not-allowed"
                :
                "bg-black  backdrop-blur-sm text-white rounded-lg p-3 grid grid-cols-12 gap-4 items-center transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl border border-white border-opacity-40 disabled:bg-black opacity-40"
                
    
        }`

        productRow.style.animation = `slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${index * 0.1}s`;

        productRow.innerHTML = `
        
        <div class="col-span-1 "> ${index+1} </div>
              <div class="col-span-1"> <img class="w-14 h-14  object-cover rounded-2xl transition-transform duration-300 ease-in-out hover:scale-125" src="${product.variants[0]?.attributes?.productImages[0]}" alt="${product.name}"> </div>
                <div class="col-span-2 text-center ${product.isDeleted ? 'line-through' : '' }"> ${product?.name } </div>
                <div class="col-span-2 ${product.isDeleted ? 'line-through' : '' }"> ${product?.brand } </div>
                <div class="col-span-2 ${product.isDeleted ? 'line-through' : '' }"> ${product?.category?.name } </div>
                <div class="col-span-1 ${product.isDeleted ? 'line-through' : '' }">${product.variants[0]?.attributes?.price }</div>
                <div class="col-span-1">
                  ${product.isDeleted
                   ? '<span class="text-red-500 " >Deleted</span>' 
                 : product.isActive
                  ?  '<span class="text-green-500">Active</span>'
                   :  '<span class="text-orange-500">InActive</span>'
                   } 
                </div>


                <div class="col-span-2 space-x-2">
                  <i id="editBtn" class="fa-solid fa-pen cursor-pointer
                  ${product.isDeleted ? 'pointer-events-none':''}
                  " style="color: #ffffff;"
                   onclick="openAddModal('${product._id}')"></i>


                  <i id="blockBtn" class="
                  fa-solid fa-lock cursor-pointer
                  ${product.isDeleted ? 'pointer-events-none':''}
                  ${product.isActive ?'' :'hidden'}
                  " 
                  style="color: #cc2424;" onclick="blockProduct('${product._id}')"></i>


                  <i id="${product._id}" class="
                    fa-solid fa-lock-open cursor-pointer
                    ${product.isActive ? 'hidden':''}
                    " style="color: #04a978;" onclick="unblockProduct('${product._id}')"></i>


                  <i  class="fa-solid fa-trash cursor-pointer
                  ${product.isDeleted ? 'hidden' : ''}" 
                  style="color: #ffffff;"
                   onclick="deleteProduct('${product?._id }')"></i>


                   <i id="${product.isDeleted} " class=" fa-solid fa-trash-arrow-up cursor-pointer
                   ${product.isDeleted ? '' : 'hidden'} "
                    style="color: #ff0000;" onclick="restoreProduct('${product?._id}')"></i>

                </div>

              </div>
  
        `;

        productsContainer.appendChild(productRow)
       })
      } catch (error) {
        console.log('Error in rendering categories',error);
      }
     }