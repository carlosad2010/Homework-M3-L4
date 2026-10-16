// services/http.js
// Hace la request y devuelve el JSON. Si la respuesta no es ok, lanza un error con su status.

export async function fetchJson(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching JSON:', error);
    throw error;
  }
}
