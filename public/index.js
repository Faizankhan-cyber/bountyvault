// Fetch and display stats
const API = "https://bountyvault-backend.onrender.com";
async function loadStats() {
  try {
    const response = await fetch(`${API}/api/stats`);
    const stats = await response.json();

    const statsGrid = document.getElementById('stats-grid');
    statsGrid.innerHTML = '';

    // Assuming stats is an object like { totalBounties: 123, totalUsers: 456, etc. }
    for (const [key, value] of Object.entries(stats)) {
      const statItem = document.createElement('div');
      statItem.className = 'stat-item';
      statItem.innerHTML = `
        <div class="stat-number">${value}</div>
        <div class="stat-label">${key.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
      `;
      statsGrid.appendChild(statItem);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
    // Fallback stats
    document.getElementById('stats-grid').innerHTML = `
      <div class="stat-item">
        <div class="stat-number">1,234</div>
        <div class="stat-label">total bounties</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">5,678</div>
        <div class="stat-label">active users</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">$2.5M</div>
        <div class="stat-label">total value</div>
      </div>
    `;
  }
}

// Load stats on page load
document.addEventListener('DOMContentLoaded', loadStats);