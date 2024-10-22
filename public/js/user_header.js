// public/js/header.js

async function fetchUserProfile() {
    try {
      const response = await fetch('/api/getUserProfile');
      const data = await response.json();
  
      const profileSection = document.getElementById('profile');
      const sidebarProfileSection = document.getElementById('sidebar-profile');
  
      if (data.user_id) {
        profileSection.innerHTML = `
          <img src="uploaded_files/${data.image}" alt="">
          <h3>${data.name}</h3>
          <span>student</span>
          <a href="/profile" class="btn">view profile</a>
          <div class="flex-btn">
            <a href="/login" class="option-btn">login</a>
            <a href="/register" class="option-btn">register</a>
          </div>
          <a href="/user_logout" onclick="return confirm('logout from this website?');" class="delete-btn">logout</a>
        `;
  
        sidebarProfileSection.innerHTML = `
          <img src="uploaded_files/${data.image}" alt="">
          <h3>${data.name}</h3>
          <span>student</span>
          <a href="/profile" class="btn">view profile</a>
        `;
      } else {
        profileSection.innerHTML = `
          <h3>please login or register</h3>
          <div class="flex-btn">
            <a href="/login" class="option-btn">login</a>
            <a href="/register" class="option-btn">register</a>
          </div>
        `;
  
        sidebarProfileSection.innerHTML = `
          <h3>please login or register</h3>
          <div class="flex-btn">
            <a href="/login" class="option-btn">login</a>
            <a href="/register" class="option-btn">register</a>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }
  
  // Display messages if any
  function displayMessages(messages) {
    const messageContainer = document.createElement('div');
    messages.forEach((message) => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message';
      messageElement.innerHTML = `<span>${message}</span><i class="fas fa-times" onclick="this.parentElement.remove();"></i>`;
      messageContainer.appendChild(messageElement);
    });
    document.body.appendChild(messageContainer);
  }
  
  // Initialize the page
  document.addEventListener('DOMContentLoaded', () => {
    fetchUserProfile();
  
    // Example of message usage, replace this with actual data
    const messages = ['Welcome to Educa!'];
    displayMessages(messages);
  });
  