


  //Filter Management

  document.addEventListener('DOMContentLoaded', () => {

    const filterToggle = document.getElementById('filterToggle');
    const sortDropdown = document.getElementById('sortDropdown');
    const filterDropdown = document.getElementById('filterDropdown');



    filterToggle.addEventListener('click', () => {
      filterDropdown.classList.toggle('hidden');
    });

    filterDropdown.addEventListener('click', (e) => {
      if (e.target == filterDropdown) {
        filterDropdown.classList.add('hidden');
      }
    });

    sortToggle.addEventListener('click', () => {
      sortDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (event) => {
      if (!filterDropdown.classList.contains('hidden') && !filterDropdown.contains(event.target) && !filterToggle.contains(event.target)) {
        filterDropdown.classList.add('hidden');
      }
    });

    document.addEventListener('click', (event) => {
      if (!sortDropdown.classList.contains('hidden') && !sortDropdown.contains(event.target) && !sortToggle.contains(event.target)) {
        sortDropdown.classList.add('hidden');
      }
    });

    

    // ============================= //
    // PRICE RANGE SLIDER CONTROLLER //
    // ============================= //

    //DOM elements
    const minSlider = document.getElementById('priceMin');
    const maxSlider = document.getElementById('priceMax');
    const minInput = document.getElementById('priceMinInput');
    const maxInput = document.getElementById('priceMaxInput');

    // Configuration Constants
    const minValue = 0;
    const maxValue = 100000;
    const step = 500;

    /**
     * @description Synchronises Slider and Input box 
     * @rules
     * -Minimum price cannot be negative
     * -Minimum and maximum must maintain minimum step difference
     * -Values cannot exceed range limits
     */ 



    function sync(){


          let minPrice = parseInt(minSlider.value);
          let maxPrice = parseInt(maxSlider.value);

              // Ensure minPrice is not negative
              if (minPrice < minValue) {
                minPrice = minValue;
                minSlider.value = minPrice;
              }

              //Ensure maxPrice is atleast one step above minPrice
              if(minPrice>maxPrice-step){
                maxPrice=minPrice+step;
                maxInput.value=maxPrice;
                maxSlider.value=maxPrice
              }

                // Ensure maxPrice exeeds the limit
                if (maxPrice > maxValue) {
                maxPrice = maxValue;
                maxSlider.value = maxPrice;
              }

              // Ensure minPrice is atleast one step below maxPrice
              if(minPrice>maxValue-step){
                minPrice=maxValue-step;
                minSlider.value=minPrice;
                minInput.value=minPrice;
              }
        
        // Update Input fields
        minInput.value=minPrice;
        maxInput.value=maxPrice

    }
        // Event Listeners
        minSlider.addEventListener('input',sync)
        maxSlider.addEventListener('input',sync)

      // Initialize for Initial State Consistency  
      sync();


    // const filterForm = document.getElementById('filterForm');
    
    // filterForm.addEventListener('submit',()=>{
    //   filterForm.reset();
    // })
  });



  document.addEventListener('DOMContentLoaded',(e)=>{

    //handle Sort
    document.querySelectorAll('.sort-option').forEach((button)=>{
      button.addEventListener('click',(e)=>{
        console.log('Button Clicked')
        const sortValue = e.target.dataset.sort;
        loadURL('sort',sortValue)
      })
    })

    //handle form
    const form = document.getElementById('filterForm');
    if(form){
      form.addEventListener('submit',(e)=>{
        e.preventDefault(); //prevent default form submission, which may overwrite the URL without preserving parameters
        const formData = new FormData(form);
        loadURL(undefined,undefined,formData)
      })

    }
  })
 

  function loadURL(name,value,input=''){
    
    const params= new URLSearchParams(window.location.search); //Get current URL parameters

    //updates sort and pagination parameters if provided
    if(name!=undefined && value!=undefined){
      params.set(name,value)
    }
    
    //merge form data with existing parameters
    if(input instanceof FormData){
      const formParams=new URLSearchParams(input)
      for(let [key,value] of formParams.entries()){
        params.set(key,value)
      }
    }
  
  //prvents unnecessary page loads.Meaningful changes will result in page loads
   const newURL =`${window.location.pathname}?${params.toString()}`

    if(newURL!==window.location.href){
      window.location.href=newURL;
    }





  }