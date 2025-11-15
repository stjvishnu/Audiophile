
/**
 * Implemenets Search Functionality once the DOM is fully loaded.
 * 
 * - Sets up debounced event handler to search bar.
 * - Fetches matching products from the server using Axios.
 * - Renders the search results dynamically in the searc result container.
 */

document.addEventListener('DOMContentLoaded',()=>{
  const search=document.getElementById('searchInput');
  const searchIcon = document.getElementById('searchIcon');

  /**
   * 
   * @param {Function} fn - Function to Debounce
   * @param {number} timer - Delay in milliseconds before executing the function
   * @returns {Function} fn -Debounced Function
   */

      function debounce(fn,timer){
        let timeout;
        return function(...args){
            clearTimeout(timeout);
            timeout=setTimeout(()=>{
                fn.apply(this,args)
            },timer)
        }
      }


      /**
       * Abstract input field, fetches products from the server and calls render function
       * 
       * @param {Event} event - Input event object from search field 
       */

      function productSearch(event){
        const searchIcon = document.getElementById('searchIcon');
          const searchQuery=encodeURIComponent(event.target.value); //input value

          if(/[*%$?\\]/.test(searchQuery)){ //avoid special characters that may crash the server
            searchQuery=searchQuery.replaceAll(/[*%$?\\]/g,'').trim()
          }
          if(searchQuery && searchQuery!==''){
            searchIcon.classList.remove('pointer-events-none');
            searchIcon.classList.add('pointer-events-auto');
          }else{
            searchIcon.classList.remove('pointer-events-auto');
            searchIcon.classList.add('pointer-events-none');
          }
          console.log(searchQuery);
          axios.get(`/user/products/searchProducts?search=${searchQuery}`) //fetches the product
          .then((response)=>{
            if(!response){
              throw new Error ('Search Failed')
            }
            const products=response.data;
            console.log(products);
            renderSearchProducts(products) // to render the products below search bar
          })
          .catch((err)=>console.log(err))
      }

        /**
         * Retrieve product name and product image from product object and render it by injecting into the webpage as strings.
         * Browseer will parse the string and convert into html elements accordingly.
         * 
         * @param {Array<objects>} products - Array of product objects
         * @param {string} -product[].name - Product name
         * @param {string} -product[].profductImages - Array of image URLs of the product
         */

        function renderSearchProducts(products){
          const searchResultContainer=document.getElementById('searchResult');
          const searchInput=document.getElementById('searchInput');
          const query=searchInput.value.trim();

          //clear search results ,if the user clearns the input
          if(query===''){
            searchResultContainer.innerHTML=''; //empty the box
            searchResultContainer.classList.add('hidden'); //hide the result box
            return
          }

        
            if(products.length==0){
              searchResultContainer.innerHTML= '<div class= "gap-6 p-2 bg-white hover:bg-gray-100 cursor-none border border-gray-200 rounded-[2rem]"> <p class="p-1 text-sm text-0gray-500">No Products Found</p> </div>'
              searchResultContainer.classList.remove('hidden');
              return
            }
            
            searchResultContainer.innerHTML = products.map((product) => (
              `<div class='flex items-center gap-6 p-2 bg-white hover:bg-gray-100 cursor-pointer border border-gray-200 rounded-[2rem]'>
              <a href='/user/products/productPage/${product._id}' class="flex items-center gap-6">
                <img src='${product.variants[0].attributes.productImages[0]}' alt='${product.name}' class='w-8 h-6 object-contain rounded'>
                <span class='text-sm text-gray-800 font-medium'>${product.name}</span>
              </a>
            </div>
            `
          )).join('');

          document.addEventListener('click',(e)=>{
            if(!searchInput.contains(e.target) && !searchResultContainer.contains(e.target)){
                searchResultContainer.classList.add('hidden')
            }
          })

            searchResultContainer.classList.remove('hidden')
        }

    const handleSearch=debounce(productSearch,400) 
    search.addEventListener('input',handleSearch) // event handler statement for search field

    searchIcon.addEventListener('click',()=>{
      const searchQuery = search.value
      if(/[*$%\\]/.test(searchQuery)){
        searchQuery=searchQuery.replaceAll(/[*$%\\]/g,'')
      }
      window.location.href=`/user/products/searchProductsPage?${searchQuery}`
    })
})

