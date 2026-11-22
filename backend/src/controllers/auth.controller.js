const authService = require('../services/auth.service');

async function register(req, res) {
  const user = await authService.register(req.body);
  res.status(201).json({
    message: 'Registration successful',
    user,
  });
}

async function login(req, res) {
  const { token, user } = await authService.login(req.body);
  res.status(200).json({
    message: 'Login successful',
    token,
    user,
  });
}

// req.user was set by requireAuth.
async function me(req, res) {
  const user = await authService.getCurrentUser(req.user.id);
  res.status(200).json({ user });
}

module.exports = { register, login, me };
