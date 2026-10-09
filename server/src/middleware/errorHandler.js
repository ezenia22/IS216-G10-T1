export function errorHandler(err, req, res, next) {
  console.error(err)

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id' })
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0]
    const message = field === 'email' ? 'Email already registered' : `Duplicate value for ${field}`
    return res.status(409).json({ message })
  }
  res.status(err.status || 500).json({ message: err.message || 'Server error' })
}

export default errorHandler
