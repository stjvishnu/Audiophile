function showToast(type,message){

  switch(type){
    case 'success':
      sign = '✔️' ;
      break;

    case 'error':
      sign='✖️';
      break;

    case 'warning':
      sign='❕❕';
      break
  }

  Toastify({
    text: ` ${sign}    ${message}`,
    duration: 3000,
    close: true,
    gravity: "bottom",
    position: "center",
    stopOnFocus: true,
    style: {
      background: "rgba(0, 0, 0, 0.9)",  // slightly transparent black
      color: "#fff",                     // white text
      borderRadius: "10px",              // rounded corners
      border: "1px solid #fff",          // white border
      boxShadow: "0px 4px 12px rgba(255, 255, 255, 0.2)", // soft white shadow
      fontSize: "14px",                   // slightly bigger text
      padding: "12px 15px"                // extra spacing
    }
  }).showToast();
}

