// Role selection
let selectedRole = null;

document.querySelectorAll('.role-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedRole = card.dataset.role;
  });
});

// Check if already logged in
function checkLogin() {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    redirectBasedOnRole(userData.role);
  }
}

// Redirect based on role
function redirectBasedOnRole(role) {
  switch (role) {
    case 'poster':
      window.location.href = 'poster.html';
      break;
    case 'worker':
      window.location.href = 'worker.html';
      break;
    case 'admin':
      window.location.href = 'admin.html';
      break;
    default:
      console.error('Unknown role:', role);
  }
}

// Login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!selectedRole) {
    alert('Please select a role');
    return;
  }

  const formData = new FormData(e.target);
  const loginData = {
    role: selectedRole,
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password')
  };

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    if (response.ok) {
      const userData = await response.json();
      localStorage.setItem('user', JSON.stringify(userData));
      redirectBasedOnRole(userData.role);
    } else {
      alert('Login failed. Please check your credentials.');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('An error occurred during login. Please try again.');
  }
});

// Check login on page load
document.addEventListener('DOMContentLoaded', checkLogin);