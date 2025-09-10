

const addModal = document.getElementById('productModal');
let modalTitle = document.getElementById('modalTitle');

async function openAddModal(productId) {


  // productForm.reset();

  //Edit produict mode

  if (productId) {
    //Edit product mode
    modalTitle.innerText = 'Edit Product';


    const response = await fetch(`/admin/products/getSingleProduct/${productId}`, {
      method: 'GET'
    })
    console.log(response);
    if (!response.ok) {
      Toastify({
        text: `❌ Something Went Wrong !! `,
        duration: 3000,
        close: true,
        gravity: "bottom", // top or bottom
        position: "right", // left, center or right
        stopOnFocus: true,
        style: {
          background: "rgba(0, 0, 0, 0.9)", // slightly transparent black
          color: "#fff", // white text
          borderRadius: "10px", // rounded corners
          border: "1px solid #fff", // white border
          boxShadow: "0px 4px 12px rgba(255, 255, 255, 0.2)", // soft white shadow
          fontSize: "14px", // slightly bigger text
          padding: "10px 15px" // extra spacing
        }
      }).showToast();
    }

    const product = await response.json();
    console.log(product)

    document.getElementById('name').value = product.name || '';
    document.getElementById('brand').value = product.brand || '';
    document.getElementById('category').value = product.category.name || '';
    document.getElementById('subCategory').value = product.subCategory || '';
    document.getElementById('driver').value = product.productDetails.driver || '';
    document.getElementById('driverConfiguration').value = product.productDetails.driverConfiguration || '';
    document.getElementById('impedance').value = product.productDetails.impedance || '';
    document.getElementById('soundSignature').value = product.productDetails.soundSignature || '';
    document.getElementById('plug').value = product.productDetails.plug || '';
    document.getElementById('microphone').value = product.productDetails.microphone || '';
    document.getElementById('description1').value = product.description1 || '';
    document.getElementById('description2').value = product.description2 || '';


        //-----Image upload and cropper modal------
        const cropperModal = document.getElementById("cropperModal");
        const cropperImage = document.getElementById("cropperImage");
        const confirmBtn = document.getElementById("confirmCrop");
        const cancelBtn = document.getElementById("cancelCrop");

        let cropperInstance; // cropper instance
        let currentPreview; // preview element for current file input
        let currentEl // file input being used
      
    
        function cropper(imgUrl,el){
          

          cropperImage.src = imgUrl;
          cropperModal.classList.remove('hidden')

          cropperInstance = new Cropper(cropperImage, {
            aspectRatio: 1,
            viewMode: 1,
          });
          currentEl = el; // save which element is being cropped
        }
        confirmBtn.addEventListener("click", () => {
          if (!cropperInstance || !currentEl) return;
        
          const canvas = cropperInstance.getCroppedCanvas();
        
          canvas.toBlob((blob) => {
            if (!blob) {
              console.error("Failed to create blob from canvas");
              return;
            }
        
            const croppedUrl = URL.createObjectURL(blob);
        
            // Replace the preview inside the correct image div
            currentEl.innerHTML = `
              <img src="${croppedUrl}" class="object-cover w-full h-full rounded-lg"/>
            `;
        

        
            cropperInstance.destroy();
            cropperModal.classList.add("hidden");
            currentEl = null; // reset
          });
        });
        
        

    const variantContainer = document.getElementById('variantsContainer');
    const variantTemplate = document.querySelector('.variant');
    variantContainer.innerHTML = '';

    product.variants.forEach((variantData, index) => {
      const variantClone = variantTemplate.cloneNode(true);

      // Update heading
      variantClone.querySelector("h3 span").textContent = `🛒 Product Variant ${index + 1}`;

      // Update input values + IDs dynamically
      variantClone.querySelectorAll("input, select, label, div").forEach(el => {
        if (el.id) {
          el.id = el.id.replace("-1", `-${index + 1}`);
        }
        if (el.name) {
          el.name = el.name.replace("-1", `-${index + 1}`);
        }
      });

      // Fill values
      variantClone.querySelector(`#sku-${index + 1}`).value = variantData.sku || "";
      variantClone.querySelector(`#color-${index + 1}`).value = variantData.attributes.color || "";
      variantClone.querySelector(`#plug-${index + 1}`).value = variantData.attributes.plug || "";
      variantClone.querySelector(`#mic-${index + 1}`).value = variantData.attributes.mic || "";
      variantClone.querySelector(`#stock-${index + 1}`).value = variantData.attributes.stock || "";
      variantClone.querySelector(`#price-${index + 1}`).value = variantData.attributes.price || "";
      variantClone.querySelector(`#discount-${index + 1}`).value = variantData.attributes.discount || "";

      const variantImageContainer = variantClone.querySelector(`#imageContainer-${index + 1}`);
      const imageDiv = variantImageContainer.querySelectorAll(`.imagePreview`);

      console.log(imageDiv)

      imageDiv.forEach((el, index) => {
        el.innerHTML = `
    <img src="${variantData.attributes.productImages[index]}" class="object-cover w-full h-full rounded-lg"/>
    <button type="button" class="cancel-image absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full" >
      <i class="fa-solid fa-xmark"></i>
    </button>
    <button type="button" class="recrop-btn absolute top-2 right-10 bg-blue-500 text-white p-1 rounded-full" >
      <i class="fa-solid fa-crop"></i>
    </button>
    `;
      el.querySelector('.cancel-image').addEventListener('click',()=>{
        const img = el.querySelector('img');
        if (img) {
          img.remove();  // ✅ removes only the <img> inside el
        }
      })

      cropBtn = el.querySelector('.recrop-btn');
  
      cropBtn.addEventListener('click',()=>{
        cropper(variantData.attributes.productImages[index],el)
      })

    

    })

      

      // Append clone
      variantContainer.appendChild(variantClone);
    });



    addModal.classList.remove('hidden');

    setTimeout(() => {
      addModal.classList.add('show')

    }, 10)
    document.body.classList.add('modal-open');
  } 
  
  else {
    //Add mode

    modalTitle.innerText = 'Add New Product';

    productForm.reset();
    // Clear variants
    document.getElementById('variantsContainer').innerHTML = '';


    addModal.classList.remove('hidden');

    setTimeout(() => {
      addModal.classList.add('show')

    }, 10)
    document.body.classList.add('modal-open')
  }



}







