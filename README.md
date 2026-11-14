# AVE Taller · Reserva de sesiones de cerámica

## Cómo levantar el proyecto en tu computadora
1. Instala [Node.js](https://nodejs.org) (versión 20 o superior) y Git.
2. Descarga el proyecto: `git clone https://github.com/hare95rodriguez-jpg/Ave-taller-de-ceramica.git` y entra a la carpeta: `cd Ave-taller-de-ceramica`.
3. Instala las dependencias: `npm install`.
4. Arranca el proyecto: `npm run dev`.
5. Abre `http://localhost:3100` (reservas) y `http://localhost:3100/panel` (panel, código inicial `AVE-2026`).

Para detenerlo, pulsa `Ctrl + C` en la terminal. Para probar la versión de producción: `npm run build` y luego `npm run start`.
Los datos viven en el navegador (`localStorage`), así que cada navegador o computadora empieza con sus propios datos de ejemplo.

## Qué está simulado
- **Persistencia:** sesiones y reservas se guardan en el `localStorage` del navegador (clave `ave-taller-v1`). La semilla (próximas 8 sesiones y 16 reservas) se carga solo si no hay nada guardado; se calcula desde la fecha de hoy en hora de México.
- **Panel (`/panel`):** protegido con un código de acceso que solo debe conocer el propietario. Es una protección básica en el navegador (no es seguridad real).
- **.ics:** se genera en el navegador, con un evento por fecha y `TZID=America/Mexico_City` (con su VTIMEZONE).
- **Pagos:** no hay; el total se abona en el taller.

## Qué lo reemplazaría
- Base de datos y backend reales en lugar de `localStorage` (el cupo debe controlarse en el servidor).
- Autenticación real del panel (cuenta del propietario con contraseña verificada en el servidor).

## Cómo probar
1. `/`: elige modalidad, marca fechas (1, o 3 distintas en el paquete), completa nombre, contacto, si es tu primera vez en cerámica (sí o no, obligatorio) y un comentario opcional, y reserva; descarga el .ics.
2. `/panel`: mira quién viene (con su contacto, si es primera vez y su comentario), anula una reserva (libera el lugar), agrega una sesión (miércoles o sábado) y prueba «Restablecer datos de ejemplo».

## Pasar de los ejemplos a datos reales
1. Si hacen falta más fechas, agregalas en «Agregar sesión» (miércoles o sábado).
2. Cada navegador guarda sus propios datos: hacelo en el navegador donde se va a gestionar el taller.
3. Opcional: «Restablecer datos de ejemplo» vuelve a cargar los ejemplos (solo para demostraciones). Para quitar ese botón del todo, borra la sección «Datos de ejemplo» de `src/components/panel-app.tsx`.

## Código de acceso al panel
1. El código inicial es `AVE-2026`. **Cámbialo antes de entregar la app.**
2. Para cambiarlo, abre `src/lib/acceso.ts` y edita el texto entre comillas de `CODIGO_PANEL`.
3. Al abrir `/panel` se pide el código; con «Cerrar el panel» se vuelve a bloquear. El acceso dura mientras la pestaña esté abierta.
4. Aviso: el código viaja dentro de la página, así que frena a curiosos pero no a alguien con conocimientos técnicos. Para protección real hace falta una cuenta con contraseña en un servidor.

## Botón «Compartir por WhatsApp» (prototipo)
Ahora el botón de la confirmación solo abre una ventana con la vista previa del mensaje; no envía nada. Para conectarlo de verdad:
1. Abre `src/components/reserva-app.tsx` y busca el botón «Compartir por WhatsApp» (`onClick={() => setVerWa(true)}`) y la ventana `verWa &&` justo debajo.
2. Opción simple (el cliente comparte el mensaje): cambia el botón por un enlace `<a href={`https://wa.me/?text=${encodeURIComponent(textoWa)}`} target="_blank" rel="noopener noreferrer">`. Para que llegue directo al taller usa `https://wa.me/52NÚMERO?text=...` (código de país 52 + 10 dígitos, sin espacios ni signos).
3. Opción automática (que el taller envíe la confirmación sin que el cliente haga nada): hace falta la API de WhatsApp Business (Meta Cloud API o un proveedor como Twilio). Se llama desde un servidor con tu clave, nunca desde el navegador, y requiere plantillas de mensaje aprobadas.
4. Cuando lo conectes, borra la ventana de vista previa y el estado `verWa`.
