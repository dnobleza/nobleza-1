import { request } from './api';

// Send the 5 register fields only. Never role, never terms.
export function register({
  name,
  email,
  mobileNumber,
  password,
  confirmPassword,
}) {
  return request('/auth/register', {
    method: 'POST',
    body: { name, email, mobileNumber, password, confirmPassword },
  });
}

// identifier = email OR Philippine mobile number
export function login(identifier, password) {
  return request('/auth/login', {
    method: 'POST',
    body: { identifier, password },
  });
}

// Needs a token. api.js adds the Authorization header for us.
export function me() {
  return request('/auth/me');
}
