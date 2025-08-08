

document.addEventListener('DOMContentLoaded',()=>{
  const search=document.getElementById('searchInput');
  function debounce(fn,timer){
    let timeout;
    return function(...args){
        clearTimeout(timeout);
        timeout=setTimeout(()=>{
            fn.apply(this,args)
        },timer)
    }
}

function productSearch(event){
    const searchQuery=encodeURIComponent(event.target.value);
    axios.get(`/user/products/searchProducts?search=${searchQuery}`)
    .then((response)=>{
      if(!response){
        throw new Error ('Search Failed')
      }
      const products=response.data;
      renderSearchProducts(products)
    })
    .catch((err)=>console.log(err))

}

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
         <img src='${product.productImages[0]}' alt='${product.name}' class='w-8 h-6 object-contain rounded'>
         <span class='text-sm text-gray-800 font-medium'>${product.name}</span>
      </div>`
   )).join('');

   document.addEventListener('click',(e)=>{
    if(!searchInput.contains(e.target) && !searchResultContainer.contains(e.target)){
        searchResultContainer.classList.add('hidden')
    }
   })

    searchResultContainer.classList.remove('hidden')
}

const handleSearch=debounce(productSearch,400)
search.addEventListener('input',handleSearch)
})

