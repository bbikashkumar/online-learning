document.addEventListener("DOMContentLoaded", () => {
    // Toggle sidebar visibility
    const menuBtn = document.getElementById("menu-btn");
    const sideBar = document.querySelector(".side-bar");
    const closeBtn = document.querySelector(".close-side-bar");
 
    menuBtn.onclick = () => sideBar.classList.toggle("active");
    closeBtn.onclick = () => sideBar.classList.remove("active");
 
    // Toggle dark mode
    const toggleBtn = document.getElementById("toggle-btn");
    toggleBtn.onclick = () => {
       document.body.classList.toggle("dark-mode");
       toggleBtn.classList.toggle("fa-moon");
       toggleBtn.classList.toggle("fa-sun");
    };
 
    // Toggle search form visibility
    const searchBtn = document.getElementById("search-btn");
    const searchForm = document.querySelector(".search-form");
    searchBtn.onclick = () => searchForm.classList.toggle("active");
 
    // User profile display logic
    const userBtn = document.getElementById("user-btn");
    const profileSection = document.querySelector(".profile");
    userBtn.addEventListener("click", function() {
        // Redirect to the /profile URL
        window.location.href = "/profile";
    });
 
    // Auto-remove message alerts
    document.querySelectorAll(".message .fa-times").forEach(closeIcon => {
       closeIcon.onclick = function () {
          this.parentElement.remove();
       };
    });
 });
 