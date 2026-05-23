const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = [];
    const fieldErrors = {};

    errors.array().forEach((err) => {
      // Flat message list (for quick display)
      if (!extractedErrors.includes(err.msg)) {
        extractedErrors.push(err.msg);
      }

      // Field-wise errors (for forms)
      if (!fieldErrors[err.path]) {
        fieldErrors[err.path] = [];
      }
      fieldErrors[err.path].push(err.msg);
    });

    return res.status(400).json({
      success: false,
      error: extractedErrors.join(', '),
      errors: fieldErrors,
      ...(process.env.NODE_ENV === 'development' && {
        raw: errors.array(),
      }),
    });
  }

  next();
};

module.exports = validate;