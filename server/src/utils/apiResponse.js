exports.success = (res, message, data = {}, statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data });
};

exports.error = (res, message, statusCode = 500, errors = []) => {
  res.status(statusCode).json({ success: false, message, errors });
};