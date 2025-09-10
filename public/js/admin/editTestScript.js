// Global variables (accessible to openEditModal)
let variantCount = 0;
let croppedImages = {};
let cropper = null;
let currentInput = null;
let currentPreview = null;



// Event listeners inside DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('cropperModal');
  const cropperImage = document.getElementById('cropperImage');
  const confirmBtn = document.getElementById('confirmCrop');
  const cancelBtn = document.getElementById('cancelCrop');
  const addVariantBtn = document.getElementById('addVariantBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelBtn');

  // Define openEditModal inside DOMContentLoaded
  async function openEditModal(productId) {
    console.log('Call inside openEditModal', productId);
    try {
      const response = await fetch(`/admin/products/getSingleProduct/${productId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      const product = await response.json();
      console.log(product.variants.length);
      
      const modal = document.getElementById('editProductModal');
      modal.classList.remove('hidden');
      document.getElementById('editForm').dataset.productId = productId;

      // Wait briefly to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 50));

      // Clear variants and reset variantCount
      const variantsContainer = document.getElementById('variantsContainer');
      variantsContainer.innerHTML = '';
      variantCount = 0;
      croppedImages = {};

      // Populate non-variant fields
      document.getElementById('name').value = product.name || '';
      document.getElementById('brand').value = product.brand || '';
      document.getElementById('category').value = product.category || '';
      document.getElementById('subCategory').value = product.subCategory || '';
      document.getElementById('stock').value = product.stock || '';
      document.getElementById('driver').value = product.driver || '';
      document.getElementById('driverConfiguration').value = product.driverConfiguration || '';
      document.getElementById('impedance').value = product.impedance || '';
      document.getElementById('soundSignature').value = product.soundSignature || '';
      document.getElementById('plug').value = product.plug || '';
      document.getElementById('microphone').value = product.microphone || '';
      document.getElementById('description1').value = product.description1 || '';
      document.getElementById('description2').value = product.description2 || '';

      // Update isActive toggle
      const isActiveToggle = document.getElementById('isActiveToggle');
      isActiveToggle.dataset.active = product.isActive;
      isActiveToggle.querySelector('span').classList.toggle('translate-x-6', product.isActive === true || product.isActive === 'true');
      isActiveToggle.querySelector('span').classList.toggle('translate-x-0', !(product.isActive === true || product.isActive === 'true'));
      document.getElementById('isActive').value = product.isActive;

      // Append variants
      for (const variant of product.variants) {
        variantCount++;
        const div = document.createElement('div');
        div.classList.add('variant');
        div.dataset.variantIndex = variantCount;
        div.innerHTML = `
          <div class="bg-gray-200 rounded-xl p-6 animate-fade-in mt-8">
            <h3 class="text-xl font-semibold text-slate-800 mb-6 flex items-center justify-between">
              <span class="flex items-center gap-2">🛒 Product Variant ${variantCount}</span>
              <button type="button" class="remove-variant">
                <i class="fa-solid fa-xmark fa-lg" style="color: #f50000;"></i>
              </button>
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-black">
              <div class="lg:col-span-2">
                <label for="sku-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">SKU *</label>
                <input id="sku-${variantCount}" name="sku-${variantCount}" required value="${variant.sku || ''}" class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
                <div class="text-red-500 text-sm hidden mt-1" id="sku-error-${variantCount}"></div>
              </div>
              <div>
                <label for="color-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">Color *</label>
                <input id="color-${variantCount}" name="color-${variantCount}" required value="${variant.color || ''}" class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
                <div class="text-red-500 text-sm hidden mt-1" id="color-error-${variantCount}"></div>
              </div>
              <div>
                <label for="plug-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">Plug *</label>
                <input id="plug-${variantCount}" name="plug-${variantCount}" required value="${variant.plug || ''}" class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
                <div class="text-red-500 text-sm hidden mt-1" id="plug-error-${variantCount}"></div>
              </div>
              <div>
                <label for="mic-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">Microphone *</label>
                <select id="mic-${variantCount}" name="mic-${variantCount}" required class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all">
                  <option value="">Select option</option>
                  <option value="true" ${variant.mic === true || variant.mic === 'true' ? 'selected' : ''}>Yes</option>
                  <option value="false" ${variant.mic === false || variant.mic === 'false' ? 'selected' : ''}>No</option>
                </select>
                <div class="text-red-500 text-sm hidden mt-1" id="mic-error-${variantCount}"></div>
              </div>
              <div>
                <label for="stock-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">Stock *</label>
                <input id="stock-${variantCount}" name="stock-${variantCount}" type="number" min="0" required value="${variant.stock || ''}" class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
                <div class="text-red-500 text-sm hidden mt-1" id="stock-error-${variantCount}"></div>
              </div>
              <div>
                <label for="price-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">Price ($) *</label>
                <input id="price-${variantCount}" name="price-${variantCount}" type="number" min="0" step="0.01" required value="${variant.price || ''}" class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
                <div class="text-red-500 text-sm hidden mt-1" id="price-error-${variantCount}"></div>
              </div>
              <div>
                <label for="discount-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">Discount (%) *</label>
                <input id="discount-${variantCount}" name="discount-${variantCount}" type="number" min="0" max="100" required value="${variant.discount || ''}" class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
                <div class="text-red-500 text-sm hidden mt-1" id="discount-error-${variantCount}"></div>
              </div>
              <div class="lg:col-span-3">
                <label class="block text-sm font-medium text-slate-700 mb-4">Product Images (5 required) *</label>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  ${[1, 2, 3, 4, 5].map(i => `
                    <div class="flex items-center justify-center w-full relative">
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

        // Convert Cloudinary URLs to Blobs
        if (variant.productImages) {
          for (let i = 0; i < variant.productImages.length; i++) {
            if (variant.productImages[i]) {
              try {
                const response = await fetch(variant.productImages[i]);
                if (!response.ok) throw new Error(`Failed to fetch image ${variant.productImages[i]}`);
                const blob = await response.blob();
                croppedImages[`productImage${i + 1}-${variantCount}`] = blob;
                const preview = document.getElementById(`preview-productImage${i + 1}-${variantCount}`);
                preview.innerHTML = `
                  <img src="${URL.createObjectURL(blob)}" class="object-cover w-full h-full rounded-lg"/>
                  <button type="button" class="cancel-image absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full" data-image-id="productImage${i + 1}-${variantCount}">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                  <button type="button" class="recrop-btn absolute top-2 right-10 bg-blue-500 text-white p-1 rounded-full" data-image-id="productImage${i + 1}-${variantCount}">
                    <i class="fa-solid fa-crop"></i>
                  </button>
                `;
                attachCancelImageListeners(preview);
                preview.querySelector('.recrop-btn').addEventListener('click', () => {
                  const imageId = `productImage${i + 1}-${variantCount}`;
                  const blob = croppedImages[imageId];
                  cropperImage.src = URL.createObjectURL(blob);
                  modal.classList.remove('hidden');
                  currentInput = document.getElementById(imageId);
                  currentPreview = document.getElementById(`preview-productImage${i + 1}-${variantCount}`);
                  cropper = new Cropper(cropperImage, { aspectRatio: 1, viewMode: 1 });
                });
              } catch (error) {
                console.error(`Error fetching image ${variant.productImages[i]}:`, error);
              }
            }
          }
        }

        // Remove variant
        div.querySelector('.remove-variant').addEventListener('click', () => {
          [1, 2, 3, 4, 5].forEach(i => delete croppedImages[`productImage${i}-${div.dataset.variantIndex}`]);
          div.remove();
          variantCount--;
          document.querySelectorAll('.variant').forEach((variant, idx) => {
            variant.dataset.variantIndex = idx + 1;
            variant.querySelector('h3 span').textContent = `🛒 Product Variant ${idx + 1}`;
          });
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  }

  // Define attatchImageListeners and attachCancelImageListeners in global scope
  function attatchImageListeners(div) {
    div.querySelectorAll('input[type="file"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            document.getElementById('cropperImage').src = e.target.result;
            document.getElementById('cropperModal').classList.remove('hidden');
            currentInput = input;
            currentPreview = document.getElementById('preview-' + input.id);
            cropper = new Cropper(document.getElementById('cropperImage'), { aspectRatio: 1, viewMode: 1 });
          };
          reader.readAsDataURL(file);
        }
      });
    });
  }

  function attachCancelImageListeners(preview) {
    const cancelBtn = preview.querySelector('.cancel-image');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        const imageId = cancelBtn.dataset.imageId;
        delete croppedImages[imageId];
        preview.innerHTML = '';
        const input = document.getElementById(imageId);
        if (input) input.value = '';
      });
    }
  }

  // Rest of your DOMContentLoaded code remains the same...
  // Close modal
  closeModalBtn.addEventListener('click', () => {
    document.getElementById('editProductModal').classList.add('hidden');
  });

  cancelModalBtn.addEventListener('click', () => {
    document.getElementById('editProductModal').classList.add('hidden');
  });

  // Toggle isActive
  const isActiveToggle = document.getElementById('isActiveToggle');
  isActiveToggle.addEventListener('click', () => {
    const isActive = isActiveToggle.dataset.active === 'true';
    isActiveToggle.dataset.active = !isActive;
    isActiveToggle.querySelector('span').classList.toggle('translate-x-6', !isActive);
    isActiveToggle.querySelector('span').classList.toggle('translate-x-0', isActive);
    document.getElementById('isActive').value = !isActive;
  });

  // Confirm crop
  confirmBtn.addEventListener('click', () => {
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas();
    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedUrl = URL.createObjectURL(blob);
      currentPreview.innerHTML = `
        <img src="${croppedUrl}" class="object-cover w-full h-full rounded-lg"/>
        <button type="button" class="cancel-image absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full" data-image-id="${currentInput.id}">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;
      croppedImages[currentInput.id] = blob;
      cropper.destroy();
      cropper = null;
      modal.classList.add('hidden');
      if (currentInput) currentInput.value = '';
      attachCancelImageListeners(currentPreview);
    }, 'image/jpeg');
  });

  // Cancel crop
  cancelBtn.addEventListener('click', () => {
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    modal.classList.add('hidden');
    if (currentInput) currentInput.value = '';
  });

  // Add variant
  addVariantBtn.addEventListener('click', () => {
    variantCount++;
    const div = document.createElement('div');
    div.classList.add('variant');
    div.dataset.variantIndex = variantCount;
    div.innerHTML = `
      <div class="bg-gray-200 rounded-xl p-6 animate-fade-in mt-8">
        <h3 class="text-xl font-semibold text-slate-800 mb-6 flex items-center justify-between">
          <span class="flex items-center gap-2">🛒 Product Variant ${variantCount}</span>
          <button type="button" class="remove-variant">
            <i class="fa-solid fa-xmark fa-lg" style="color: #f50000;"></i>
          </button>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-black">
          <div class="lg:col-span-2">
            <label for="sku-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">SKU *</label>
            <input id="sku-${variantCount}" name="sku-${variantCount}" required placeholder="e.g., SKU12345" class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
            <div class="text-red-500 text-sm hidden mt-1" id="sku-error-${variantCount}"></div>
          </div>
          <div>
            <label for="color-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">Color *</label>
            <input id="color-${variantCount}" name="color-${variantCount}" required placeholder="e.g., Red" class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
            <div class="text-red-500 text-sm hidden mt-1" id="color-error-${variantCount}"></div>
          </div>
          <div>
            <label for="plug-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">Plug *</label>
            <input id="plug-${variantCount}" name="plug-${variantCount}" required placeholder="e.g., 3.5mm, USB-C" class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
            <div class="text-red-500 text-sm hidden mt-1" id="plug-error-${variantCount}"></div>
          </div>
          <div>
            <label for="mic-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">Microphone *</label>
            <select id="mic-${variantCount}" name="mic-${variantCount}" required class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all">
              <option value="">Select option</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
            <div class="text-red-500 text-sm hidden mt-1" id="mic-error-${variantCount}"></div>
          </div>
          <div>
            <label for="stock-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">Stock *</label>
            <input id="stock-${variantCount}" name="stock-${variantCount}" type="number" min="0" required placeholder="0" class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
            <div class="text-red-500 text-sm hidden mt-1" id="stock-error-${variantCount}"></div>
          </div>
          <div>
            <label for="price-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">Price ($) *</label>
            <input id="price-${variantCount}" name="price-${variantCount}" type="number" min="0" step="0.01" required placeholder="0.00" class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
            <div class="text-red-500 text-sm hidden mt-1" id="price-error-${variantCount}"></div>
          </div>
          <div>
            <label for="discount-${variantCount}" class="block text-sm font-medium text-slate-700 mb-2">Discount (%) *</label>
            <input id="discount-${variantCount}" name="discount-${variantCount}" type="number" min="0" max="100" required placeholder="0" class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" />
            <div class="text-red-500 text-sm hidden mt-1" id="discount-error-${variantCount}"></div>
          </div>
          <div class="lg:col-span-3">
            <label class="block text-sm font-medium text-slate-700 mb-4">Product Images (5 required) *</label>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              ${[1, 2, 3, 4, 5].map(i => `
                <div class="flex items-center justify-center w-full relative">
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
    document.getElementById('variantsContainer').appendChild(div);
    attatchImageListeners(div);
    div.querySelector('.remove-variant').addEventListener('click', () => {
      [1, 2, 3, 4, 5].forEach(i => delete croppedImages[`productImage${i}-${div.dataset.variantIndex}`]);
      div.remove();
      variantCount--;
      document.querySelectorAll('.variant').forEach((variant, idx) => {
        variant.dataset.variantIndex = idx + 1;
        variant.querySelector('h3 span').textContent = `🛒 Product Variant ${idx + 1}`;
      });
    });
  });

  // Form submission
  document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const productId = document.getElementById('editForm').dataset.productId;
    const formData = new FormData();

    // Validate images
    let valid = true;
    document.querySelectorAll('.variant').forEach((variantDiv, index) => {
      const variantIndex = variantDiv.dataset.variantIndex || (index + 1);
      const images = [
        croppedImages[`productImage1-${variantIndex}`],
        croppedImages[`productImage2-${variantIndex}`],
        croppedImages[`productImage3-${variantIndex}`],
        croppedImages[`productImage4-${variantIndex}`],
        croppedImages[`productImage5-${variantIndex}`],
      ];
      if (images.some(img => !img)) {
        valid = false;
        const errorDiv = variantDiv.querySelector(`#productImages-error-${variantIndex}`);
        errorDiv.textContent = 'All 5 images are required';
        errorDiv.classList.remove('hidden');
      } else {
        const errorDiv = variantDiv.querySelector(`#productImages-error-${variantIndex}`);
        errorDiv.classList.add('hidden');
      }
    });

    if (!valid) return;

    // Append non-variant fields
    formData.append('name', document.getElementById('name')?.value || '');
    formData.append('brand', document.getElementById('brand')?.value || '');
    formData.append('category', document.getElementById('category')?.value || '');
    formData.append('subCategory', document.getElementById('subCategory')?.value || '');
    formData.append('stock', document.getElementById('stock')?.value || '');
    formData.append('driver', document.getElementById('driver')?.value || '');
    formData.append('driverConfiguration', document.getElementById('driverConfiguration')?.value || '');
    formData.append('impedance', document.getElementById('impedance')?.value || '');
    formData.append('soundSignature', document.getElementById('soundSignature')?.value || '');
    formData.append('plug', document.getElementById('plug')?.value || '');
    formData.append('microphone', document.getElementById('microphone')?.value || '');
    formData.append('description1', document.getElementById('description1')?.value || '');
    formData.append('description2', document.getElementById('description2')?.value || '');
    formData.append('isActive', document.getElementById('isActive')?.value || 'false');

    // Append variant fields
    const variants = [];
    document.querySelectorAll('.variant').forEach((variantDiv, index) => {
      const variantIndex = variantDiv.dataset.variantIndex || (index + 1);
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

    variants.forEach((variant, index) => {
      formData.append(`variant-${index + 1}-sku`, variant.sku);
      formData.append(`variant-${index + 1}-color`, variant.color);
      formData.append(`variant-${index + 1}-plug`, variant.plug);
      formData.append(`variant-${index + 1}-mic`, variant.mic);
      formData.append(`variant-${index + 1}-stock`, variant.stock);
      formData.append(`variant-${index + 1}-price`, variant.price);
      formData.append(`variant-${index + 1}-discount`, variant.discount);
      variant.images.forEach((image, i) => {
        if (image && image instanceof Blob) {
          formData.append(`variant-${index + 1}-image${i + 1}`, image, `image${i + 1}.jpg`);
        }
      });
    });

    try {
      const response = await fetch(`/admin/products/update/${productId}`, {
        method: 'PUT',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to update product');
      const data = await response.json();
      document.getElementById('editProductModal').classList.add('hidden');
      console.log('Server Response:', data);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  });

  // Trigger edit modal (for elements with edit-product-btn class)
  document.querySelectorAll('.edit-product-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.productId;
      openEditModal(productId);
    });
  });
});