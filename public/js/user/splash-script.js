
document.addEventListener('DOMContentLoaded',()=>{
  const splash = document.getElementById('splash-screen');
  const mainContent = document.getElementById('home-content');
  const componentsToFade = document.querySelectorAll('.hide-during-splash');
  if(sessionStorage.getItem('splashShown')){
    if (splash) splash.style.display = 'none';
        
        componentsToFade.forEach(el => {
            el.style.opacity = '1';
            el.style.visibility = 'visible';
            el.style.transition = 'none'; // Prevent a fade-in on repeat visits
        });
  }else{
    window.addEventListener('load', () => {


      // Small timeout to ensure the splash is seen for at least a moment
      setTimeout(() => {
          splash.classList.add('fade-out');
          
          componentsToFade.forEach(el => {
            el.classList.add('show-after-splash');
        });
        mainContent.style.display = 'block';
        mainContent.style.opacity = '1';
        sessionStorage.setItem('splashShown', 'true');
          // Remove from DOM after transition to save resources
          setTimeout(() => {
              splash.remove();
          }, 1000); 
      }, 3000); // Adjust time (1500ms) as needed
    });
  }
})
