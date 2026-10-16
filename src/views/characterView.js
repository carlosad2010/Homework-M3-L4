// views/characterView.js
// Orquesta: valida input → loading → service → transform → render (éxito o error)
import { getFirstCharacterByName } from '../services/rmApi.js';
import { toCharacterProfile } from '../transform/character.js';
import { getState, setState } from '../state.js';
import { render } from '../ui/render.js';

// Traduce errores técnicos a mensajes para humanos (nada de stack traces)
function getUserMessage(err) {
  if (err.code === 'NO_RESULTS') {
    return 'No encontramos ningún personaje con ese nombre.';
  }
  return 'No pudimos conectar con el servidor. Revisa tu conexión.';
}

export async function loadCharacterCard(name) {
  // Edge case: input vacío → no se hace la request
  if (!name.trim()) {
    setState({ status: 'error', error: 'Escribe un nombre para buscar.', lastSearch: null });
    render(getState());
    return;
  }

  setState({ status: 'loading', data: null, error: null, lastSearch: name });
  render(getState());

  try {
    const raw = await getFirstCharacterByName(name);
    const profile = toCharacterProfile(raw);
    setState({ status: 'success', data: profile });
    render(getState());
  } catch (err) {
    setState({ status: 'error', error: getUserMessage(err) });
    render(getState());
  }
}
