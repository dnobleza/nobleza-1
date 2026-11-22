const authService = require('./auth.service');

async function register(req, res) {
  const user = await authService.register(req.body);
  res.status(201).json(user);
}

module.exports = { register };
