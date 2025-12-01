console.log('Script loaded');

async function orderDetails(orderId){
  console.log('Yes call recived st orderDetsils');
  try {
    window.location.href=`/admin/orders/${orderId}`;
    
  } catch (error) {
    
  }
}