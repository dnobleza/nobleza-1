import { getToken } from './tokenStorage';

const BASE_PATH = '/api/v1';

// One helper that every API call goes through.
// "async" means this function returns a Promise (a "result that arrives later").
// Inside it, "await" pauses until that result arrives.
export async function request(path, { method = 'GET', body } = {}) {
  const headers = {};

  // Only send a JSON body when we have one (login/register).
  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  // If the user is logged in, prove it to the backend with the token.
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    // fetch sends the HTTP request. It only fails (throws) when the network
    // fails, e.g. the backend is not running. A 401 or 409 does NOT throw here.
    response = await fetch(`${BASE_PATH}${path}`, {
      method,
      headers,
      // JSON.stringify turns the JS object into JSON text for the request body.
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Is the backend running?");
  }

  // The backend sends JSON, but be safe: if the body is empty or not JSON,
  // use null instead of crashing.
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // response.ok is true for status 200-299. Anything else is an error.
  if (!response.ok) {
    const error = new Error(
      data?.error || 'Something went wrong. Please try again.',
    );
    // Attach the status code so pages can react (e.g. 401 -> go to login).
    error.status = response.status;
    throw error;
  }

  return data;
}