/**
 * deleteProduct invockes on clicking delete button
 * To delete, Should ask for permission,Sweet alert kicks in
 * Giving the confirmation will return a promise
 * Then will do the update on db using fetch call
 * If successfull ,returns a success sweetalert and refresh the page.
 * If error toasity will notfy 
 * 
 * @param {*} productId 
 */
async function deleteProduct(productId) {


  try {

    const result = await Swal.fire({
      title: 'Are you sure ? ',
      text: `You are about to delete this user.! `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes`,
      background: '#1a1a1a',
      color: "#fff"
    })

    if (result.isConfirmed) {
      const response = await fetch(`/admin/products/soft-delete/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await Swal.fire({
          title: `Deleted`,
          text: `User has been deleted successfully.!`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: "#1a1a1a",
          color: "#fff"
        })
        window.location.reload();
      } else {
        throw new Error('Failed to delete the product')
      }
    }


  } catch (err) {
    Toastify({
      text: `❌ Something Went Wrong !! `,
      duration: 1500,
      close: true,
      gravity: "bottom", // top or bottom
      position: "right", // left, center or right
      stopOnFocus: true,
      style: {
        background: "rgba(0, 0, 0, 0.9)", // slightly transparent black
        color: "#fff", // white text
        borderRadius: "10px", // rounded corners
        border: "1px solid #fff", // white border
        boxShadow: "0px 4px 12px rgba(255, 255, 255, 0.2)", // soft white shadow
        fontSize: "14px", // slightly bigger text
        padding: "10px 15px" // extra spacing
      }
    }).showToast();
    console.log(err);
  }




}

