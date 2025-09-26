    let currentCategoryId = null;
      const modal = document.getElementById('confirmationModal');
      const modalContent = document.getElementById('modalContent');
      const categoryNameSpan = document.getElementById('categoryNameToRemove');
      const editModal = document.getElementById('editModal');
      const editModalContent = document.getElementById('editModalContent');
      const categoryNameInput = document.getElementById('categoryName');
      const addModal = document.getElementById('addModal');
      const addModalContent = document.getElementById('addModalContent');
      const newCategoryNameInput = document.getElementById('newCategoryName');

      function openAddModal() {
        newCategoryNameInput.value = '';
        addModal.classList.remove('hidden');
        setTimeout(() => addModalContent.classList.add('show'), 10);
        document.body.classList.add('modal-open');
      }


      function closeAddModal() {
        addModalContent.classList.remove('show');
        setTimeout(() => {
          addModal.classList.add('hidden');
          document.body.classList.remove('modal-open');
        }, 300);
      }

      function addCategory(event) {
        event.preventDefault();
        fetch('/admin/category/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newCategoryNameInput.value
          })
        })
        .then(response => {
          if (response.ok) {
            showToast('success','Category Added Successfully')
            setTimeout(()=>{
              window.location.reload();
            },3000)
          }else{
            showToast('warning','Category Already Exists')
          }
        })
        .catch(error => console.error('Error:', error))
        .finally(() => closeAddModal());
      }

      function openEditModal(id, name) {
        currentCategoryId = id;
        categoryNameInput.value = name;
        editModal.classList.remove('hidden');
        setTimeout(() => editModalContent.classList.add('show'), 10);
        document.body.classList.add('modal-open');
      }

      function closeEditModal() {
        editModalContent.classList.remove('show');
        setTimeout(() => {
          editModal.classList.add('hidden');
          document.body.classList.remove('modal-open');
          currentCategoryId = null;
        }, 300);
      }

      function updateCategory(event) {
       
        console.log(categoryNameInput.value);
        event.preventDefault();
        if (currentCategoryId) {
          console.log(currentCategoryId);
          fetch(`/admin/category/edit/${currentCategoryId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: categoryNameInput.value
            })
          })
          .then((response) => {
            console.log(response.status);
            if (response.ok) {

              showToast('success','Successfully Updated')
              setTimeout(()=>{
                window.location.reload();
              },3000)
              
            }else if (response.status===409){
              showToast('warning','Category Already Exists')
            }else if(response.status===404){
              showToast('warning','No Category Found')
            }})
          .catch((error) =>{
            showToast('error','Something went wrong')
             console.error('Error:', error)
            })
          .finally(() => closeEditModal());
        }
      }


          async function deleteCategory(categoryId){

          try{
           const result = await sweetAlert('warning','Are you sure ? ','You are about to delete this Category',true,true)

           if(result.isConfirmed){
           const response =  await fetch(`/admin/category/delete/${categoryId}`,{
            method:'DELETE'
           })

           if(response.ok){
            await sweetAlert('success','Deleted','Category has been deleted successfully',false,false,1000)
             window.location.reload();
           }else{
            throw new Error ('Failed to Delete the Product')
           }

           }
          }
          catch(err){
            showToast('error','Something went wrong')
            console.log(' Delete Category',err);
          }
      }

       async function restoreCategory(categoryId){
        
        try{
         const result = await sweetAlert('warning','Are you sure ? ','You are about to restore this Category',true,true)

         if(result.isConfirmed){
         const response =  await fetch(`/admin/category/restore/${categoryId}`,{
          method:'DELETE'
         })

         if(response.ok){
          await sweetAlert('success','Restored','Category has been restored successfully',false,false,1000)
           window.location.reload();
         }else{
          throw new Error ('Failed to Restore the Product')
         }

         }
        }
        catch(err){
          showToast('error','Something went wrong')
          console.log('Restore Category',err);
        }
    }




      async function blockCategory(categoryId){
        

          try{
           const result = await sweetAlert('warning','Are you sure ? ','You are about to block this Category',true,true)

           if(result.isConfirmed){
           const response =  await fetch(`/admin/category/block/${categoryId}`,{
            method:'PATCH'
           })

           if(response.ok){
            await sweetAlert('success','Blocked','Category has been succesfully blocked',false,false,1000)
             window.location.reload();
           }else{
            throw new Error ('Failed to Block the Product')
           }

           }
          }
          catch(err){
            showToast('error','Something went wrong')
            console.log('Error in block Category',err);
          }
      }


      async function unblockCategory(categoryId){
        

        try{
         const result = await sweetAlert('warning','Are you sure ? ','You are about to unBlock this Catgeory',true,true)

         if(result.isConfirmed){
         const response =  await fetch(`/admin/category/unblock/${categoryId}`,{
          method:'PATCH'
         })

         if(response.ok){
          await sweetAlert('success','unBlocked','Category has been  unBlocked succesfully',false,false,1000)
           window.location.reload();
         }else{
          throw new Error ('Failed to Block the Product')
         }

         }
        }
        catch(err){
          showToast('error','Something went wrong')
          console.log('Error in block Category',err);
        }
    }

      



      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });

      editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
          closeEditModal();
        }
      });

      addModal.addEventListener('click', (e) => {
        if (e.target === addModal) {
          closeAddModal();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (!modal.classList.contains('hidden')) {
            closeModal();
          }
          if (!editModal.classList.contains('hidden')) {
            closeEditModal();
          }
          if (!addModal.classList.contains('hidden')) {
            closeAddModal();
          }
        }
      });