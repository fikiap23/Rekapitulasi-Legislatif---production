const apiHandler = ({ res, status, code, message, data, error }) => {
  return res.status(code).json({
    status: status,
    code: code,
    message: message,
    data: data,
    error: error,
  })
}

export default apiHandler
