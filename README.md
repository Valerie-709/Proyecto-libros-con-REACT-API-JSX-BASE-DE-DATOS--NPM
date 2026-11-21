# Entre Líneas — Biblioteca de medianoche

Aplicación Full Stack para descubrir libros de Open Library, guardar lecturas
y recibir recomendaciones automáticas según los gustos de cada cuenta.

## Experiencia

- **Inicio / Para ti:** al iniciar sesión, consulta automáticamente nuevos
  títulos según los intereses guardados en el perfil.
- **Descubrir:** combina hasta tres géneros y consulta el catálogo público.
- **Mi estante:** conserva los libros que la persona guarda.
- **Mis gustos:** permite editar o limpiar las preferencias de lectura.
- **Acceso y registro:** crea una cuenta local y mantiene la sesión entre visitas.

La interfaz usa un tema gótico moderno, fotografías de ambiente, portadas de
libros y animaciones que respetan la preferencia de movimiento reducido del
navegador.

## Arquitectura

```text
punto_4/
├── client/                 # Interfaz React + JSX + Vite
├── server/                 # API REST en Express y perfiles locales
├── package.json            # Scripts y dependencias del monorepo
└── README.md
```

En desarrollo, Vite sirve el frontend en el puerto `5173` y Express la API en
el `3001`; Vite reenvía `/api` al backend. Para el despliegue integrado,
`npm run build` compila el frontend en `client/dist` y Express sirve tanto los
archivos estáticos como la API desde el mismo puerto.

## Cuenta y datos

El registro solicita nombre, correo y contraseña. Express almacena perfiles,
intereses y libros favoritos en la base de datos SQLite
`server/data/users.sqlite`, que está excluida de Git. Si existe el archivo
anterior `server/data/users.json`, sus datos se importan automáticamente una
sola vez y el archivo original se conserva como respaldo. Las contraseñas se
almacenan como hashes `scrypt`, no como texto. La sesión usa una cookie
firmada `HttpOnly` y `SameSite=Lax`; la clave local también se guarda dentro de
`server/data/`. Las preferencias y libros favoritos se asocian a la cuenta y
se conservan al reiniciar el servidor local.

Esta versión guarda la información **solo en la instalación local**; no
sincroniza cuentas entre dispositivos y no incluye recuperación de contraseña.
Para publicar la aplicación en Internet, configura una clave `SESSION_SECRET`
segura mediante el entorno del servidor y almacena el archivo SQLite en un
volumen persistente con copias de seguridad.

## API propia

- `GET /api/health`: comprueba que Express está activo.
- `POST /api/auth/register`: crea una cuenta.
- `POST /api/auth/login`: inicia sesión.
- `POST /api/auth/logout`: cierra la sesión del navegador.
- `GET /api/auth/me`: recupera la cuenta activa.
- `PUT /api/auth/preferences`: guarda los intereses de lectura.
- `POST /api/auth/favorites`: guarda o quita un libro de la estantería.
- `POST /api/recommendations`: solicita recomendaciones para 1–3 intereses.

Ejemplo de recomendación:

```json
{
  "interests": ["fantasy", "mystery"]
}
```

Intereses aceptados: `fantasy`, `science-fiction`, `romance`, `mystery`,
`history` y `adventure`.

## API externa

Se usa la Search API pública de Open Library, sin clave:

`https://openlibrary.org/search.json`

Las búsquedas se realizan por materia (`subject`) desde el backend. Las
portadas disponibles se cargan desde `https://covers.openlibrary.org/`.

## Requisitos

- Node.js compatible con Vite 8 (recomendado: Node 22.12 o posterior).
- npm.
- Conexión a Internet para Open Library, portadas, fotografías y tipografías.

## Ejecución local

Desde la carpeta `punto_4`:

```bash
npm install
npm run dev
```

Abre la dirección que Vite indique, normalmente `http://localhost:5173/`.
Express inicia en `http://localhost:3001/`; la ruta de salud está en
`http://localhost:3001/api/health`.

Para validar y ejecutar el build integrado:

```bash
npm run lint
npm run build
npm start
```

`npm start` sirve la aplicación y la API en `http://localhost:3001/`. Crea una
cuenta desde **Crear cuenta** para guardar tus intereses y recibir
recomendaciones personalizadas al volver a **Para ti**.
