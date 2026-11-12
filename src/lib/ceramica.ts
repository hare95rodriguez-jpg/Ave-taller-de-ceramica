// Lógica de AVE Taller: sesiones, reservas, cupo, semilla, almacenamiento local y .ics. Todo en el navegador.
export type Sesion = { id: string; fecha: string; inicio: string; fin: string; cupo: number };
export type ModalidadId = 'suelta' | 'experiencia' | 'paquete';
export type Reserva = {
  id: string;
  nombre: string;
  contacto: string;
  modalidad: ModalidadId;
  sesiones: string[];
  total: number;
  creada: string;
  estado: 'activa' | 'anulada';
};
export type Datos = { sesiones: Sesion[]; reservas: Reserva[] };

export const TZ = 'America/Mexico_City';
export const CUPO = 8;
const KEY = 'ave-taller-v1';
const OFFSET_H = 6; // México no usa horario de verano: siempre UTC-6

export const MODALIDADES: { id: ModalidadId; nombre: string; fechas: number; precio: number; texto: string }[] = [
  { id: 'suelta', nombre: 'Clase suelta', fechas: 1, precio: 600, texto: 'Una fecha, para quienes ya vienen al taller.' },
  { id: 'experiencia', nombre: 'Experiencia de un día', fechas: 1, precio: 700, texto: 'Una fecha, pensada para probar el barro por primera vez.' },
  { id: 'paquete', nombre: 'Paquete de 3 clases', fechas: 3, precio: 1500, texto: 'Tres fechas distintas que eliges ahora.' },
];

export const dinero = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

export const hoyMx = () => new Date(Date.now() - OFFSET_H * 3600e3).toISOString().slice(0, 10);
export const inicioMs = (s: Sesion) => Date.parse(`${s.fecha}T${s.inicio}:00-06:00`);
export const esFutura = (s: Sesion) => inicioMs(s) > Date.now();
export const diaSemana = (fecha: string) => new Date(`${fecha}T12:00:00Z`).getUTCDay();
export const fechaLarga = (fecha: string) =>
  new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
    new Date(`${fecha}T12:00:00Z`),
  );
