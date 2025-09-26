async function openAddModal(productId=null) {
  let product;
  if(productId){
    const title = document.getElementById('modalTitle');
    const titleTag = document.getElementById('modalTitleTag');
    const submitBtn= document.getElementById('submitBtn')
    title.innerText='Edit Product';
    titleTag.innerText='Edit Your Inventory';
    submitBtn.innerText='Edit Product'
    console.log(productId);
    const response=await fetch(`/admin/products/getSingleProduct/${productId}`);
    product = await response.json();
    
  }
 
  const addModal = document.getElementById('productAddModal');
  addModal.classList.remove('hidden');
  setTimeout(() => {
    addModal.classList.add('show');
  }, 10)
  document.body.classList.add('modal-open');


  const form = document.getElementById('productForm');

  //validation of form fields

  let isValid = true;

  const productNameContainer = document.getElementById("name");
  const brandContainer = document.getElementById("brand");
  const categoryContainer = document.getElementById("category");
  const subCategoryContainer = document.getElementById("subCategory");
  const description1Container = document.getElementById("description1");
  const description2Container = document.getElementById("description2");
  const driverContainer = document.getElementById("driver");
  const driverConfigurationContainer = document.getElementById("driverConfiguration");
  const impedanceContainer = document.getElementById("impedance");
  const soundSignatureContainer = document.getElementById("soundSignature");
  const microphoneContainer = document.getElementById("microphone");
  const isActive = document.getElementById('isActive')

  //Edit Mode
  if(productId){
    productNameContainer.value=product?.name||null;
    brandContainer.value=product?.brand||null;
    categoryContainer.value=product?.category?.name||null;
    subCategoryContainer.value=product?.subCategory||null;
    description1Container.value=product?.description1||null;
    description2Container.value=product?.description2||null;
    driverContainer.value=product?.productDetails?.driver||null;
    driverConfigurationContainer.value=product?.productDetails?.driverConfiguration||null;
    impedanceContainer.value=product?.productDetails?.impedance||null;
    soundSignatureContainer.value=product?.productDetails?.soundSignature||null;
    microphoneContainer.value=product?.productDetails?.mic||null;
    isActive.value=product?.isActive||null;
    
  }



  function showError(inputId, message, index = null) {
    
    const errorId = index ? `${inputId}-error-${index}` : `${inputId}-error`
    console.log('Error id is', errorId);
    const errorDiv = document.getElementById(errorId);
    console.log(errorDiv)
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden')
    } 
  }


  function removeError(inputId, index = null) {
    
    const errorId = index ? `${inputId}-error-${index}` : `${inputId}-error`;
    
    const errorDiv = document.getElementById(errorId);
    if (errorDiv) {
      errorDiv.classList.add('hidden');
    } 
  }

  function validateField(input) {
    const inputId = input.id;
    const value = input.value;

    if (inputId == 'name') {
      if (!value.trim()) {
        showError(inputId, 'Product name is required');
        isValid = false;
      } else if (value.length < 3) {
        showError(inputId, 'Product name should be at least 3 characters');
        isValid = false;
      }
    }

    if (inputId == 'category') {
      if (!value.trim()) {
        showError(inputId, 'Product name is required');
        isValid = false;
      }
    }

    if (inputId == 'brand') {
      if (!value.trim()) {
        showError(inputId, 'Brand name is required');
        isValid = false;
      } else if (value.length < 3) {
        showError(inputId, 'Brand name should be at least 3 characters');
        isValid = false;
      }
    }

    if (inputId == 'subCategory') {
      const subCategories = ['Beginner', 'Intermediate', 'Advanced'];
      if (!value.trim()) {
        showError(inputId, 'Product name is required');
        isValid = false;
      } else if (!subCategories.includes(value)) {
        showError('subCategory', 'SubCategory Should Beginner,Intermediate or advanced');
        isValid = false;
      }
    }


    if (inputId == 'description1') {
      if (!value.trim()) {
        showError(inputId, 'Primary description is required');
        isValid = false;
      } else if (value.length < 10) {
        showError(inputId, 'Description 1 must be at least 10 characters');
        isValid = false;
      } else if (value.length > 500) {
        showError(inputId, "Description 1 must not exceed 500 characters")
        isValid = false;
      }
    }

    if (inputId == 'description2') {
      if (!value.trim()) {
        showError(inputId, 'Secondary description is required');
        isValid = false;
      } else if (value.length < 10) {
        showError(inputId, 'Description 2 must be at least 10 characters');
        isValid = false;
      } else if (value.length > 500) {
        showError(inputId, "Description 2 must not exceed 500 characters")
        isValid = false;
      }
    }

    if (inputId == 'isActive') {
      if (!value.trim()) {
        showError(inputId, 'Product Active required');
        isValid = false;
      }
    }

    if (inputId == 'driver') {
      if (!value.trim()) {
        showError(inputId, 'driver name is required');
        isValid = false;
      } else if (value.length < 3) {
        showError(inputId, 'driver name should be at least 3 characters');
        isValid = false;
      }
    }

    if (inputId == 'driverConfiguration') {
      if (!value.trim()) {
        showError(inputId, 'driverConfiguration is required');
        isValid = false;
      } else if (value.length < 2) {
        showError(inputId, 'driverConfiguration should be at least 2 characters');
        isValid = false;
      }
    }

    if (inputId == 'impedance') {
      if (!value) {
        showError('impedance', 'Impedence  is required');
        isValid = false;
      } else if (isNaN(Number(value))) {
        showError('impedance', 'Impedence should be number');
        isValid = false;
      }
    }

    if (inputId == 'microphone') {
      if (!value) {
        showError('microphone', 'microphone is required');
        isValid = false;
      }
    }

    if (inputId == 'soundSignature') {
      if (!value) {
        showError('soundSignature', 'soundSignature is required');
        isValid = false;
      }
    }

    if (inputId == 'soundSignature') {
      if (!value) {
        showError('microphone', 'microphone is required');
        isValid = false;
      }
    }


  }




  //Attach event listeners for non-variant fields

  [
    productNameContainer,
    brandContainer,
    categoryContainer,
    subCategoryContainer,
    description1Container,
    description2Container,
    driverContainer,
    driverConfigurationContainer,
    impedanceContainer,
    soundSignatureContainer,
    microphoneContainer,
    isActive
  ].map((input) => {
    input.addEventListener('blur', () => {
      validateField(input)
    })
    input.addEventListener('focus', () => {
      const inputId = input.id;
      const errorId = inputId.split('-')[0]
      removeError(errorId)
    })

  })


  function validateVariantField(input, index) {
    const inputId = input.id;
    const errorId = inputId.split('-')[0]


    if (inputId.startsWith(`sku-${index}`)) {
      if (!input.value.trim()) {
        showError(errorId, 'SKU is required', index);
        isValid = false;
      }
    }
    if (inputId.startsWith(`color-${index}`)) {
      if (!input.value.trim()) {
        showError(errorId, "Color is required", index);
        isValid = false;
      }
    }
    if (inputId.startsWith(`plug-${index}`)) {
      if (!input.value.trim()) {
        showError(errorId, "Plug is required", index);
        isValid = false;
      }
    }
    if (inputId.startsWith(`mic-${index}`)) {
      if (!input.value.trim()) {
        showError(errorId, "mic is required", index);
        isValid = false;
      }
    }

    if (inputId.startsWith(`price-${index}`)) {
      if (!input.value.trim() || isNaN(input.value) || Number(input.value) <= 0) {
        showError(errorId, "Price must be a positive number", index);
        isValid = false;
      }
    }

    if (inputId.startsWith(`stock-${index}`)) {
      if (!input.value.trim() || isNaN(input.value) || Number(input.value) < 0) {
        showError(errorId, "Stock must be a valid number", index);
        isValid = false;
      }
    }
    if (inputId.startsWith(`discount-${index}`)) {
      if (!input.value.trim() || isNaN(input.value) || Number(input.value) < 0) {
        showError(errorId, "discount must be a valid number", index);
        isValid = false;
      }
    }
    if (inputId.startsWith(`isActive-${index}`)) {
      if (!input.value.trim()) {
        showError(errorId, "Product status is required", index);
        isValid = false;
      }
    }

    return isValid;
  }



  function attachVariantValidation(variantDiv, index) {
    const inputs = variantDiv.querySelectorAll('input,select')



    inputs.forEach((input) => {
      if (input.tagName == 'select') {
        input.addEventListener('change', () => {
          validateVariantField(input, index);
        })
      }

      input.addEventListener('blur', () => {
        validateVariantField(input, index);
      })
      input.addEventListener('focus', () => {
        const inputId = input.id;
        const errorId = inputId.split('-')[0]
        removeError(errorId, index)
      })
    });

  }





  //image event listner

  const modal = document.getElementById("cropperModal");
  const cropperImage = document.getElementById("cropperImage");
  const confirmBtn = document.getElementById("confirmCrop");
  const cancelBtn = document.getElementById("cancelCrop");

  let cropper // cropper instance
  let currentPreview = null; // preview element for current file input
  let currentInput = null; // file input being used

  let croppedImages = {};


  function imageEventListener(variantDiv) {
    const imgDivs = variantDiv.querySelectorAll('input[type="file"][id^="productImage"]');

    imgDivs.forEach((imgInput) => {
      console.log(imgInput,'trouble');
      imgInput.addEventListener('change', (e) => {
        // console.log(imgInput);
        const file = e.target.files[0];
    
        if (file.size > 10485760) {

          showToast('warning', 'Size is too large');
          modal.classList.add('hidden')
          return
        }

        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            cropperImage.src = e.target.result;
            modal.classList.remove('hidden')

            // console.log('hello',"preview-" +imgInput.id);
            currentInput = imgInput; // store current input for later reset

            currentPreview = document.getElementById("preview-" + imgInput.id);



            cropper = new Cropper(cropperImage, {
              aspectRatio: 1,
              viewMode: 1,
            })
          }

          reader.readAsDataURL(file)
        }

      })
    })
  }

  //cropper cancel button
  cancelBtn.addEventListener('click', () => {
    if (cropper) {
      cropper.destroy();
      modal.classList.add('hidden')
      // if(currentInput){
      //   currentInput.value="";
      // }
    }
  })

  //cropper confirm button
  confirmBtn.addEventListener('click', () => {
    if (cropper) {
      const canvas = cropper.getCroppedCanvas({imageSmoothingEnabled: false});
      console.log(canvas);
      canvas.toBlob((blob) => {
        const croppedUrl = URL.createObjectURL(blob);
        if (currentPreview) {

          currentPreview.innerHTML =
            `<img src='${croppedUrl}' class='object-cover w-full h-full rounded-lg'>
           <button type="button" id='cancel-image' class=" absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full" >
           <i class="fa-solid fa-xmark"></i>
         </button>
         <button type="button" id='recrop-btn' class="recrop-btn absolute top-2 right-10 bg-blue-500 text-white p-1 rounded-full" >
           <i class="fa-solid fa-crop"></i>
         </button> `

          croppedImages[currentInput.id] = blob;
          intializeBtn(currentInput,currentPreview);
        }

        cropper.destroy();
        cropper = null;
        modal.classList.add('hidden')
      },'image/png',1.0)


    }
  })
  function appendImages(newVariant,index,images){
   images.forEach((image,i)=>{
    const imgInput = newVariant.querySelector(`#productImage${i+1}-${index}`)
    console.log(imgInput);
    const preview = newVariant.querySelector(`#preview-productImage${i+1}-${index}`);
    console.log('preview',preview);
    if(image){
      preview.innerHTML=`
      <img src='${image}' class='object-cover w-full h-full rounded-lg'>
      <button type="button" id='cancel-image' class=" absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full" >
      <i class="fa-solid fa-xmark"></i>
    </button>
    <button type="button" id='recrop-btn' class="recrop-btn absolute top-2 right-10 bg-blue-500 text-white p-1 rounded-full" >
      <i class="fa-solid fa-crop"></i>
    </button> `
    croppedImages[`productImage${i+1}-${index}`]=image;
    currentInput=imgInput;
    currentPreview=preview;
    intializeBtn(currentInput,currentPreview);
    }
   })

  }
  function intializeBtn(currentInput=null,currentPreview=null) {
    console.log('Inside currentPreview');
    const cancelImageBtn = currentPreview.querySelector('#cancel-image');
    console.log('Btn cheeck',cancelImageBtn);
    const recropImageBtn = currentPreview.querySelector('#recrop-btn');

    cancelImageBtn.addEventListener('click', () => {
      console.log('Cancel btn clicked');
      console.log(currentPreview);
      currentPreview.innerHTML = '';
      delete croppedImages[currentInput.id];
      currentInput.value = ''
    })

    recropImageBtn.addEventListener('click', () => {
      console.log('Cropper btn clicked');
      const img = currentPreview.querySelector('img');
      if (img) {
        cropperImage.src = img.src;
        modal.classList.remove('hidden')

        cropper = new Cropper(cropperImage, {
          aspectRatio: 1,
          viewMode: 1,
        });
      }
    })

  }



  //attach image event listener to current variant
  imageEventListener(document)
  attachVariantValidation(document, 1)




  //Variant Handling

  let variantCount = document.querySelectorAll('.variants').length;
  const variant = document.getElementById('variant');
  const variantsContainer = document.getElementById('variantsContainer')
  const variantBtn = document.getElementById('addVariantBtn');

  //Intialize variants for edit mode
  if(productId){
    variantsContainer.innerHTML='';
    product.variants.forEach((variantObj,ind)=>{
      let index=ind+1;
      const newVariant = variant.cloneNode(true);

      newVariant.querySelector("h3 span").textContent = ` 🛒 Product Variant ${index}`;
      newVariant.querySelectorAll('input, select, textarea, div.imagePreview,label,div.error-div')
      .forEach((el) => {

        if (el.id) {
          if (el.id.split('-').length > 2) {
            const firstName = el.id.split('-')[0];
            const secondName = el.id.split('-')[1];
            el.id = `${firstName}-${secondName}-${index}`;
          } else {
            const baseId = el.id.split('-')[0];
            el.id = `${baseId}-${index}`;

          }

        }
        if (el.tagName === 'LABEL' && el.hasAttribute('data-variant')) {
          const baseFor = el.getAttribute('for').split('-')[0];
          el.setAttribute('for', `${baseFor}-${index}`);
        }

        if (el.name) {
          const baseName = el.name.split('-')[0];
          el.name = `${baseName}-${index}`;
        }
        if (el.classList.contains('imagePreview')) {
          el.innerHTML = ''
        }
        
if (el.id.startsWith(`sku-${index}`)) el.value = variantObj.sku || '';
      if (el.id.startsWith(`color-${index}`)) el.value = variantObj.attributes.color || '';
      if (el.id.startsWith(`plug-${index}`)) el.value = variantObj.attributes.plug || '';
      if (el.id.startsWith(`mic-${index}`)) el.value = variantObj.attributes.mic || '';
      if (el.id.startsWith(`price-${index}`)) el.value = variantObj.attributes.price || '';
      if (el.id.startsWith(`stock-${index}`)) el.value = variantObj.attributes.stock || '';
      if (el.id.startsWith(`discount-${index}`)) el.value = variantObj.attributes.discount || '';
      if (el.id.startsWith(`isActive-${index}`)) el.value = variantObj.attributes.isActive || '';

      });
      appendImages(newVariant,index,variantObj.attributes.productImages)
      attachVariantValidation(newVariant, index)
      imageEventListener(newVariant)
      variantsContainer.appendChild(newVariant)

    })
  }

  //Validate all variants before adding new variant

  function validateAllVariants() {
    isValid = true;
    const variantList = document.querySelectorAll('.variants');
    variantList.forEach((variantDiv, ind) => {
      const index = ind + 1;
      const inputs = variantDiv.querySelectorAll('input,select');
      inputs.forEach((input) => {
        validateVariantField(input, index);
      });
      const images = [
        croppedImages[`productImage1-${index}`],
        croppedImages[`productImage2-${index}`],
        croppedImages[`productImage3-${index}`],
        croppedImages[`productImage4-${index}`],
        croppedImages[`productImage5-${index}`],
      ]
      console.log(images);
      if (!images.every(img => img)) {
        showError(`productImages`, 'All 5 Images Required', index);
        isValid = false
      } else {
        removeError('productImages', index);
      }
    });
    return isValid;
  }

  variantBtn.addEventListener('click', () => {

    console.log('Variant btn clicked');
    if (!validateAllVariants()) {
      showToast('warning', 'Validate All Variants before adding new one');
      return;
    }
    variantCount = document.querySelectorAll('.variants').length;
    variantCount++;

    const newVariant = variant.cloneNode(true);

    newVariant.querySelector("h3 span").textContent = ` 🛒 Product Variant ${variantCount}`;
    newVariant.querySelectorAll('input, select, textarea, div.imagePreview,label,div.error-div')
      .forEach((el) => {

        if (el.id) {
          if (el.id.split('-').length > 2) {
            const firstName = el.id.split('-')[0];
            const secondName = el.id.split('-')[1];
            el.id = `${firstName}-${secondName}-${variantCount}`;
          } else {
            const baseId = el.id.split('-')[0];
            el.id = `${baseId}-${variantCount}`;

          }

        }
        if (el.tagName === 'LABEL' && el.hasAttribute('data-variant')) {

          const baseFor = el.getAttribute('for').split('-')[0];
          el.setAttribute('for', `${baseFor}-${variantCount}`);
        }

        if (el.name) {
          const baseName = el.name.split('-')[0];
          el.name = `${baseName}-${variantCount}`;
        }
        if (el.classList.contains('imagePreview')) {
          el.innerHTML = ''
        }
        el.value = ''

      });


    console.log(newVariant)

    imageEventListener(newVariant)
    attachVariantValidation(newVariant, variantCount)
    variantsContainer.appendChild(newVariant)
  })



  //-------------------------------------------------------------------------------------------




  //form submission

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Call inside submit');

    isValid = true; // Resetting Global isValid for validation on submission

    [
      productNameContainer,
      brandContainer,
      categoryContainer,
      subCategoryContainer,
      description1Container,
      description2Container,
      driverContainer,
      driverConfigurationContainer,
      impedanceContainer,
      soundSignatureContainer,
      microphoneContainer,
      isActive
    ].forEach((input) => {
      validateField(input)
    })

    //validate variants

    validateAllVariants();
    console.log('In form submission', isValid)

    if(!isValid){
      showToast('warning','Cannot Add Product,Error in Validation');
      return
    }

    

    //formData object
    const formData = new FormData();
    // console.log(Object.fromEntries(formData.entries()));

    // variants 
    // Accumilate variant data

    const variants = [];
    const variantList = document.querySelectorAll('.variants');


    variantList.forEach((variantDiv, ind) => {
      let index = ind + 1;
      const inputs = variantDiv.querySelectorAll('input,select')
      inputs.forEach((input) => {
        validateVariantField(input, index)
      })
      const images = [
        croppedImages[`productImage1-${index}`],
        croppedImages[`productImage2-${index}`],
        croppedImages[`productImage3-${index}`],
        croppedImages[`productImage4-${index}`],
        croppedImages[`productImage5-${index}`],
      ]
      if (!images.every(img => img)) {
        showError(`productImages`, 'All 5 Images Required', index);
        isValid = false
      } else {
        removeError('productImages', index);
      }
    })

   





    variantList.forEach((variant, ind) => {
      let index = ind + 1;
      variants.push({
        sku: document.getElementById(`sku-${index}`) ?.value || '',
        color: document.getElementById(`color-${index}`) ?.value || '',
        plug: document.getElementById(`plug-${index}`) ?.value || '',
        mic: document.getElementById(`mic-${index}`) ?.value || '',
        stock: document.getElementById(`stock-${index}`) ?.value || '',
        price: document.getElementById(`price-${index}`) ?.value || '',
        discount: document.getElementById(`discount-${index}`) ?.value || '',
        isActive: document.getElementById(`isActive-${index}`) ?.value || '',
        productImages: [
          croppedImages[`productImage1-${index}`] || null,
          croppedImages[`productImage2-${index}`] || null,
          croppedImages[`productImage3-${index}`] || null,
          croppedImages[`productImage4-${index}`] || null,
          croppedImages[`productImage5-${index}`] || null,

        ]
      })
    })

    //appending value to formData
    formData.append('name', document.getElementById('name') ?.value || '');
    formData.append('brand', document.getElementById('brand') ?.value || '');
    formData.append('category', document.getElementById('category') ?.value || '');
    formData.append('subCategory', document.getElementById('subCategory') ?.value || '');
    formData.append('isActive', document.getElementById('isActive') ?.value || 'true');
    formData.append('driver', document.getElementById('driver') ?.value || '');
    formData.append('driverConfiguration', document.getElementById('driverConfiguration') ?.value || '');
    formData.append('impedance', document.getElementById('impedance') ?.value || '');
    formData.append('soundSignature', document.getElementById('soundSignature') ?.value || '');
    formData.append('microphone', document.getElementById('microphone') ?.value || '');
    formData.append('description1', document.getElementById('description1') ?.value || '');
    formData.append('description2', document.getElementById('description2') ?.value || '');

    // Append variant fields
    variants.forEach((variant, index) => {
      formData.append(`variant-${index + 1}-sku`, variant.sku);
      formData.append(`variant-${index + 1}-color`, variant.color);
      formData.append(`variant-${index + 1}-plug`, variant.plug);
      formData.append(`variant-${index + 1}-mic`, variant.mic);
      formData.append(`variant-${index + 1}-stock`, variant.stock);
      formData.append(`variant-${index + 1}-price`, variant.price);
      formData.append(`variant-${index + 1}-discount`, variant.discount);
      variant.productImages.forEach((blob, i) => {
        if (blob && blob instanceof Blob) {
          formData.append(`variant-${index + 1}-image${i + 1}`, blob, `image${i + 1}.jpg`);
        }else if(blob){
          formData.append(`variant-${index + 1}-image${i + 1}`,blob)
        }
      });
    });

    console.log(Object.fromEntries(formData.entries()));
    fetch(productId?`/admin/products/edit/${productId}`:'/admin/products/add',{
      method:'PUT',
      body:formData
    })
    .then((response)=>{
      if(response.ok){
        return response.json();
      }
    })
    .then((data)=>{
      console.log('Response From server',data);
      document.getElementById('productAddModal').classList.add('hidden');
      window.location.reload();
      setTimeout(()=>{
        showToast('success',productId?'Product Edited Successfully':'Product Added Successfully');
      },1500)
     
    })
    .catch((err)=>{
      showToast('error',err.message)
    })
   })

  // Close modal buttons
  document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('productAddModal').classList.add('hidden');
  });
  document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('productAddModal').classList.add('hidden');
  });

}