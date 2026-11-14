'use client';

import { useEffect, useState } from 'react';

import { CLAVE_ACCESO, CODIGO_PANEL } from '@/lib/acceso';
import {
  MODALIDADES, cargar, crearSesion, diaSemana, dinero, esFutura, fechaLarga, guardar, hoyMx, inicioMs, libres, semilla,
  type Datos, type Sesion,
} from '@/lib/ceramica';

const campo = 'rounded-lg border border-ink/25 bg-white px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';

function PanelContenido() {
  const [d, setD] = useState<Datos | null>(null);
  const [pasadas, setPasadas] = useState(false);
  const [fecha, setFecha] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);

  useEffect(() => setD(cargar()), []);
  if (!d) return <p className="px-4 py-16 text-center text-ink/60">Cargando panel…</p>;

  const hoy = hoyMx();
  const orden = [...d.sesiones].sort((a, b) => inicioMs(a) - inicioMs(b));
  const hoySes = orden.filter((s) => s.fecha === hoy);
  const lista = pasadas ? orden.filter((s) => !esFutura(s)).reverse() : orden.filter(esFutura);
  const asist = (s: Sesion) => d.reservas.filter((r) => r.estado === 'activa' && r.sesiones.includes(s.id));
  const nombreMod = (id: string) => MODALIDADES.find((x) => x.id === id)!.nombre;

  function aplicar(n: Datos, t: string) {
    if (!guardar(n)) { setMsg({ ok: false, t: 'No se pudo guardar en este navegador.' }); return; }
    setD(n); setMsg({ ok: true, t });
  }
  function anular(id: string) {
    const r = d!.reservas.find((x) => x.id === id);
    if (!r || !confirm(`¿Anular la reserva de ${r.nombre}? Se libera su lugar en ${r.sesiones.length === 1 ? 'la sesión' : 'sus 3 sesiones'}.`)) return;
    aplicar({ ...d!, reservas: d!.reservas.map((x) => (x.id === id ? { ...x, estado: 'anulada' as const } : x)) }, 'Reserva anulada y lugares liberados.');
  }
  function agregar(e: React.FormEvent) {
    e.preventDefault();
    if (!fecha) return setMsg({ ok: false, t: 'Elige una fecha.' });
    const dw = diaSemana(fecha);
    if (dw !== 3 && dw !== 6) return setMsg({ ok: false, t: 'Solo se pueden agregar miércoles o sábados.' });
    if (d!.sesiones.some((s) => s.fecha === fecha)) return setMsg({ ok: false, t: 'Esa fecha ya existe.' });
    const s = crearSesion(fecha);
    if (!esFutura(s)) return setMsg({ ok: false, t: 'Elige una fecha futura.' });
    aplicar({ ...d!, sesiones: [...d!.sesiones, s] }, `Sesión agregada: ${fechaLarga(fecha)}, ${s.inicio} a ${s.fin} h, 8 lugares.`);
    setFecha('');
  }
  function restablecer() {
    if (!confirm('¿Restablecer los datos de ejemplo? Se pierden las reservas y sesiones actuales.')) return;
    aplicar(semilla(), 'Datos de ejemplo restablecidos desde hoy.');
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-sm font-medium uppercase tracking-widest text-glaze">Solo para el equipo</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">Panel del taller</h1>
      {msg ? <p className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${msg.ok ? 'bg-glaze/15 text-glaze' : 'bg-brand/10 text-brand'}`} role="status">{msg.t}</p> : null}

      <Seccion titulo="Quién viene hoy">
        {hoySes.length === 0 ? (
          <Vacio t="Hoy el taller no abre. Abre los miércoles de 16:00 a 19:00 y los sábados de 10:30 a 13:30." />
        ) : (
          hoySes.map((s) => <Sesion key={s.id} s={s} d={d} a={asist(s)} nombreMod={nombreMod} anular={anular} />)
        )}
      </Seccion>

      <Seccion titulo="Sesiones">
        <div className="mb-4 flex gap-2" role="tablist">
          {[['Próximas', false], ['Pasadas', true]].map(([t, v]) => (
            <button
              className={`rounded-full border px-4 py-2 text-sm font-medium ${pasadas === v ? 'border-brand bg-brand text-paper' : 'border-ink/25'}`}
              key={String(t)}
              onClick={() => setPasadas(v as boolean)}
              type="button"
            >
              {t as string}
            </button>
          ))}
        </div>
        {lista.length === 0 ? <Vacio t={pasadas ? 'Aún no hay sesiones pasadas.' : 'No hay sesiones próximas. Agrega una abajo.'} /> : lista.map((s) => <Sesion key={s.id} s={s} d={d} a={asist(s)} nombreMod={nombreMod} anular={anular} />)}
      </Seccion>

      <Seccion titulo="Agregar sesión">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={agregar}>
          <label className="grid gap-1.5 text-sm font-medium">
            Fecha (miércoles o sábado)
            <input className={campo} min={hoy} onChange={(e) => setFecha(e.target.value)} type="date" value={fecha} />
          </label>
          <button className="rounded-lg bg-brand px-6 py-3 font-medium text-paper hover:opacity-90" type="submit">Agregar sesión</button>
        </form>
        <p className="mt-2 text-sm text-ink/70">Miércoles 16:00 a 19:00 h, sábados 10:30 a 13:30 h, con 8 lugares. Horario de México.</p>
      </Seccion>

      <Seccion titulo="Datos de ejemplo">
        <button className="rounded-lg border border-brand px-5 py-3 font-medium text-brand hover:bg-accent/30" onClick={restablecer} type="button">
          Restablecer datos de ejemplo
        </button>
      </Seccion>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 border-t border-ink/20 pt-5">
      <h2 className="mb-5 font-display text-2xl sm:text-3xl">{titulo}</h2>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}
function Vacio({ t }: { t: string }) {
  return <p className="rounded-xl border border-dashed border-ink/30 p-6 text-center text-ink/70">{t}</p>;
}

function Sesion({ s, d, a, nombreMod, anular }: { s: Sesion; d: Datos; a: Datos['reservas']; nombreMod: (id: string) => string; anular: (id: string) => void }) {
  const l = libres(d, s);
  return (
    <article className="rounded-xl border border-ink/15 bg-white p-4 sm:p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-xl first-letter:uppercase">{fechaLarga(s.fecha)} · {s.inicio} a {s.fin} h</h3>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${l === 0 ? 'bg-brand/15 text-brand' : 'bg-glaze/15 text-glaze'}`}>
          {s.cupo - l} de {s.cupo} · {l === 0 ? 'Sin lugar' : `${l} libres`}
        </span>
      </header>
      {a.length === 0 ? (
        <p className="mt-3 text-sm text-ink/60">Sin asistentes.</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink/10">
          {a.map((r) => (
            <li className="flex flex-wrap items-center justify-between gap-2 py-3" key={r.id}>
              <div>
                <p className="font-medium">{r.nombre}</p>
                <p className="text-sm text-ink/70">{r.contacto} · {nombreMod(r.modalidad)} · {dinero(r.total)}</p>
                {r.primeraVez !== undefined ? <p className="text-sm text-ink/70">Primera vez en cerámica: {r.primeraVez ? 'Sí' : 'No'}</p> : null}
                {r.comentario ? <p className="text-sm italic text-ink/70">«{r.comentario}»</p> : null}
              </div>
              <button className="rounded-lg border border-brand px-3 py-2 text-sm font-medium text-brand hover:bg-accent/30" onClick={() => anular(r.id)} type="button">
                Anular reserva
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function PanelApp() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    try { setOk(sessionStorage.getItem(CLAVE_ACCESO) === '1'); } catch { setOk(false); }
  }, []);

  function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (codigo.trim() !== CODIGO_PANEL) { setError(true); return; }
    try { sessionStorage.setItem(CLAVE_ACCESO, '1'); } catch {}
    setOk(true);
  }
  function salir() {
    try { sessionStorage.removeItem(CLAVE_ACCESO); } catch {}
    setOk(false); setCodigo('');
  }

  if (ok === null) return <p className="px-4 py-16 text-center text-ink/60">Cargando…</p>;
  if (!ok) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <p className="text-sm font-medium uppercase tracking-widest text-glaze">Solo para el equipo</p>
        <h1 className="mt-2 font-display text-4xl">Panel del taller</h1>
        <form className="mt-6 grid gap-3" onSubmit={entrar}>
          <label className="grid gap-1.5 text-sm font-medium">
            Código de acceso
            <input autoComplete="off" className={campo} onChange={(e) => { setCodigo(e.target.value); setError(false); }} type="password" value={codigo} />
          </label>
          {error ? <p className="text-sm font-medium text-brand" role="alert">El código no es correcto.</p> : null}
          <button className="rounded-lg bg-brand px-6 py-3 font-medium text-paper hover:opacity-90" type="submit">Entrar</button>
        </form>
      </div>
    );
  }
  return (
    <>
      <div className="mx-auto flex max-w-5xl justify-end px-4 pt-4 sm:px-6">
        <button className="text-sm font-medium text-brand underline" onClick={salir} type="button">Cerrar el panel</button>
      </div>
      <PanelContenido />
    </>
  );
}
