const validateEmployee = (req, res, next) => {
  const { firstName, lastName, email, departmentId } = req.body;

  if (!firstName || !lastName || !email || !departmentId) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: firstName, lastName, email, and departmentId are required fields.'
    });
  }

  // Basic email pattern check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Please provide a valid email address.'
    });
  }

  next();
};

const validateTask = (req, res, next) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Task title is required.'
    });
  }

  next();
};

module.exports = { validateEmployee, validateTask };