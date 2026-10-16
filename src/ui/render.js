// ui/render.js
// Muestra el estado actual: loading, éxito (tarjeta) o error.
import { renderCharacterCard } from './characterCard.js';

export function render(state) {
  const loading = document.querySelector('#loading');
  const content = document.querySelector('#content');
  const error = document.querySelector('#error');

  // Ocultar todo primero
  loading.classList.add('hidden');
  content.classList.add('hidden');
  error.classList.add('hidden');

  // Mostrar según estado
  if (state.status === 'loading') {
    loading.classList.remove('hidden');
  } else if (state.status === 'success') {
    content.classList.remove('hidden');
    renderCharacterCard(content, state.data);
  } else if (state.status === 'error') {
    error.classList.remove('hidden');
    document.querySelector('#error-message').textContent = state.error;
    // Sin lastSearch = input vacío: no hubo búsqueda que reintentar
    document.querySelector('#error-title').textContent = state.lastSearch
      ? `No se pudo completar la búsqueda "${state.lastSearch}"`
      : 'Nombre vacío';
    document.querySelector('#retry-btn').classList.toggle('hidden', !state.lastSearch);
  }
}
