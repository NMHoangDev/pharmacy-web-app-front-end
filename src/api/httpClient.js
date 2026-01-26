const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8087";

async function httpFetch(path, opts = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers = Object.assign({}, opts.headers || {});

  // attach token from localStorage if Authorization not provided
  if (!headers.Authorization) {
    try {
      const token = localStorage.getItem("authToken");
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      // ignore in non-browser contexts
    }
  }

  const fetchOpts = Object.assign({}, opts, { headers });
  return fetch(url, fetchOpts);
}

export default httpFetch;