export const fechaCorta = (fecha: string) =>
  new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${fecha}T12:00:00Z`));

export const horarioDe = (fecha: string) => (diaSemana(fecha) === 3 ? { inicio: '16:00', fin: '19:00' } : { inicio: '10:30', fin: '13:30' });
export const crearSesion = (fecha: string): Sesion => ({ id: `s-${fecha}`, fecha, ...horarioDe(fecha), cupo: CUPO });

export const ocupadas = (d: Datos, id: string) => d.reservas.filter((r) => r.estado === 'activa' && r.sesiones.includes(id)).length;
export const libres = (d: Datos, s: Sesion) => Math.max(0, s.cupo - ocupadas(d, s.id));
export const futuras = (d: Datos) => d.sesiones.filter(esFutura).sort((a, b) => inicioMs(a) - inicioMs(b));

function sumaDias(fecha: string, n: number) {
  return new Date(Date.parse(`${fecha}T12:00:00Z`) + n * 86400e3).toISOString().slice(0, 10);
}

const NOMBRES: [string, string][] = [
  ['Valeria Montes', 'valeria.montes@correo.mx'], ['Diego Arriaga', '55 4821 7730'], ['Camila Ortega', 'camila.ortega@correo.mx'],
  ['Mateo Beltrán', '55 3390 1184'], ['Renata Salgado', 'renata.salgado@correo.mx'], ['Joaquín Ibarra', '33 1204 5568'],
  ['Ximena Duarte', 'ximena.duarte@correo.mx'], ['Emilio Cárdenas', '55 7712 0095'], ['Regina Lozano', 'regina.lozano@correo.mx'],
  ['Santiago Pineda', '81 2255 4310'], ['Paola Reyes', 'paola.reyes@correo.mx'], ['Andrés Villaseñor', '55 6108 2247'],
  ['Mariana Echeverría', 'mariana.echeverria@correo.mx'], ['Luciano Fuentes', '55 9034 6612'], ['Natalia Quiroz', 'natalia.quiroz@correo.mx'],
  ['Bruno Medina', '55 1847 3396'],
];

export function semilla(): Datos {
  const hoy = hoyMx();
  const sesiones: Sesion[] = [];
  for (let i = -21; i <= 40 && sesiones.filter(esFutura).length < 8; i++) {
    const f = sumaDias(hoy, i);
    const dw = diaSemana(f);
    if (dw !== 3 && dw !== 6) continue;
    const s = crearSesion(f);
    if (esFutura(s) || i >= -7) sesiones.push(s);
  }
  const fut = futuras({ sesiones, reservas: [] });
  const ids = fut.map((s) => s.id);
  const F = fut.findIndex((s) => diaSemana(s.fecha) === 6 && fut.indexOf(s) < 7);
  const W = fut.findIndex((s, i) => diaSemana(s.fecha) === 3 && i < 7 && i !== F);
  const o = [0, 1, 2, 3, 4, 5, 6].filter((i) => i !== F && i !== W);
  const paquetes = [[F, W, o[0]], [F, W, o[1]], [F, W, o[2]], [F, o[3], o[0]]];
  const sueltas = [F, F, F, F, W, W, W, W, o[0], o[1], o[2], o[4]];
  const modos: ModalidadId[] = ['suelta', 'suelta', 'experiencia', 'suelta', 'experiencia', 'suelta', 'experiencia', 'suelta', 'experiencia', 'suelta', 'experiencia', 'suelta'];
  const lista: { modalidad: ModalidadId; sesiones: string[] }[] = [
    ...paquetes.map((p) => ({ modalidad: 'paquete' as const, sesiones: p.map((i) => ids[i]) })),
    ...sueltas.map((i, k) => ({ modalidad: modos[k], sesiones: [ids[i]] })),
  ];
  const reservas: Reserva[] = lista.map((r, k) => ({
    id: `r-${k + 1}`,
    nombre: NOMBRES[k][0],
    contacto: NOMBRES[k][1],
    modalidad: r.modalidad,
    sesiones: r.sesiones,
    total: MODALIDADES.find((m) => m.id === r.modalidad)!.precio,
    creada: new Date(Date.now() - (k + 1) * 5 * 3600e3).toISOString(),
    estado: 'activa',
  }));
  return { sesiones, reservas };
}

export function leer(): Datos | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!Array.isArray(d?.sesiones) || !Array.isArray(d?.reservas)) return null;
    return d as Datos;
  } catch {
    return null;
  }
}
export function guardar(d: Datos): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
    return true;
  } catch {
    return false;
  }
}
/** Lee lo guardado; si no hay nada, carga la semilla. */
export function cargar(): Datos {
  const d = leer();
  if (d) return d;
  const s = semilla();
  guardar(s);
  return s;
}

export const contactoValido = (c: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c) || /^[+\d][\d\s().-]{7,}$/.test(c);

/** Valida y crea una reserva sobre los datos más recientes. */
export function reservar(
  base: Datos,
  x: { nombre: string; contacto: string; modalidad: ModalidadId; sesiones: string[] },
): { ok: true; datos: Datos; reserva: Reserva } | { ok: false; error: string } {
  const m = MODALIDADES.find((z) => z.id === x.modalidad)!;
  const nombre = x.nombre.trim();
  const contacto = x.contacto.trim();
  if (nombre.length < 2) return { ok: false, error: 'Escribe tu nombre.' };
  if (!contacto) return { ok: false, error: 'Dejanos un correo o un teléfono.' };
  if (!contactoValido(contacto)) return { ok: false, error: 'El contacto tiene que ser un correo válido o un teléfono de al menos 8 dígitos.' };
  if (new Set(x.sesiones).size !== m.fechas) return { ok: false, error: `Marca ${m.fechas === 1 ? '1 fecha' : `${m.fechas} fechas distintas`}.` };
  for (const id of x.sesiones) {
    const s = base.sesiones.find((z) => z.id === id);
    if (!s || !esFutura(s)) return { ok: false, error: 'Una de las fechas ya no está disponible. Elige otra.' };
    if (libres(base, s) <= 0) return { ok: false, error: `La fecha del ${fechaLarga(s.fecha)} se quedó sin lugar. Elige otra.` };
    const dup = base.reservas.some(
      (r) => r.estado === 'activa' && r.sesiones.includes(id) && r.contacto.toLowerCase() === contacto.toLowerCase(),
    );
    if (dup) return { ok: false, error: `Ese contacto ya tiene un lugar el ${fechaLarga(s.fecha)}.` };
  }
  const reserva: Reserva = {
    id: `r-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    nombre,
    contacto,
    modalidad: x.modalidad,
    sesiones: [...x.sesiones],
    total: m.precio,
    creada: new Date().toISOString(),
    estado: 'activa',
  };
  return { ok: true, datos: { ...base, reservas: [...base.reservas, reserva] }, reserva };
}

export function generarIcs(d: Datos, r: Reserva): string {
  const m = MODALIDADES.find((z) => z.id === r.modalidad)!;
  const comp = (f: string, h: string) => `${f.replace(/-/g, '')}T${h.replace(':', '')}00`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const eventos = r.sesiones
    .map((id) => d.sesiones.find((s) => s.id === id))
    .filter((s): s is Sesion => !!s)
    .map((s) =>
      [
        'BEGIN:VEVENT',
        `UID:${r.id}-${s.id}@avetaller`,
        `DTSTAMP:${stamp}`,
        `DTSTART;TZID=${TZ}:${comp(s.fecha, s.inicio)}`,
        `DTEND;TZID=${TZ}:${comp(s.fecha, s.fin)}`,
        `SUMMARY:AVE Taller – Taller libre de cerámica (${m.nombre})`,
        'DESCRIPTION:Materiales incluidos. El total se abona en el taller.',
        'LOCATION:AVE Taller',
        'END:VEVENT',
      ].join('\r\n'),
    );
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AVE Taller//Reservas//ES', 'CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE', `TZID:${TZ}`, 'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:-0600', 'TZOFFSETTO:-0600', 'TZNAME:CST', 'END:STANDARD', 'END:VTIMEZONE',
    ...eventos, 'END:VCALENDAR',
  ].join('\r\n') + '\r\n';
}

export function descargarIcs(d: Datos, r: Reserva) {
  const blob = new Blob([generarIcs(d, r)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ave-taller-reserva.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
