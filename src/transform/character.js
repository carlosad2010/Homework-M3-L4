// transform/character.js
// Convierte el personaje raw de la API en el ViewModel de la tarjeta.
// Rutas: results[0].origin.name → originName, results[0].location.name → locationName

export function getOriginName(rawCharacter) {
  return rawCharacter.origin?.name ?? "Desconocido";
}

export function getLocationName(rawCharacter) {
  return rawCharacter.location?.name ?? "Desconocido";
}

export function toCharacterProfile(rawCharacter) {
  const { id, name, status, species, image } = rawCharacter;
  return {
    id,
    name: name ?? "Desconocido",
    status: status ?? "Desconocido",
    species: species ?? "Desconocido",
    image: image ?? "",
    originName: getOriginName(rawCharacter),
    locationName: getLocationName(rawCharacter),
  };
}
