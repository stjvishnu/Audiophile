function createImageSlots() {
  imageSlots.innerHTML = '';
  
  for (let i = 0; i < 5; i++) {
    const slot = document.createElement('div');
    const hasImage = i < uploadedImages.length;
    
    slot.className = `relative rounded-lg overflow-hidden h-32 border-2 transition-all duration-300 animate-scale-in ${hasImage ? 'border-gray-300' : 'border-dashed border-gray-400 hover:border-gray-600 cursor-pointer'}`;
    slot.style.animationDelay = `${i * 100}ms`;
    
    if (hasImage) {
      slot.innerHTML = `
        <img src="${URL.createObjectURL(uploadedImages[i])}" alt="Product ${i + 1}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
        <button type="button" class="absolute top-1 right-1 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-red-50 transition-all duration-200 remove-image" data-index="${i}">
          <i class="ri-close-line text-red-500"></i>
        </button>
      `;
    } else {
      slot.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full p-3 group">
          <i class="ri-image-line text-3xl text-gray-400 group-hover:text-gray-600 transition-colors duration-300 animate-float"></i>
          <p class="mt-2 text-xs font-medium text-gray-500 text-center group-hover:text-gray-700 transition-colors duration-300">
            ${i === 0 && uploadedImages.length === 0 ? 'Add Primary Image*' : 'Add Image'}
          </p>
        </div>
      `;
      
      slot.addEventListener('click', function() {
        if (uploadedImages.length < 5) {
          fileInput.click();
        }
      });
    }
    
    imageSlots.appendChild(slot);
  }
  
  // Add event listeners to remove buttons using event delegation
  imageSlots.addEventListener('click', (e) => {
    const button = e.target.closest('.remove-image');
    if (button) {
      e.stopPropagation();
      const index = parseInt(button.getAttribute('data-index'));
      removeImage(index);
    }
  });
  
  // Update image count
  imageCount.textContent = `${uploadedImages.length}/5 images`;
}

// File input change
fileInput.addEventListener('change', function() {
  if (this.files && this.files.length > 0) {
    const newFiles = Array.from(this.files);
    
    // Validate file types and size (max 5MB)
    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        showToast('Only image files are allowed', 'error');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return false;
      }
      return true;
    });
    
    // Check if adding new files would exceed the limit
    if (uploadedImages.length + validFiles.length > 5) {
      showToast('Maximum 5 images allowed', 'error');
      return;
    }
    
    // Add new files to the uploadedImages array
    uploadedImages = [...uploadedImages, ...validFiles];
    
    // Update image slots
    createImageSlots();
    
    // Reset file input
    this.value = '';
  }
});

// Remove image
function removeImage(index) {
  uploadedImages.splice(index, 1);
  createImageSlots();
}

// Reset image slots
function resetImageSlots() {
  uploadedImages = [];
  createImageSlots();
}
