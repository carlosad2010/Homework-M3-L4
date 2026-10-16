# Buscador de Rick & Morty
## Demo en línea

Prueba la aplicación publicada en GitHub Pages: [Buscador de Rick & Morty](https://carlosad2010.github.io/Homework-M3-L4/).

Tarjeta de perfil de un personaje de la serie *Rick and Morty*, pensada para mostrarse antes de empezar a chatear. Consume la [Rick and Morty API](https://rickandmortyapi.com/) y recorre el ciclo completo: documentación → endpoint → URL → JSON → ViewModel → render.

> **Historia de usuario:** como usuario del chat, quiero ver una tarjeta de perfil del personaje antes de empezar a chatear, con su nombre, imagen, estado, especie y origen, para saber con quién estoy hablando antes de escribir el primer mensaje.

## Funcionalidades

- Busca un personaje por nombre, por ejemplo `rick`, `morty` o `mr poopybutthole`.
- Muestra nombre, imagen, estado, especie, origen y ubicación actual.
- Tiene tres estados visibles: **cargando**, **error** con mensaje claro y **éxito** con la tarjeta.
- Si la búsqueda falla, permite reintentarla.

## Decisión de endpoint

- **Endpoint:** `GET https://rickandmortyapi.com/api/character/?name={nombre}&page=1`
- **¿Por qué por `name` y no por `id`?** Porque quien escribe en el input es una persona, y nadie conoce el id de un personaje; sí conoce su nombre.
- **Diferencia entre las dos búsquedas:**
  - `/character/?name=rick` devuelve una envoltura `{ info, results: [...] }`, así que hay que tomar `results[0]`.
  - `/character/1` devuelve el objeto del personaje directo.

### Rutas en el JSON

| Campo de la tarjeta | Ruta en el JSON |
|---|---|
| `name` | `results[0].name` |
| `image` | `results[0].image` |
| `status` | `results[0].status` |
| `species` | `results[0].species` |
| `originName` | `results[0].origin.name` |
| `locationName` | `results[0].location.name` |

### Comportamientos de la API que descubrí inspeccionando el JSON

- **Sin resultados:** la API responde **`404`**, no `200` con `results: []`. Por eso `rmApi.js` convierte el 404 en un error con `code = 'NO_RESULTS'`.
- **Origen desconocido:** `origin` no viene `null`, sino `{ "name": "unknown", "url": "" }`. Por eso la tarjeta muestra `unknown` en personajes como *Adjudicator Rick*.
- **Strings vacíos:** algunos campos vienen como `""` (por ejemplo, `type` de Rick Sanchez).
- **Espacios en el nombre:** `URLSearchParams` los codifica como `+` (`name=mr+poopybutthole`), así que la URL sigue siendo válida.

## Estructura del proyecto

```text
.
├── index.html                 # Estructura, formulario y contenedores de estados
├── styles.css                 # Estilos de la interfaz
└── src/
    ├── main.js                # Solo eventos del DOM (submit y reintentar)
    ├── state.js               # Estado de la app: status, data, error, lastSearch
    ├── services/
    │   ├── http.js            # fetchJson: request, validación de response.ok y error con status
    │   └── rmApi.js           # buildCharacterSearchUrl (URLSearchParams) y getFirstCharacterByName
    ├── transform/
    │   └── character.js       # toCharacterProfile + helpers getOriginName / getLocationName
    ├── ui/
    │   ├── characterCard.js   # renderCharacterCard: pinta la tarjeta a partir del ViewModel
    │   └── render.js          # Muestra loading / error / éxito según el estado
    └── views/
        └── characterView.js   # Orquestador: valida → loading → service → transform → render
```

### Responsabilidad de cada capa

| Capa | Hace | No hace |
|---|---|---|
| `services/` | Arma la URL, hace la request y devuelve el personaje **raw** | No toca el DOM ni transforma datos |
| `transform/` | Convierte el raw en un objeto plano con defaults (ViewModel) | No hace fetch ni toca el DOM |
| `ui/` | Pinta el ViewModel y los estados | No conoce la forma del JSON de la API |
| `views/` | Coordina el flujo y traduce errores a mensajes para humanos | No construye HTML |

## Flujo de una búsqueda

1. `main.js` toma el valor del input y llama a `loadCharacterCard(name)`.
2. Si el input está vacío, la view muestra *"Escribe un nombre para buscar."* y **no hace la request**.
3. La view pasa a `loading` y `render.js` muestra el spinner.
4. `rmApi.js` construye la URL con `URLSearchParams` y la pide con `fetchJson`.
5. `toCharacterProfile` transforma el personaje raw en el ViewModel.
6. La view pasa a `success` y `renderCharacterCard` pinta la tarjeta.
7. Si algo falla, la view pasa a `error` con un mensaje para humanos:
   - `NO_RESULTS` (404) → *"No encontramos ningún personaje con ese nombre."*
   - Cualquier otro error (red, 500…) → *"No pudimos conectar con el servidor. Revisa tu conexión."*

## ViewModel: `toCharacterProfile`

```js
{
  id,
  name,          // default "Desconocido"
  status,        // default "Desconocido"
  species,       // default "Desconocido"
  image,         // default "" → la tarjeta muestra "Este personaje no tiene imagen"
  originName,    // getOriginName:   origin?.name   ?? "Desconocido"
  locationName,  // getLocationName: location?.name ?? "Desconocido"
}
```

Todos los defaults usan `??` (nunca `||`) y los campos anidados se leen con `?.`.

## Edge cases verificados

| Escenario | Cómo lo probé | Resultado |
|---|---|---|
| Input vacío | Buscar sin escribir nada | Mensaje *"Escribe un nombre para buscar."*, título *"Nombre vacío"*, sin botón de reintentar y **0 requests** en DevTools → Red |
| Personaje inexistente | Buscar `pedroperez` | 404 en Red y mensaje *"No encontramos ningún personaje con ese nombre."* |
| Campos faltantes | `toCharacterProfile({ name: 'Test', origin: null })` y `toCharacterProfile({})` en consola | Defaults en todos los campos, ningún `undefined` |
| Sin imagen | Render con `image: ''` | Texto *"Este personaje no tiene imagen"*, sin ícono roto |
| Origen desconocido | Buscar `adjudicator` | La tarjeta se muestra completa con *Origen: unknown* |
| Sin conexión | DevTools → Red → *Sin conexión* | *"No pudimos conectar con el servidor…"* (no se confunde con "sin resultados") |
| Estado de carga | DevTools → Red → *3G* | Se ve el spinner *"Buscando los datos…"* antes de la tarjeta |

## Preguntas de reflexión

**1. Si mañana cambio a la API de Pokémon, ¿qué archivos tengo que tocar?**
`services/rmApi.js` (URL base, parámetros y forma de la respuesta) y `transform/character.js` (las rutas del JSON cambian). La UI (`ui/`) no se toca, porque solo conoce el ViewModel. Si los nombres de campos del ViewModel se mantienen, tampoco cambian `views/` ni `main.js`.

**2. Si el diseño de la tarjeta agrega un campo nuevo, ¿qué archivos tengo que tocar?**
`transform/character.js`, para extraer el campo con su default (y un helper si está anidado), y `ui/characterCard.js`, para mostrarlo. `services/` no cambia, porque la API ya devuelve el personaje completo.

**3. Si el render recibe el ViewModel en lugar del JSON crudo, ¿qué problema elimina cuando el backend cambia?**
El render queda aislado de la forma del JSON. Si la API renombra o mueve un campo (por ejemplo, `origin` → `birthplace`), solo se corrige el helper del transform y la tarjeta sigue funcionando. Sin ViewModel habría que buscar `raw.origin.name` en cada lugar que lo pinte. Además, el render nunca recibe `undefined`, porque los defaults ya vienen resueltos.

**4. ¿Por qué el transform usa `??` y no `||` para los defaults?**
`||` reemplaza cualquier valor *falsy* (`''`, `0`, `false`), aunque sea un dato real. `??` solo reemplaza `null` y `undefined`, es decir, cuando el dato **falta**. Ejemplo: `'' || 'N/A'` devuelve `'N/A'`, pero `'' ?? 'N/A'` devuelve `''`. Rick tiene `type: ''`, y con `||` la tarjeta "mentiría" mostrando un default. Lo mismo pasaría con un `0` válido, como una cantidad de episodios.

## Uso local

Como la app usa módulos JavaScript, hay que abrirla desde un servidor local (no con doble clic sobre `index.html`):

1. Abre la carpeta `Homework-M3-L4` en Visual Studio Code.
2. Clic derecho en `index.html` → **Open with Live Server**.
3. Escribe el nombre de un personaje y presiona **Buscar Personaje**.

Se necesita conexión a internet para consultar la API y cargar las imágenes.

## Tecnologías

- HTML
- CSS
- JavaScript con módulos ES (sin dependencias)
- [Rick and Morty API](https://rickandmortyapi.com/documentation)
