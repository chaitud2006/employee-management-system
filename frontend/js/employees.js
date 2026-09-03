let allEmployees = [];

$(document).ready(function () {
  // Navigation Routing
  $('.nav-btn').click(function () {
    $('.nav-btn').removeClass('active');
    $(this).addClass('active');
    $('.page-section').addClass('hidden');

    const targetSection = $(this).data('target');
    $('#' + targetSection).removeClass('hidden');

    if (targetSection === 'dashboard-section') loadDashboardStats();
    if (targetSection === 'employees-section') { loadEmployees(); loadDepartmentsFilter(); }
    if (targetSection === 'tasks-section') loadTasks();
  });

  // Modal Controls
  $('#btn-open-emp-modal').click(function () {
    $('#emp-form')[0].reset();
    $('#emp-id').val('');
    $('#emp-modal-title').text('Add Employee');
    loadDepartmentsDropdown();
    $('#emp-modal').removeClass('hidden');
  });

  $('.close-modal').click(function () {
    $('.modal').addClass('hidden');
  });

  // Search & Filter Listeners
  $('#search-emp, #filter-dept').on('input change', function () {
    renderEmployees();
  });

  // Export CSV Listener
  $('#btn-export-emp').click(exportEmployeesCSV);

  // Initial Load
  loadDashboardStats();
});

function loadDashboardStats() {
  $.ajax({
    url: '/api/employees/dashboard/stats',
    method: 'GET',
    success: function (response) {
      if (response.success) {
        $('#stat-total-emp').text(response.data.totalEmployees);
        $('#stat-active-emp').text(response.data.activeEmployees);
        $('#stat-total-tasks').text(response.data.totalTasks);
        $('#stat-completed-tasks').text(response.data.completedTasks);
      }
    }
  });
}

function loadDepartmentsDropdown(selectedId = null) {
  $.ajax({
    url: '/api/tasks/departments',
    method: 'GET',
    success: function (response) {
      if (response.success) {
        let options = '<option value="">Select Department</option>';
        response.data.forEach(d => {
          options += `<option value="${d.DepartmentID}" ${selectedId == d.DepartmentID ? 'selected' : ''}>${d.DepartmentName}</option>`;
        });
        $('#emp-dept').html(options);
      }
    }
  });
}

function loadDepartmentsFilter() {
  $.ajax({
    url: '/api/tasks/departments',
    method: 'GET',
    success: function (response) {
      if (response.success) {
        let options = '<option value="">All Departments</option>';
        response.data.forEach(d => {
          options += `<option value="${d.DepartmentID}">${d.DepartmentName}</option>`;
        });
        $('#filter-dept').html(options);
      }
    }
  });
}

function loadEmployees() {
  $.ajax({
    url: '/api/employees',
    method: 'GET',
    success: function (response) {
      if (response.success) {
        allEmployees = response.data;
        renderEmployees();
      }
    }
  });
}

// Client-side search and filtering
function renderEmployees() {
  const searchTerm = $('#search-emp').val().toLowerCase();
  const selectedDept = $('#filter-dept').val();

  const filtered = allEmployees.filter(e => {
    const fullName = `${e.FirstName} ${e.LastName}`.toLowerCase();
    const email = (e.Email || '').toLowerCase();
    const matchesSearch = fullName.includes(searchTerm) || email.includes(searchTerm);
    const matchesDept = selectedDept === '' || e.DepartmentID == selectedDept;
    return matchesSearch && matchesDept;
  });

  let rows = '';
  filtered.forEach(e => {
    rows += `
      <tr>
        <td>${e.EmployeeID}</td>
        <td><strong>${e.FirstName} ${e.LastName}</strong></td>
        <td>${e.Email}</td>
        <td>${e.Phone || 'N/A'}</td>
        <td>${e.DepartmentName || 'Unassigned'}</td>
        <td>
          <button class="btn-secondary" onclick="editEmployee(${e.EmployeeID})">Edit</button>
          <button class="btn-danger" onclick="deleteEmployee(${e.EmployeeID})">Delete</button>
        </td>
      </tr>
    `;
  });

  $('#employee-tbody').html(rows || '<tr><td colspan="6" style="text-align:center;">No employees found</td></tr>');
}

$('#emp-form').submit(function (e) {
  e.preventDefault();

  const id = $('#emp-id').val();
  const empData = {
    firstName: $('#emp-firstname').val(),
    lastName: $('#emp-lastname').val(),
    email: $('#emp-email').val(),
    phone: $('#emp-phone').val(),
    departmentId: $('#emp-dept').val()
  };

  const url = id ? `/api/employees/${id}` : '/api/employees';
  const method = id ? 'PUT' : 'POST';

  $.ajax({
    url: url,
    method: method,
    contentType: 'application/json',
    data: JSON.stringify(empData),
    success: function (response) {
      alert(response.message);
      $('#emp-modal').addClass('hidden');
      loadEmployees();
      loadDashboardStats();
    },
    error: function (xhr) {
      const err = xhr.responseJSON;
      alert(err ? err.message : 'Error saving employee');
    }
  });
});

function editEmployee(id) {
  $.ajax({
    url: `/api/employees/${id}`,
    method: 'GET',
    success: function (response) {
      if (response.success) {
        const e = response.data;
        $('#emp-id').val(e.EmployeeID);
        $('#emp-firstname').val(e.FirstName);
        $('#emp-lastname').val(e.LastName);
        $('#emp-email').val(e.Email);
        $('#emp-phone').val(e.Phone);
        loadDepartmentsDropdown(e.DepartmentID);
        $('#emp-modal-title').text('Edit Employee');
        $('#emp-modal').removeClass('hidden');
      }
    }
  });
}

function deleteEmployee(id) {
  if (confirm('Are you sure you want to delete this employee?')) {
    $.ajax({
      url: `/api/employees/${id}`,
      method: 'DELETE',
      success: function (response) {
        alert(response.message);
        loadEmployees();
        loadDashboardStats();
      }
    });
  }
}

// CSV Export Generator
function exportEmployeesCSV() {
  if (allEmployees.length === 0) return alert('No employee data to export');

  let csvContent = 'data:text/csv;charset=utf-8,ID,Name,Email,Phone,Department\n';
  allEmployees.forEach(e => {
    csvContent += `${e.EmployeeID},"${e.FirstName} ${e.LastName}",${e.Email},${e.Phone || ''},${e.DepartmentName || ''}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'employee_directory.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}