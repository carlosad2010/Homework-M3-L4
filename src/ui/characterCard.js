// ui/characterCard.js
// Pinta la tarjeta a partir del ViewModel (nunca del JSON crudo).

export function renderCharacterCard(container, profile) {
  const imageHtml = profile.image
    ? `<img class="pokemon-artwork" src="${profile.image}" alt="${profile.name}" />`
    : `<div class="no-image">Este personaje no tiene imagen</div>`;

  container.innerHTML = `
    <div class="data-card">
      <div class="pokemon-art">${imageHtml}</div>
      <div class="pokemon-details">
        <h2>${profile.name}</h2>
        <p>${profile.status} — ${profile.species}</p>
        <p>Origen: ${profile.originName}</p>
        <p>Ubicación: ${profile.locationName}</p>
      </div>
    </div>
  `;
}
