document.addEventListener("DOMContentLoaded", function () {
  const addVariantBtn = document.getElementById("addVariantBtn");
  const variantsContainer = document.getElementById("variantsContainer");

  //-----Image upload and cropper modal------
  const modal = document.getElementById("cropperModal");
  const cropperImage = document.getElementById("cropperImage");
  const confirmBtn = document.getElementById("confirmCrop");
  const cancelBtn = document.getElementById("cancelCrop");

  let cropper; // cropper instance
  let currentPreview; // preview element for current file input
  let currentInput; // file input being used

  let variantCount = 1;
  const croppedImages = {};
  attatchImageListeners(document);

  function attatchImageListeners(variantDiv) {
    // ✅ fixed selector: selects input[type=file] with id starting with "productImage"
    const inputs = variantDiv.querySelectorAll(
      'input[type="file"][id^="productImage"]'
    );

    inputs.forEach((input) => {
      // change event triggers whenever the user selects a file
      input.addEventListener("change", (e) => {
        console.log("Image input changed:", e.target.id); // Debug: Log input ID
        const file = e.target.files[0]; // input.files[0] is the first File object
        if (file) {
          const reader = new FileReader(); // built-in object to read a file

          // what to do AFTER reading finishes
          // cropper is an instance containing methods and properties like cropper.getCroppedCanvas(), cropper.destroy()
          reader.onload = (e) => {
            cropperImage.src = e.target.result; // show selected image in the modal
            modal.classList.remove("hidden"); // open modal

            currentInput = input; // store current input for later reset
            currentPreview = document.getElementById("preview-" + input.id);
            if (!currentPreview) {
              console.error(`Preview element not found for input ${input.id}`);
              return;
            }

            // start cropper
            cropper = new Cropper(cropperImage, {
              aspectRatio: 1,
              viewMode: 1,
            });
          };

          // asynchronous task — after completing reading it fires "onload" with the result
          reader.readAsDataURL(file);
        }
      });
    });
  }

  addVariantBtn.addEventListener("click", () => {
    console.log("Hits"); // Debug: Confirm button click
    variantCount++;
    const div = document.createElement("div");
    div.classList.add('variant');
    div.dataset.variantIndex = variantCount; // Store variant index
    div.innerHTML = `
        <div class="bg-gray-200 rounded-xl p-6 animate-fade-in mt-8">
        <h3 class="text-xl font-semibold text-slate-800 mb-6 flex items-center justify-between">
        <span class="flex items-center gap-2">
          🛒 Product Variant ${variantCount}
        </span>
        <button type="button" class="remove-variant">
        <i class="fa-solid fa-xmark fa-lg" style="color: #f50000;"></i>
        </button>
        </h3>
      
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-black">
            <!-- SKU -->
            <div class="lg:col-span-2">
              <label for="sku-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">
                SKU *
              </label>
              <input id="sku-${variantCount}" name="sku-${variantCount}" required placeholder="e.g., SKU12345" class="w-full px-4 py-3 border border-slate-300 rounded-lg 
                             focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
              <div class="text-red-500 text-sm hidden mt-1" id="sku-error-${variantCount}"></div>
            </div>

            <!-- Color -->
            <div>
              <label for="color-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">
                Color *
              </label>
              <input id="color-${variantCount}" name="color-${variantCount}" required placeholder="e.g., Red" class="w-full px-4 py-3 border border-slate-300 rounded-lg 
                             focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
              <div class="text-red-500 text-sm hidden mt-1" id="color-error-${variantCount}"></div>
            </div>

            <!-- Plug -->
            <div>
              <label for="plug-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">
                Plug *
              </label>
              <input id="plug-${variantCount}" name="plug-${variantCount}" required placeholder="e.g., 3.5mm, USB-C" class="w-full px-4 py-3 border border-slate-300 rounded-lg 
                             focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
              <div class="text-red-500 text-sm hidden mt-1" id="plug-error-${variantCount}"></div>
            </div>

            <!-- Mic -->
            <div>
              <label for="mic-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">
                Microphone *
              </label>
              <select id="mic-${variantCount}" name="mic-${variantCount}" required class="w-full px-4 py-3 border border-slate-300 rounded-lg 
                             focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all">
                <option value="">Select option</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
              <div class="text-red-500 text-sm hidden mt-1" id="mic-error-${variantCount}"></div>
            </div>

            <!-- Stock -->
            <div>
              <label for="stock-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">
                Stock *
              </label>
              <input id="stock-${variantCount}" name="stock-${variantCount}" type="number" min="0" required placeholder="0" class="w-full px-4 py-3 border border-slate-300 rounded-lg 
                             focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
              <div class="text-red-500 text-sm hidden mt-1" id="stock-error-${variantCount}"></div>
            </div>

            <!-- Price -->
            <div>
              <label for="price-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">
                Price ($) *
              </label>
              <input id="price-${variantCount}" name="price-${variantCount}" type="number" min="0" step="0.01" required placeholder="0.00" class="w-full px-4 py-3 border border-slate-300 rounded-lg 
                             focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
              <div class="text-red-500 text-sm hidden mt-1" id="price-error-${variantCount}"></div>
            </div>

            <!-- Discount -->
            <div>
              <label for="discount-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">
                Discount (%) *
              </label>
              <input id="discount-${variantCount}" name="discount-${variantCount}" type="number" min="0" max="100" required placeholder="0" class="w-full px-4 py-3 border border-slate-300 rounded-lg 
                             focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
              <div class="text-red-500 text-sm hidden mt-1" id="discount-error-${variantCount}"></div>
            </div>

            <div class="lg:col-span-3">
              <label class="block text-sm font-medium text-slate-700 mb-4">
                Product Images (5 required) *
              </label>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                ${[1, 2, 3, 4, 5].map(i => `
                  <div class="flex items-center justify-center w-full">
                    <label for="productImage${i}-${variantCount}" class="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative overflow-hidden">
                      <div id="preview-productImage${i}-${variantCount}" class="absolute inset-0 flex items-center justify-center"></div>
                      <div class="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                        <svg class="w-8 h-8 mb-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                        </svg>
                        <p class="text-xs text-gray-500">Click to upload</p>
                      </div>
                      <input id="productImage${i}-${variantCount}" name="productImage${i}-${variantCount}" type="file" accept="image/*" class="hidden" />
                    </label>
                  </div>
                `).join('')}
              </div>

              <div class="text-red-500 text-sm hidden mt-2" id="productImages-error-${variantCount}"></div>
            </div>
          </div>
        </div>
    `;
    variantsContainer.appendChild(div);
    attatchImageListeners(div);
    div.querySelector(".remove-variant").addEventListener("click", () => {
      // Clean up croppedImages for this variant
      [1, 2, 3, 4, 5].forEach(i => delete croppedImages[`productImage${i}-${div.dataset.variantIndex}`]);
      div.remove();
      variantCount--;
      console.log("Removed variant, new variantCount:", variantCount); // Debug: Log removal
      // Update indices of remaining variants
      document.querySelectorAll('.variant').forEach((variant, index) => {
        variant.dataset.variantIndex = index + 1;
        variant.querySelector('h3 span').textContent = `🛒 Product Variant ${index + 1}`;
      });
    });
  });

  // Cancel crop
  cancelBtn.addEventListener("click", () => {
    if (cropper) {
      cropper.destroy(); // stop the cropper
      modal.classList.add("hidden"); // hide modal
      if (currentInput) currentInput.value = ""; // clear the chosen file
    }
  });

  // Confirm crop
  confirmBtn.addEventListener("click", () => {
    console.log("Confirm crop clicked"); // Debug: Confirm button click
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas(); // canvas is a HTMLCanvasElement (a DOM element)
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Failed to create blob from canvas");
        return;
      }
      // blob is the binary image data
      const croppedUrl = URL.createObjectURL(blob); // url for preview

      // This shows the preview in preview-div
      currentPreview.innerHTML = `<img src="${croppedUrl}" class="object-cover w-full h-full rounded-lg"/>`;
      croppedImages[currentInput.id] = blob;
      console.log("croppedImages updated:", croppedImages); // Debug: Log cropped images
      // cleanup
      cropper.destroy();
      modal.classList.add("hidden");
      if (currentInput) currentInput.value = ""; // reset file input if needed
    });
  });

  document.getElementById('productForm').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log("Form submission triggered"); // Debug: Confirm submission
    const variants = [];
    const variantList = document.querySelectorAll('.variant'); // select all variant div as nodeList
    console.log("Variant List:", variantList); // Debug: Log variant list
    variantList.forEach((variantDiv, index) => {
      let variantIndex = variantDiv.dataset.variantIndex || (index + 1); // Use dataset or fallback to index
      const variantData = {
        sku: variantDiv.querySelector(`#sku-${variantIndex}`)?.value || '',
        color: variantDiv.querySelector(`#color-${variantIndex}`)?.value || '',
        plug: variantDiv.querySelector(`#plug-${variantIndex}`)?.value || '',
        mic: variantDiv.querySelector(`#mic-${variantIndex}`)?.value || '',
        stock: variantDiv.querySelector(`#stock-${variantIndex}`)?.value || '',
        price: variantDiv.querySelector(`#price-${variantIndex}`)?.value || '',
        discount: variantDiv.querySelector(`#discount-${variantIndex}`)?.value || '',
        images: [
          croppedImages[`productImage1-${variantIndex}`] || null,
          croppedImages[`productImage2-${variantIndex}`] || null,
          croppedImages[`productImage3-${variantIndex}`] || null,
          croppedImages[`productImage4-${variantIndex}`] || null,
          croppedImages[`productImage5-${variantIndex}`] || null,
        ],
      };
      variants.push(variantData);
    });

    console.log("Variants:", variants); // Debug: Log collected variants
    console.log("croppedImages:", croppedImages); // Debug: Log cropped images

    const formData = new FormData();
    // Append non-variant fields
    formData.append('name', document.getElementById('name')?.value || '');
    formData.append('brand', document.getElementById('brand')?.value || '');
    formData.append('category', document.getElementById('category')?.value || '');
    formData.append('subCategory', document.getElementById('subCategory')?.value || '');
    formData.append('stock', document.getElementById('stock')?.value || '');
    formData.append('isActive', document.getElementById('isActive')?.value || 'true');
    formData.append('driver', document.getElementById('driver')?.value || '');
    formData.append('driverConfiguration', document.getElementById('driverConfiguration')?.value || '');
    formData.append('impedance', document.getElementById('impedance')?.value || '');
    formData.append('soundSignature', document.getElementById('soundSignature')?.value || '');
    formData.append('plug', document.getElementById('plug')?.value || '');
    formData.append('microphone', document.getElementById('microphone')?.value || '');
    formData.append('description1', document.getElementById('description1')?.value || '');
    formData.append('description2', document.getElementById('description2')?.value || '');

    // Append variant fields
    variants.forEach((variant, index) => {
      formData.append(`variant-${index + 1}-sku`, variant.sku);
      formData.append(`variant-${index + 1}-color`, variant.color);
      formData.append(`variant-${index + 1}-plug`, variant.plug);
      formData.append(`variant-${index + 1}-mic`, variant.mic);
      formData.append(`variant-${index + 1}-stock`, variant.stock);
      formData.append(`variant-${index + 1}-price`, variant.price);
      formData.append(`variant-${index + 1}-discount`, variant.discount);
      variant.images.forEach((blob, i) => {
        if (blob) {
          formData.append(`variant-${index + 1}-image${i + 1}`, blob, `image${i + 1}.jpg`);
        }
      });
    });

    console.log("FormData entries:"); // Debug: Log FormData entries
    for (const [key, value] of formData.entries()) {
      console.log(key, value); // Debug: Log each entry
    }
    console.log(formData)
  //   // Submit form data

   fetch('/admin/products/add',{method:'POST',body:formData})
    .then((response)=>{
      document.getElementById('productModal').classList.add('hidden')
     return  response.json()
  })
    .then(data=>console.log('Server Response',data))
    .catch(error=>console.log('Error in form submitting',error))

  //     .then(response => response.json())
  //     .then(data => console.log("Server response:", data))
  //     .catch(error => console.error("Error submitting form:", error));
  });

  // Close modal buttons
  document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('productModal').classList.add('hidden');
  });
  document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('productModal').classList.add('hidden');
  });

  // Toggle isActive
  document.getElementById('isActiveToggle').addEventListener('click', (e) => {
    const isActive = e.currentTarget.dataset.active === 'true';
    e.currentTarget.dataset.active = !isActive;
    e.currentTarget.querySelector('span').classList.toggle('translate-x-6', !isActive);
    e.currentTarget.querySelector('span').classList.toggle('translate-x-0', isActive);
    document.getElementById('isActive').value = !isActive;
  });

});

// ----------------------------------------------------------
// Notes about FileReader / input.files
// input element contains the property "files"
// input.files -> binary pointer reference to the actual picture on the system
// file property is actually FileList (a kind of array)
// input.files[0] is the first File object
// Browser can't read this file, so explicitly we have to make them read
// Since file is a pointer we can't directly use it in <img>, we have to make it a link
// readAsDataURL -> method of the FileReader object that reads the contents of a file and converts it into a data URL string
// ----------------------------------------------------------

// Before cropping (original simpler logic, without cropper)
// input.addEventListener('change',(e)=>{
//     const file = e.target.files[0];
//     if(file){
//         const reader = new FileReader();
//         reader.onload = (e)=>{
//             preview.innerHTML = `<img src="${e.target.result}" class="object-cover w-full h-full"/>`;
//         }
//         reader.readAsDataURL(file);
//     }
// })