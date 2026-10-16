// services/rmApi.js
// Arma la URL de búsqueda y devuelve el primer personaje raw (sin transformar).
// Ruta en el JSON: results[0]. Sin resultados, la API responde 404.
import { fetchJson } from './http.js';

const BASE_URL = 'https://rickandmortyapi.com/api/character/';

function createNoResultsError() {
  const error = new Error('No results found');
  error.code = 'NO_RESULTS';
  return error;
}

// Exportada para poder probarla en consola
export function buildCharacterSearchUrl({ name, page = 1 }) {
  const params = new URLSearchParams({
    name: name.trim(),
    page: String(page),
  });
  return `${BASE_URL}?${params.toString()}`;
}

export async function getFirstCharacterByName(name) {
  const url = buildCharacterSearchUrl({ name });

  let data;
  try {
    data = await fetchJson(url);
  } catch (err) {
    // 404 = no hay personajes con ese nombre; cualquier otro error sigue tal cual
    if (err.status === 404) {
      throw createNoResultsError();
    }
    throw err;
  }

  // Por si la API algún día responde 200 con results vacío
  const first = data.results?.[0];
  if (!first) {
    throw createNoResultsError();
  }
  return first;
}
