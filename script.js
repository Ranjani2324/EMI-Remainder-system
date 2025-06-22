const emiForm = document.getElementById('emiForm');
const emiList = document.getElementById('emiList');

// Load saved EMIs and convert date strings back to Date objects
let emis = JSON.parse(localStorage.getItem('emis')) || [];
emis = emis.map(emi => ({
  ...emi,
  dueDate: new Date(emi.dueDate),
  startDate: new Date(emi.startDate),
  endDate: new Date(emi.endDate)
}));

// Format date as DD-MM-YYYY
function formatDate(dateInput) {
  const d = new Date(dateInput);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

// Render all EMIs
function renderEMIs() {
  emis.sort((a, b) => a.dueDate - b.dueDate);
  emiList.innerHTML = '';

  // Save updated list to localStorage
  localStorage.setItem('emis', JSON.stringify(emis));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  emis.forEach((emi, index) => {
    const dueDate = new Date(emi.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const isCompleted = dueDate < today;

    const card = document.createElement('div');
    card.className = 'emi-card';
    if (index === 0 && !isCompleted) {
      card.style.backgroundColor = '#fffbe6';
      card.style.borderLeft = '5px solid #f39c12';
    }
    card.style.opacity = isCompleted ? '0.6' : '1';

    const dueDateDisplay = `<span style="text-decoration: ${isCompleted ? 'line-through' : 'none'};">
      ${formatDate(emi.dueDate)}</span> ${isCompleted ? '<strong style="color: green;"> ✅ Completed</strong>' : ''}`;

    card.innerHTML = `
      <h3>${emi.name}</h3>
      <p><strong>Next Due Date:</strong> ${dueDateDisplay}</p>
      <button onclick="toggleDetails(${index})">Show Full Details</button>
      <div class="details" id="details${index}" style="display:none;">
        <p><strong>Loan Start Date:</strong> ${formatDate(emi.startDate)}</p>
        <p><strong>Loan End Date:</strong> ${formatDate(emi.endDate)}</p>
        <p><strong>Total Remaining Amount:</strong> ₹${emi.totalAmount}</p>
        <p><strong>Months Left to Pay:</strong> ${emi.months} month(s)</p>
      </div>
    `;

    emiList.appendChild(card);
  });
}

// Toggle EMI details
function toggleDetails(index) {
  const detailDiv = document.getElementById(`details${index}`);
  if (detailDiv) {
    detailDiv.style.display = detailDiv.style.display === 'none' ? 'block' : 'none';
  }
}

// Add new EMI
emiForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const emi = {
    name: document.getElementById('emiName').value,
    dueDate: new Date(document.getElementById('dueDate').value),
    startDate: new Date(document.getElementById('startDate').value),
    endDate: new Date(document.getElementById('endDate').value),
    totalAmount: parseFloat(document.getElementById('totalAmount').value),
    months: parseInt(document.getElementById('months').value)
  };

  emis.push(emi);
  renderEMIs();
  emiForm.reset();
});

// Browser notification setup
document.addEventListener('DOMContentLoaded', () => {
  if ("Notification" in window) {
    Notification.requestPermission();
  }
});

// Notification reminder for EMIs due tomorrow
function checkForDueNotifications() {
  if (Notification.permission !== 'granted') return;

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  emis.forEach(emi => {
    const due = new Date(emi.dueDate);
    due.setHours(0, 0, 0, 0);
    if (due.getTime() === tomorrow.getTime()) {
      new Notification("📢 EMI Reminder", {
        body: `Your EMI "${emi.name}" is due tomorrow (${formatDate(due)})`,
        icon: "https://cdn-icons-png.flaticon.com/512/190/190411.png"
      });
    }
  });
}

setTimeout(checkForDueNotifications, 2000);
setInterval(checkForDueNotifications, 60 * 60 * 1000); // every hour

// Load saved EMIs on page load
renderEMIs();
// Handle Clear All EMIs
document.getElementById('clearAll').addEventListener('click', function () {
  const confirmClear = confirm("Are you sure you want to delete all EMI entries?");
  if (confirmClear) {
    emis = [];
    localStorage.removeItem('emis');
    renderEMIs();
  }
});




