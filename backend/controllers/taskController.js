const db = require('../config/db');

// GET /api/tasks - Get all tasks with assigned employee name
exports.getAllTasks = (req, res, next) => {
  const sql = `
    SELECT 
      t.TaskID, 
      t.Title, 
      t.Description, 
      t.Priority, 
      t.Status, 
      t.DueDate, 
      t.CreatedDate,
      t.EmployeeID,
      (e.FirstName || ' ' || e.LastName) AS EmployeeName
    FROM Tasks t
    LEFT JOIN Employees e ON t.EmployeeID = e.EmployeeID
    ORDER BY t.TaskID DESC;
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return next(err);
    res.json({ success: true, data: rows });
  });
};

// POST /api/tasks - Create task
exports.createTask = (req, res, next) => {
  const { title, description, employeeId, priority, status, dueDate } = req.body;

  const sql = `
    INSERT INTO Tasks (Title, Description, EmployeeID, Priority, Status, DueDate)
    VALUES (?, ?, ?, ?, ?, ?);
  `;

  const params = [
    title, 
    description || '', 
    employeeId || null, 
    priority || 'Medium', 
    status || 'Pending', 
    dueDate || null
  ];

  db.run(sql, params, function (err) {
    if (err) return next(err);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { taskId: this.lastID }
    });
  });
};

// PUT /api/tasks/:id - Update task status or assignment
exports.updateTask = (req, res, next) => {
  const { title, description, employeeId, priority, status, dueDate } = req.body;

  const sql = `
    UPDATE Tasks 
    SET Title = ?, Description = ?, EmployeeID = ?, Priority = ?, Status = ?, DueDate = ?
    WHERE TaskID = ?;
  `;

  const params = [title, description, employeeId, priority, status, dueDate, req.params.id];

  db.run(sql, params, function (err) {
    if (err) return next(err);
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, message: 'Task updated successfully' });
  });
};

// DELETE /api/tasks/:id - Remove task
exports.deleteTask = (req, res, next) => {
  const sql = `DELETE FROM Tasks WHERE TaskID = ?;`;

  db.run(sql, [req.params.id], function (err) {
    if (err) return next(err);
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, message: 'Task deleted successfully' });
  });
};

// GET /api/departments - Fetch departments for dropdowns
exports.getDepartments = (req, res, next) => {
  db.all(`SELECT * FROM Departments ORDER BY DepartmentName ASC;`, [], (err, rows) => {
    if (err) return next(err);
    res.json({ success: true, data: rows });
  });
};