
function sweetAlert(type,title,message,cancel=true,confirm=false,timer=null){
  // console.log(cancel,confirm);
 return Swal.fire({
    title : title,
    text : message,
    icon : type,
    showCancelButton: cancel,
    showConfirmButton: confirm,
    confirmButtonColor : '#3085d6',
    cancelButtonColor : '#d33',
    confirmButtonText: `Yes`,
    background:'#1a1a1a',
    color: "#fff",
    timer: timer,          // ⬅️ auto-close after X ms if provided
    timerProgressBar: timer ? true : false
  })
}

