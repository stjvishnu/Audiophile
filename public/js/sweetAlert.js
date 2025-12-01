
function sweetAlert(type,title,message,cancel=true,confirm=false,timer=null){
  // console.log(cancel,confirm);
 return Swal.fire({
    title : title,
    text : message,
    icon : type,
    showCancelButton: cancel,
    showConfirmButton: confirm,
    confirmButtonColor : '#4ADE80',
    cancelButtonColor : '#F87171',
    confirmButtonText: `Yes`,
    background:'linear-gradient( to bottom,#FFFFFF 0%,#F2F2F2 40%,#e5e5e5 75%,#d4d4d4 100%)',
    color: "#000000",
    width:'500px',
    timer: timer,          // ⬅️ auto-close after X ms if provided
    timerProgressBar: timer ? true : false,
    didOpen: (popup) => {
      popup.style.borderRadius = "35px";  // ⬅️ Rounded corners

      const confirmBtn = Swal.getConfirmButton();
      const cancelBtn = Swal.getCancelButton();

      confirmBtn.style.width = "120px";
      cancelBtn.style.width = "120px";

      confirmBtn.style.textAlign = "center";
      cancelBtn.style.textAlign = "center"


      const actions = Swal.getActions();   // container of both buttons
      actions.style.gap = "16px"; 
    }
  })
}
