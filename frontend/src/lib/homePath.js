// Where each role belongs after logging in.
export function homePathFor(role) {
  if (role === 'admin') return '/admin';
  if (role === 'client') return '/dashboard';
  // An unknown role goes to the public page, which avoids a redirect loop.
  return '/';
}
