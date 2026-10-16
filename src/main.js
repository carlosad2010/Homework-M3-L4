// main.js — solo eventos del DOM
import { loadCharacterCard } from './views/characterView.js';
import { getState } from './state.js';

document.querySelector('#search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  // La validación de input vacío vive en la view
  loadCharacterCard(document.querySelector('#search-input').value);
});

document.querySelector('#retry-btn').addEventListener('click', () => {
  const { lastSearch } = getState();
  if (lastSearch) loadCharacterCard(lastSearch);
});