async function restoreProduct(productId) {


  try {

    const result = await Swal.fire({
      title: 'Are you sure ? ',
      text: `You want to Restore this product.! `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes`,
      background: '#1a1a1a',
      color: "#fff"
    })

    if (result.isConfirmed) {
      const response = await fetch(`/admin/products/restore-deleted-product/${productId}`, {
        method: 'PATCH'
      })

      if (response.ok) {
        await Swal.fire({
          title: `Restored`,
          text: `Product has been Restored successfully.!`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: "#1a1a1a",
          color: "#fff"
        });
        window.location.reload()
      } else {
        throw new Error('Failed to restore product')
      }



    }

  } catch (err) {
    Toastify({
      text: `❌ Something Went Wrong !! `,
      duration: 3000,
      close: true,
      gravity: "bottom", // top or bottom
      position: "right", // left, center or right
      stopOnFocus: true,
      style: {
        background: "rgba(0, 0, 0, 0.9)", // slightly transparent black
        color: "#fff", // white text
        borderRadius: "10px", // rounded corners
        border: "1px solid #fff", // white border
        boxShadow: "0px 4px 12px rgba(255, 255, 255, 0.2)", // soft white shadow
        fontSize: "14px", // slightly bigger text
        padding: "10px 15px" // extra spacing
      }
    }).showToast();
    console.log(err);
  }


}


async function blockProduct(productId) {

  try {

    const result = await Swal.fire({
      title: 'Are you sure ? ',
      text: `You want to Block this product.! `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes`,
      background: '#1a1a1a',
      color: "#fff"
    })

    if (result.isConfirmed) {
      const response = await fetch(`/admin/products/block-product/${productId}`, {
        method: 'PATCH'
      })

      if (response.ok) {
        await Swal.fire({
          title: `Blocked`,
          text: `Product has been Blocked successfully.!`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: "#1a1a1a",
          color: "#fff"
        });
        window.location.reload()
      } else {
        throw new Error('Failed to block product')
      }



    }

  } catch (err) {
    Toastify({
      text: `❌ Something Went Wrong !! `,
      duration: 3000,
      close: true,
      gravity: "bottom", // top or bottom
      position: "right", // left, center or right
      stopOnFocus: true,
      style: {
        background: "rgba(0, 0, 0, 0.9)", // slightly transparent black
        color: "#fff", // white text
        borderRadius: "10px", // rounded corners
        border: "1px solid #fff", // white border
        boxShadow: "0px 4px 12px rgba(255, 255, 255, 0.2)", // soft white shadow
        fontSize: "14px", // slightly bigger text
        padding: "10px 15px" // extra spacing
      }
    }).showToast();
    console.log(err);
  }




}

async function unblockProduct(productId) {

  try {

    const result = await Swal.fire({
      title: 'Are you sure ? ',
      text: `You want to unBlock this product.! `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes`,
      background: '#1a1a1a',
      color: "#fff"
    })

    if (result.isConfirmed) {
      const response = await fetch(`/admin/products/unblock-product/${productId}`, {
        method: 'PATCH'
      })

      if (response.ok) {
        await Swal.fire({
          title: `unBlocked`,
          text: `Product has been unBlocked successfully.!`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: "#1a1a1a",
          color: "#fff"
        });
        window.location.reload()
      } else {
        throw new Error('Failed to unblock product')
      }



    }

  } catch (err) {
    Toastify({
      text: `❌ Something Went Wrong !! `,
      duration: 3000,
      close: true,
      gravity: "bottom", // top or bottom
      position: "right", // left, center or right
      stopOnFocus: true,
      style: {
        background: "rgba(0, 0, 0, 0.9)", // slightly transparent black
        color: "#fff", // white text
        borderRadius: "10px", // rounded corners
        border: "1px solid #fff", // white border
        boxShadow: "0px 4px 12px rgba(255, 255, 255, 0.2)", // soft white shadow
        fontSize: "14px", // slightly bigger text
        padding: "10px 15px" // extra spacing
      }
    }).showToast();
    console.log(err);
  }




}