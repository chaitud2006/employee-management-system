let allTasks = [];

$('#btn-open-task-modal').click(function () {
  $('#task-form')[0].reset();
  $('#task-id').val('');
  $('#task-modal-title').text('Add Task');
  loadEmployeesDropdown();
  $('#task-modal').removeClass('hidden');
});

// Search & Filter Listeners for Tasks
$('#search-tasks, #filter-status').on('input change', function () {
  renderTasks();
});

// Export CSV Listener for Tasks
$('#btn-export-tasks').click(exportTasksCSV);

function loadEmployeesDropdown(selectedId = null) {
  $.ajax({
    url: '/api/employees',
    method: 'GET',
    success: function (response) {
      if (response.success) {
        let options = '<option value="">Unassigned</option>';
        response.data.forEach(e => {
          options += `<option value="${e.EmployeeID}" ${selectedId == e.EmployeeID ? 'selected' : ''}>${e.FirstName} ${e.LastName}</option>`;
        });
        $('#task-emp').html(options);
      }
    }
  });
}

function loadTasks() {
  $.ajax({
    url: '/api/tasks',
    method: 'GET',
    success: function (response) {
      if (response.success) {
        allTasks = response.data;
        renderTasks();
      }
    }
  });
}

// Render tasks with Status Badges and Filters
function renderTasks() {
  const searchTerm = $('#search-tasks').val().toLowerCase();
  const selectedStatus = $('#filter-status').val();

  const filtered = allTasks.filter(t => {
    const matchesSearch = (t.Title || '').toLowerCase().includes(searchTerm);
    const matchesStatus = selectedStatus === '' || t.Status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  let rows = '';
  filtered.forEach(t => {
    // Badges UI Mapping
    const statusClass = t.Status === 'Completed' ? 'badge-completed' : (t.Status === 'In Progress' ? 'badge-progress' : 'badge-pending');
    const priorityClass = t.Priority === 'High' ? 'badge-high' : (t.Priority === 'Medium' ? 'badge-medium' : 'badge-low');

    rows += `
      <tr>
        <td>${t.TaskID}</td>
        <td><strong>${t.Title}</strong><br><small style="color:#64748b;">${t.Description || ''}</small></td>
        <td>${t.EmployeeName || 'Unassigned'}</td>
        <td><span class="badge ${priorityClass}">${t.Priority}</span></td>
        <td><span class="badge ${statusClass}">${t.Status}</span></td>
        <td>${t.DueDate || 'N/A'}</td>
        <td>
          <button class="btn-danger" onclick="deleteTask(${t.TaskID})">Delete</button>
        </td>
      </tr>
    `;
  });

  $('#task-tbody').html(rows || '<tr><td colspan="7" style="text-align:center;">No tasks found</td></tr>');
}

$('#task-form').submit(function (e) {
  e.preventDefault();

  const id = $('#task-id').val();
  const taskData = {
    title: $('#task-title').val(),
    description: $('#task-desc').val(),
    employeeId: $('#task-emp').val() || null,
    priority: $('#task-priority').val(),
    status: $('#task-status').val(),
    dueDate: $('#task-duedate').val()
  };

  const url = id ? `/api/tasks/${id}` : '/api/tasks';
  const method = id ? 'PUT' : 'POST';

  $.ajax({
    url: url,
    method: method,
    contentType: 'application/json',
    data: JSON.stringify(taskData),
    success: function (response) {
      alert(response.message);
      $('#task-modal').addClass('hidden');
      loadTasks();
      loadDashboardStats();
    },
    error: function (xhr) {
      const err = xhr.responseJSON;
      alert(err ? err.message : 'Error saving task');
    }
  });
});

function deleteTask(id) {
  if (confirm('Are you sure you want to delete this task?')) {
    $.ajax({
      url: `/api/tasks/${id}`,
      method: 'DELETE',
      success: function (response) {
        alert(response.message);
        loadTasks();
        loadDashboardStats();
      }
    });
  }
}

// CSV Export Generator for Tasks
function exportTasksCSV() {
  if (allTasks.length === 0) return alert('No task data to export');

  let csvContent = 'data:text/csv;charset=utf-8,ID,Title,AssignedTo,Priority,Status,DueDate\n';
  allTasks.forEach(t => {
    csvContent += `${t.TaskID},"${t.Title}",${t.EmployeeName || 'Unassigned'},${t.Priority},${t.Status},${t.DueDate || ''}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'task_tracker.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}