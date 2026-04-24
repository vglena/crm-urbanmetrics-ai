import { useMemo } from "react";
import type { ReactNode } from "react";
import { useCrmStore } from "../chat/chat.store";
import type { Expediente } from "./expediente.types";
import { StatusBadge } from "./ExpedienteSidebar";

export function ExpedienteDetail() {
  const expedientes = useCrmStore((state) => state.expedientes);
  const selectedExpedienteClave = useCrmStore((state) => state.selectedExpedienteClave);
  const selectedExpediente = useMemo(
    () =>
      expedientes.find((expediente) => expediente.clave === selectedExpedienteClave) ??
      expedientes[0],
    [expedientes, selectedExpedienteClave]
  );

  if (!selectedExpediente) {
    return (
      <section className="flex h-full min-h-0 flex-col bg-slate-50">
        <DetailHeader title="Detalle" />
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-sm text-center">
            <p className="text-base font-semibold text-slate-950">
              Ningun expediente seleccionado
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Pide al agente que cree o busque un expediente para ver sus datos aqui.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="h-full min-h-0 overflow-y-auto bg-slate-50">
      <DetailHeader title={selectedExpediente.clave} expediente={selectedExpediente} />
      <div className="space-y-4 p-4 sm:p-6">
        <DetailSection title="Datos personales">
          <Field label="Nombre" value={selectedExpediente.nombre} />
          <Field label="Apellido" value={selectedExpediente.apellido} />
          <Field label="Telefono" value={selectedExpediente.telefono} />
          <Field label="Email" value={selectedExpediente.email} />
        </DetailSection>

        <DetailSection title="Datos del inmueble">
          <Field label="Direccion" value={selectedExpediente.direccion} />
          <Field label="Municipio" value={selectedExpediente.municipio} />
          <Field label="Codigo postal" value={selectedExpediente.codigoPostal} />
          <Field label="Inmueble" value={selectedExpediente.inmueble} />
          <Field label="Superficie" value={formatNumber(selectedExpediente.superficie, "m2")} />
          <Field label="Habitaciones" value={formatNumber(selectedExpediente.habitaciones)} />
          <Field label="Finalidad" value={selectedExpediente.finalidad} />
          <Field label="Fecha entrada" value={selectedExpediente.fechaEntrada} />
        </DetailSection>
      </div>
    </section>
  );
}

function DetailHeader({
  title,
  expediente
}: {
  title: string;
  expediente?: Expediente;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-mutedLine bg-slate-50/95 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Expediente
          </p>
          <h2 className="mt-1 truncate text-lg font-semibold text-slate-950">{title}</h2>
        </div>
        {expediente ? <StatusBadge estado={expediente.estado} /> : null}
      </div>
      {expediente ? (
        <button
          type="button"
          className="mt-4 h-10 rounded-md border border-mutedLine bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100"
        >
          Editar
        </button>
      ) : null}
    </header>
  );
}

function DetailSection({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-mutedLine bg-white shadow-sm">
      <h3 className="border-b border-mutedLine px-4 py-3 text-sm font-semibold text-slate-950">
        {title}
      </h3>
      <dl className="divide-y divide-mutedLine">{children}</dl>
    </section>
  );
}

function Field({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 px-4 py-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words font-medium text-slate-900">
        {value === undefined || value === "" ? "Pendiente" : value}
      </dd>
    </div>
  );
}

function formatNumber(value?: number, suffix?: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return suffix ? `${value} ${suffix}` : String(value);
}
