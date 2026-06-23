import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { nativeSelectControlClassName } from "@/components/forms/control-styles";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { updateLeadStatusAction } from "@/lib/actions/admin-actions";
import { requireAdminSession } from "@/lib/admin/admin-auth";
import { getAdminLeadDetail } from "@/lib/admin/admin-repository";
import { leadStatuses } from "@/lib/lead-submission";

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const lead = await getAdminLeadDetail(id);

  if (!lead) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-5 py-8 text-neutral-950 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Button
          asChild
          className="text-neutral-950 hover:text-neutral-700"
          size="sm"
          variant="link"
        >
          <Link href="/admin">Tilbake til admin</Link>
        </Button>
        <header className="mt-6 border-b border-neutral-300 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-600">
            Lead
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">
            {lead.name}
          </h1>
          <p className="mt-2 text-neutral-600">
            {lead.serviceType} i {lead.area}
          </p>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
          <Card className="rounded-[8px] border-neutral-300 bg-white text-neutral-950">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                Forespørsel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <Detail label="Telefon" value={lead.phone} />
                <Detail label="E-post" value={lead.email ?? "Ikke oppgitt"} />
                <Detail label="Område/by" value={lead.area} />
                <Detail label="Tjeneste" value={lead.serviceType} />
                <Detail
                  label="Boligtype"
                  value={lead.propertyType ?? "Ikke oppgitt"}
                />
                <Detail
                  label="Ønsket tidspunkt"
                  value={lead.desiredTimeframe ?? "Ikke oppgitt"}
                />
                <Detail label="Kildeside" value={lead.sourcePage} />
                <Detail label="Mottatt" value={formatDate(lead.createdAt)} />
              </dl>
              <div className="mt-6">
                <p className="text-sm font-semibold text-neutral-600">
                  Prosjektbeskrivelse
                </p>
                <p className="mt-2 whitespace-pre-wrap leading-7">
                  {lead.projectDescription}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[8px] border-neutral-300 bg-white text-neutral-950">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Status</CardTitle>
              <p className="text-sm text-neutral-600">
                Nåværende status:{" "}
                <Badge
                  className="rounded-[6px] bg-neutral-200 text-neutral-950"
                  variant="secondary"
                >
                  {lead.status}
                </Badge>
              </p>
            </CardHeader>
            <CardContent>
              <form action={updateLeadStatusAction} className="grid gap-3">
                <input name="leadId" type="hidden" value={lead.id} />
                <Field>
                  <FieldLabel htmlFor="status">Ny status</FieldLabel>
                  <NativeSelect
                    className={nativeSelectControlClassName}
                    defaultValue={lead.status}
                    id="status"
                    name="status"
                  >
                    {leadStatuses.map((status) => (
                      <NativeSelectOption key={status} value={status}>
                        {status}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </Field>
                <Button
                  className="h-11 rounded-[6px] px-4 text-sm font-semibold"
                  type="submit"
                  variant="brand"
                >
                  Oppdater status
                </Button>
              </form>

              <h3 className="mt-8 text-lg font-semibold">Historikk</h3>
              <div className="mt-4 grid gap-3">
                {lead.statusEvents.map((event) => (
                  <div
                    className="border-b border-neutral-200 pb-3 text-sm"
                    key={event.id}
                  >
                    <p className="font-medium">
                      {event.previousStatus ?? "opprettet"} → {event.newStatus}
                    </p>
                    <p className="mt-1 text-neutral-600">
                      {formatDate(event.changedAt)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-neutral-600">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
