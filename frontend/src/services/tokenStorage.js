// Saves, reads and deletes the login token in the browser.
// localStorage keeps data until we delete it (survives closing the browser).
// sessionStorage is wiped when the browser tab/window closes.
const TOKEN_KEY = 'codehaus_token';

// Look in localStorage first, then sessionStorage. Returns null if no token.
export function getToken() {
  return (
    localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
  );
}

// remember = true  -> localStorage   (stays logged in after closing the browser)
// remember = false -> sessionStorage (logged out when the browser closes)
export function setToken(token, remember) {
  // Clear both first so the token never sits in two places at once.
  clearToken();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
}

// Used by Logout and when the backend says the token is no good.
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}
