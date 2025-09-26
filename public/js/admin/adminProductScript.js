
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