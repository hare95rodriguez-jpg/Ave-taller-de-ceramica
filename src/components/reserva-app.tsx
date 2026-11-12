'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  MODALIDADES, cargar, descargarIcs, dinero, fechaLarga, futuras, guardar, leer, libres, reservar,
  type Datos, type ModalidadId, type Reserva,
} from '@/lib/ceramica';

const campo =
  'w-full rounded-lg border border-ink/25 bg-white px-4 py-3 text-base text-ink placeholder:text-ink/45 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';

export function ReservaApp() {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [mod, setMod] = useState<ModalidadId>('experiencia');
  const [sel, setSel] = useState<string[]>([]);
  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [hecha, setHecha] = useState<Reserva | null>(null);

  useEffect(() => setDatos(cargar()), []);

  const m = MODALIDADES.find((x) => x.id === mod)!;
  const lista = useMemo(() => (datos ? futuras(datos) : []), [datos]);
  const conLugar = datos ? lista.filter((s) => libres(datos, s) > 0).length : 0;
  const paqueteOk = conLugar >= 3;
  const completo = sel.length === m.fechas;

  if (!datos) return <p className="px-4 py-16 text-center text-ink/60">Cargando fechas…</p>;

  if (hecha) {
    const ses = hecha.sesiones.map((id) => datos.sesiones.find((s) => s.id === id)!).filter(Boolean);
    const mm = MODALIDADES.find((x) => x.id === hecha.modalidad)!;
    return (
      <section className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <p className="text-sm font-medium uppercase tracking-widest text-glaze">Reserva confirmada</p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">¡Te esperamos, {hecha.nombre.split(' ')[0]}!</h1>
        <p className="mt-3 text-ink/75">Guardamos tu lugar. Los materiales están incluidos y el total se abona en el taller.</p>
        <div className="mt-8 border-y border-ink/20 py-2">
          <p className="py-3 font-display text-xl">{mm.nombre}</p>
          <ul className="divide-y divide-ink/10">
            {ses.map((s) => (
              <li className="flex flex-wrap items-baseline justify-between gap-2 py-3" key={s.id}>
                <span className="font-medium first-letter:uppercase">{fechaLarga(s.fecha)}</span>
                <span className="text-ink/70">{s.inicio} a {s.fin} h</span>
              </li>
            ))}
          </ul>
          <p className="flex items-baseline justify-between border-t border-ink/20 py-4 text-lg">
            <span>Total a abonar en el taller</span>
            <strong className="font-display text-3xl text-brand">{dinero(hecha.total)}</strong>
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button className="rounded-lg bg-brand px-6 py-3 font-medium text-paper hover:opacity-90" onClick={() => descargarIcs(datos, hecha)} type="button">
            Descargar .ics
          </button>
          <button
            className="rounded-lg border border-brand px-6 py-3 font-medium text-brand hover:bg-accent/30"
            onClick={() => { setHecha(null); setSel([]); setNombre(''); setContacto(''); }}
            type="button"
          >
            Hacer otra reserva
          </button>
        </div>
      </section>
    );
  }

  function elegirMod(id: ModalidadId) {
    setMod(id); setSel([]); setError(''); setAviso('');
  }
  function toggle(id: string) {
    setError('');
    if (sel.includes(id)) { setSel(sel.filter((x) => x !== id)); setAviso(''); return; }
    if (m.fechas === 1) { setSel([id]); return; }
    if (sel.length >= m.fechas) { setAviso('Ya marcaste 3 fechas. Desmarca una para cambiarla.'); return; }
    setAviso(''); setSel([...sel, id]);
  }
  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const base = leer() ?? datos!;
    const r = reservar(base, { nombre, contacto, modalidad: mod, sesiones: sel });
    if (!r.ok) { setError(r.error); setDatos(base); setSel(sel.filter((id) => { const s = base.sesiones.find((z) => z.id === id); return s && libres(base, s) > 0; })); return; }
    if (!guardar(r.datos)) { setError('No pudimos guardar la reserva en este navegador. Revisa que no esté en modo privado.'); return; }
    setDatos(r.datos); setHecha(r.reserva);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="pb-28">
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-10 sm:px-6 md:grid-cols-[1.4fr_1fr] md:pt-16">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-glaze">Miércoles por la tarde · Sábados por la mañana</p>
          <h1 className="mt-3 font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">Mete las manos en el barro.</h1>
          <p className="mt-5 max-w-xl text-lg text-ink/75">
            Un taller libre de cerámica en una casona del centro. No hace falta saber nada: elige tu modalidad, marca tus fechas y mira al instante si hay lugar. Materiales incluidos.
          </p>
        </div>
        <Vasija />
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Paso n={1} titulo="Elige tu modalidad" />
        <div className="grid gap-3 md:grid-cols-3">
          {MODALIDADES.map((x) => {
            const off = x.id === 'paquete' && !paqueteOk;
            const on = mod === x.id;
            return (
              <button
                aria-pressed={on}
                className={`rounded-xl border-2 p-5 text-left transition ${on ? 'border-brand bg-accent/40' : 'border-ink/15 bg-white'} ${off ? 'cursor-not-allowed opacity-60' : 'hover:border-brand'}`}
                disabled={off}
                key={x.id}
                onClick={() => elegirMod(x.id)}
                type="button"
              >
                <span className="block font-display text-xl">{x.nombre}</span>
                <span className="mt-1 block font-display text-3xl text-brand">{dinero(x.precio)}</span>
                <span className="mt-2 block text-sm text-ink/75">{x.texto}</span>
                {off ? <span className="mt-2 block text-sm font-medium text-brand">No disponible: quedan menos de 3 sesiones con lugar.</span> : null}
              </button>
            );
          })}
        </div>

        <Paso n={2} titulo={m.fechas === 1 ? 'Marca tu fecha' : 'Marca tus 3 fechas'} />
        {lista.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink/30 p-8 text-center text-ink/70">Por ahora no hay sesiones próximas. Vuelve pronto: el taller agrega fechas seguido.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {lista.map((s) => {
              const l = libres(datos, s);
              const lleno = l <= 0;
              const on = sel.includes(s.id);
              return (
                <li key={s.id}>
                  <button
                    aria-pressed={on}
                    className={`flex min-h-28 w-full flex-col justify-between rounded-xl border-2 p-4 text-left transition ${on ? 'border-glaze bg-glaze text-paper' : lleno ? 'border-ink/10 bg-ink/5 text-ink/45' : 'border-ink/15 bg-white hover:border-glaze'} ${lleno ? 'cursor-not-allowed' : ''}`}
                    disabled={lleno}
                    onClick={() => toggle(s.id)}
                    type="button"
                  >
                    <span className="font-display text-xl first-letter:uppercase leading-tight">{fechaLarga(s.fecha)}</span>
                    <span className="mt-2 block text-sm">{s.inicio} a {s.fin} h</span>
                    <span className={`mt-1 block text-sm font-medium ${on ? 'text-paper' : lleno ? '' : l <= 2 ? 'text-brand' : 'text-glaze'}`}>
                      {on ? '✓ Marcada' : lleno ? 'Sin lugar' : l === 1 ? 'Queda 1 lugar' : `Quedan ${l} lugares`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {aviso ? <p className="mt-3 text-sm font-medium text-brand" role="status">{aviso}</p> : null}

        <div id="datos">
          <Paso n={3} titulo="Tus datos" />
          <form className="grid max-w-xl gap-4" noValidate onSubmit={enviar}>
            <label className="grid gap-1.5 text-sm font-medium">
              Nombre
              <input autoComplete="name" className={campo} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre y apellido" value={nombre} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Correo o teléfono
              <input autoComplete="email" className={campo} onChange={(e) => setContacto(e.target.value)} placeholder="tucorreo@ejemplo.com o 55 1234 5678" value={contacto} />
            </label>
            <p className="text-sm text-ink/70">Sin pagos en línea: el total ({dinero(m.precio)}) se abona en el taller.</p>
            {error ? <p className="rounded-lg border border-brand/40 bg-brand/10 px-4 py-3 text-sm font-medium text-brand" role="alert">{error}</p> : null}
            <button className="rounded-lg bg-brand px-6 py-3.5 text-base font-medium text-paper hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50" disabled={!completo} type="submit">
              {completo ? `Reservar · ${dinero(m.precio)}` : `Marca ${m.fechas - sel.length} ${m.fechas - sel.length === 1 ? 'fecha' : 'fechas'} para reservar`}
            </button>
          </form>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/20 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/60">{m.nombre}</p>
            <p className="font-display text-xl" data-testid="contador">
              Fechas elegidas: <span className={completo ? 'text-glaze' : 'text-brand'}>{sel.length} de {m.fechas}</span>
            </p>
          </div>
          <a
            aria-disabled={!completo}
            className={`rounded-lg px-5 py-3 text-sm font-medium ${completo ? 'bg-brand text-paper' : 'pointer-events-none bg-ink/10 text-ink/40'}`}
            href="#datos"
          >
            Continuar
          </a>
        </div>
      </div>
    </div>
  );
}

function Paso({ n, titulo }: { n: number; titulo: string }) {
  return (
    <div className="mb-5 mt-12 flex items-baseline gap-3 border-t border-ink/20 pt-5">
      <span className="font-display text-2xl text-brand">{n}</span>
      <h2 className="font-display text-2xl sm:text-3xl">{titulo}</h2>
    </div>
  );
}

function Vasija() {
  return (
    <div aria-hidden className="mx-auto w-full max-w-xs rounded-t-[8rem] rounded-b-xl bg-accent p-8 md:mr-0 md:translate-y-6">
      <svg className="w-full" viewBox="0 0 200 220">
        <path d="M70 20h60v22c0 8 38 28 38 76 0 44-26 82-68 82s-68-38-68-82c0-48 38-68 38-76z" fill="#8C4A2F" />
        <path d="M44 120c30 14 82 14 112 0" fill="none" stroke="#E8C39E" strokeWidth="5" />
        <path d="M52 150c26 12 70 12 96 0" fill="none" stroke="#2F6B5E" strokeWidth="9" />
      </svg>
    </div>
  );
}
