const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 1. Enable Foreign Keys
  db.run('PRAGMA foreign_keys = ON;');

  // 2. Create Departments Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Departments (
      DepartmentID INTEGER PRIMARY KEY AUTOINCREMENT,
      DepartmentName TEXT NOT NULL UNIQUE
    );
  `);

  // 3. Create Employees Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Employees (
      EmployeeID INTEGER PRIMARY KEY AUTOINCREMENT,
      FirstName TEXT NOT NULL,
      LastName TEXT NOT NULL,
      Email TEXT NOT NULL UNIQUE,
      Phone TEXT,
      DepartmentID INTEGER,
      Salary REAL,
      HireDate TEXT,
      IsActive INTEGER DEFAULT 1,
      FOREIGN KEY (DepartmentID) REFERENCES Departments(DepartmentID)
    );
  `);

  // 4. Create Tasks Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Tasks (
      TaskID INTEGER PRIMARY KEY AUTOINCREMENT,
      Title TEXT NOT NULL,
      Description TEXT,
      EmployeeID INTEGER,
      Priority TEXT CHECK(Priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
      Status TEXT CHECK(Status IN ('Pending', 'In Progress', 'Completed')) DEFAULT 'Pending',
      DueDate TEXT,
      CreatedDate TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID) ON DELETE SET NULL
    );
  `);

  // 5. Create Indexes for Query Optimization
  db.run(`CREATE INDEX IF NOT EXISTS IX_Employees_DepartmentID ON Employees(DepartmentID);`);
  db.run(`CREATE INDEX IF NOT EXISTS IX_Tasks_EmployeeID ON Tasks(EmployeeID);`);
  db.run(`CREATE INDEX IF NOT EXISTS IX_Tasks_Status ON Tasks(Status);`);

  // 6. Seed Sample Data
  db.get('SELECT COUNT(*) AS count FROM Departments', (err, row) => {
    if (err) return console.error('Error checking Departments:', err.message);

    if (row.count === 0) {
      console.log('Seeding initial data...');

      // Seed Departments
      db.run(`INSERT INTO Departments (DepartmentName) VALUES ('Development'), ('HR'), ('Testing'), ('Management');`, function(err) {
        if (err) return console.error(err.message);

        // Seed Employees
        db.run(`
          INSERT INTO Employees (FirstName, LastName, Email, Phone, DepartmentID, Salary, HireDate) VALUES 
          ('Rahul', 'Kumar', 'rahul@company.com', '9876543210', 1, 75000, '2024-01-15'),
          ('Priya', 'Sharma', 'priya@company.com', '9876543211', 2, 65000, '2024-02-01'),
          ('Arjun', 'Singh', 'arjun@company.com', '9876543212', 3, 60000, '2024-03-10');
        `, function(err) {
          if (err) return console.error(err.message);

          // Seed Tasks
          db.run(`
            INSERT INTO Tasks (Title, Description, EmployeeID, Priority, Status, DueDate) VALUES 
            ('Build REST API', 'Develop Express API for employee management', 1, 'High', 'In Progress', '2026-09-10'),
            ('Setup Database Schema', 'Define SQLite tables and constraints', 1, 'High', 'Completed', '2026-09-05'),
            ('Conduct HR Onboarding', 'Prepare onboarding docs for new hires', 2, 'Medium', 'Pending', '2026-09-15');
          `, function(err) {
            if (err) return console.error(err.message);
            console.log('Database initialized and seeded successfully!');
          });
        });
      });
    } else {
      console.log('Database already initialized.');
    }
  });
});

module.exports = db;