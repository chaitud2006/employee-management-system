const db = require('../config/db');

// GET /api/employees - Fetch all active employees with department names
exports.getAllEmployees = (req, res, next) => {
  const sql = `
    SELECT 
      e.EmployeeID, 
      e.FirstName, 
      e.LastName, 
      e.Email, 
      e.Phone, 
      e.Salary, 
      e.HireDate, 
      e.IsActive, 
      d.DepartmentName,
      e.DepartmentID
    FROM Employees e
    LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
    WHERE e.IsActive = 1
    ORDER BY e.EmployeeID DESC;
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return next(err);
    res.json({ success: true, data: rows });
  });
};

// GET /api/employees/:id - Fetch single employee by ID
exports.getEmployeeById = (req, res, next) => {
  const sql = `
    SELECT e.*, d.DepartmentName 
    FROM Employees e
    LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
    WHERE e.EmployeeID = ? AND e.IsActive = 1;
  `;

  db.get(sql, [req.params.id], (err, row) => {
    if (err) return next(err);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: row });
  });
};

// POST /api/employees - Create new employee
exports.createEmployee = (req, res, next) => {
  const { firstName, lastName, email, phone, departmentId, salary, hireDate } = req.body;

  const sql = `
    INSERT INTO Employees (FirstName, LastName, Email, Phone, DepartmentID, Salary, HireDate)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;

  const params = [
    firstName, 
    lastName, 
    email, 
    phone || null, 
    departmentId, 
    salary || 0, 
    hireDate || new Date().toISOString().split('T')[0]
  ];

  db.run(sql, params, function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ success: false, message: 'An employee with this email already exists.' });
      }
      return next(err);
    }

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: { employeeId: this.lastID }
    });
  });
};

// PUT /api/employees/:id - Update employee details
exports.updateEmployee = (req, res, next) => {
  const { firstName, lastName, email, phone, departmentId, salary } = req.body;

  const sql = `
    UPDATE Employees 
    SET FirstName = ?, LastName = ?, Email = ?, Phone = ?, DepartmentID = ?, Salary = ?
    WHERE EmployeeID = ? AND IsActive = 1;
  `;

  const params = [firstName, lastName, email, phone, departmentId, salary, req.params.id];

  db.run(sql, params, function (err) {
    if (err) return next(err);
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found or inactive' });
    }

    res.json({ success: true, message: 'Employee updated successfully' });
  });
};

// DELETE /api/employees/:id - Soft delete employee
exports.deleteEmployee = (req, res, next) => {
  const sql = `UPDATE Employees SET IsActive = 0 WHERE EmployeeID = ?;`;

  db.run(sql, [req.params.id], function (err) {
    if (err) return next(err);
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, message: 'Employee deleted successfully' });
  });
};

// GET /api/employees/dashboard/stats - Summary numbers for dashboard
exports.getDashboardStats = (req, res, next) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM Employees) AS totalEmployees,
      (SELECT COUNT(*) FROM Employees WHERE IsActive = 1) AS activeEmployees,
      (SELECT COUNT(*) FROM Tasks) AS totalTasks,
      (SELECT COUNT(*) FROM Tasks WHERE Status = 'Completed') AS completedTasks;
  `;

  db.get(sql, [], (err, row) => {
    if (err) return next(err);
    res.json({ success: true, data: row });
  });
};