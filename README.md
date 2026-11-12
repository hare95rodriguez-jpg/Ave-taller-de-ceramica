# AVE Taller · Reserva de sesiones de cerámica

## Qué está simulado
- **Persistencia:** sesiones y reservas se guardan en el `localStorage` del navegador (clave `ave-taller-v1`). La semilla (próximas 8 sesiones y 16 reservas) se carga solo si no hay nada guardado; se calcula desde la fecha de hoy en hora de México.
- **Panel (`/panel`):** sin login, solo demo local. En producción requeriría autenticación.
- **.ics:** se genera en el navegador, con un evento por fecha y `TZID=America/Mexico_City` (con su VTIMEZONE).
- **Pagos:** no hay; el total se abona en el taller.

## Qué lo reemplazaría
- Base de datos y backend reales en lugar de `localStorage` (el cupo debe controlarse en el servidor).
- Autenticación del panel (cuenta del equipo).

## Cómo probar
1. `/`: elegí modalidad, marcá fechas (1, o 3 distintas en el paquete), completá nombre y contacto y reservá; descargá el .ics.
2. `/panel`: mirá quién viene, anulá una reserva (libera el lugar), agregá una sesión (miércoles o sábado) y probá «Restablecer datos de ejemplo».
