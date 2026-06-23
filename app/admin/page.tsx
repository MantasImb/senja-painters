import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdminSession } from "@/lib/admin/admin-auth";
import {
  getAdminAnalyticsSummary,
  getAdminLeads,
} from "@/lib/admin/admin-repository";
import { leadStatuses, type LeadStatus } from "@/lib/lead-submission";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; timeframe?: string }>;
}) {
  await requireAdminSession();
  const query = await searchParams;
  const selectedStatus = parseStatus(query.status);
  const timeframe = query.timeframe === "30d" || query.timeframe === "all"
    ? query.timeframe
    : "7d";
  const [leads, analytics] = await Promise.all([
    getAdminLeads(selectedStatus),
    getAdminAnalyticsSummary(timeframe),
  ]);

  return (
    <main className="min-h-screen bg-neutral-100 px-5 py-8 text-neutral-950 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-neutral-300 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-600">
              Senja Malere
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-normal">
              Admin
            </h1>
          </div>
          <Button
            asChild
            className="h-11 rounded-[6px] px-4 text-sm font-semibold"
            variant="brand"
          >
            <Link href="/no">Åpne nettsiden</Link>
          </Button>
        </header>

        <section className="grid gap-4 py-8 md:grid-cols-3 xl:grid-cols-6">
          <Metric label="Besøkende" value={analytics.totalUniqueVisitors} />
          <Metric label="Besøk" value={analytics.totalSessions} />
          <Metric label="Sidevisninger" value={analytics.totalPageViews} />
          <Metric label="Leads" value={analytics.totalLeads} />
          <Metric
            label="Konvertering per besøk"
            value={`${analytics.conversionRate.toFixed(2)}%`}
          />
          <Metric
            label="Spam / blokkert"
            value={`${analytics.honeypotSubmissionCount} / ${analytics.rateLimitedSubmissionCount}`}
          />
        </section>
        <p className="-mt-4 mb-6 max-w-3xl text-sm leading-6 text-neutral-600">
          Analytics er beste estimat fra klientstyrte hendelser. Tall for
          besøkende og besøk kan påvirkes av nettleserlagring, blokkeringer og
          manuelt konstruerte forespørsler.
        </p>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="mr-2 text-sm font-semibold text-neutral-600">
            Periode
          </span>
          <FilterLink
            active={timeframe === "7d"}
            href="/admin?timeframe=7d"
            label="7 dager"
          />
          <FilterLink
            active={timeframe === "30d"}
            href="/admin?timeframe=30d"
            label="30 dager"
          />
          <FilterLink
            active={timeframe === "all"}
            href="/admin?timeframe=all"
            label="Alle"
          />
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <AnalyticsList
            emptyLabel="Ingen besøk ennå."
            items={analytics.landingPagesBySession.map((item) => ({
              label: item.landingPage,
              value: item.count,
            }))}
            title="Landingssider per besøk"
          />
          <AnalyticsList
            emptyLabel="Ingen sidevisninger ennå."
            items={analytics.viewsByPage.map((item) => ({
              label: item.page,
              value: item.count,
            }))}
            title="Visninger per side"
          />
          <AnalyticsList
            emptyLabel="Ingen leads ennå."
            items={analytics.leadsByLandingPage.map((item) => ({
              label: item.landingPage,
              value: item.count,
            }))}
            title="Leads per landingsside"
          />
          <AnalyticsList
            emptyLabel="Ingen leads ennå."
            items={analytics.leadsBySourcePage.map((item) => ({
              label: item.sourcePage,
              value: item.count,
            }))}
            title="Leads per kildeside"
          />
        </section>

        <Card className="mt-8 rounded-[8px] border-neutral-300 bg-white text-neutral-950">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold">Leads</CardTitle>
              <p className="mt-1 text-sm text-neutral-600">
                Nyeste forespørsler vises først.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterLink active={!selectedStatus} href="/admin" label="Alle" />
              {leadStatuses.map((status) => (
                <FilterLink
                  active={selectedStatus === status}
                  href={`/admin?status=${status}`}
                  key={status}
                  label={status}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="px-0 pt-5">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-neutral-700">Dato</TableHead>
                  <TableHead className="text-neutral-700">Navn</TableHead>
                  <TableHead className="text-neutral-700">Område</TableHead>
                  <TableHead className="text-neutral-700">Tjeneste</TableHead>
                  <TableHead className="text-neutral-700">Status</TableHead>
                  <TableHead className="text-neutral-700">Kilde</TableHead>
                  <TableHead className="text-neutral-700">Detalj</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{formatDate(lead.createdAt)}</TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.area}</TableCell>
                    <TableCell>{lead.serviceType}</TableCell>
                    <TableCell>
                      <Badge
                        className="rounded-[6px] bg-neutral-200 text-neutral-950"
                        variant="secondary"
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.sourcePage}</TableCell>
                    <TableCell>
                      <Button
                        asChild
                        className="text-neutral-950 hover:text-neutral-700"
                        size="sm"
                        variant="link"
                      >
                        <Link href={`/admin/leads/${lead.id}`}>Åpne</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {leads.length === 0 ? (
              <p className="px-5 py-8 text-sm text-neutral-600">
                Ingen leads i dette filteret.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="mt-8 rounded-[8px] border-neutral-300 bg-white text-neutral-950">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Siste hendelser
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {analytics.recentEvents.map((event) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3 text-sm"
                key={event.id}
              >
                <Badge
                  className="rounded-[6px] border-neutral-300 text-neutral-950"
                  variant="outline"
                >
                  {event.name}
                </Badge>
                <span className="text-neutral-600">{event.page ?? "intern"}</span>
                <span className="text-neutral-500">
                  {formatDate(event.createdAt)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="rounded-[8px] border-neutral-300 bg-white text-neutral-950">
      <CardContent>
        <p className="text-sm font-medium text-neutral-600">{label}</p>
        <p className="mt-2 text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function AnalyticsList({
  emptyLabel,
  items,
  title,
}: {
  emptyLabel: string;
  items: { label: string; value: number }[];
  title: string;
}) {
  return (
    <Card className="rounded-[8px] border-neutral-300 bg-white text-neutral-950">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {items.map((item) => (
          <div className="flex justify-between gap-4 text-sm" key={item.label}>
            <span>{item.label}</span>
            <span className="font-semibold">{item.value}</span>
          </div>
        ))}
        {items.length === 0 ? (
          <p className="text-sm text-neutral-600">{emptyLabel}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function FilterLink({
  active,
  href,
  label,
}: {
  active: boolean;
  href: string;
  label: string;
}) {
  return (
    <Button
      asChild
      className={
        active
          ? "h-9 rounded-[6px] bg-neutral-950 px-3 text-sm font-semibold text-white hover:bg-neutral-700 hover:text-white"
          : "h-9 rounded-[6px] border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-950 hover:bg-neutral-200 hover:text-neutral-950"
      }
      variant={active ? "brand" : "outline"}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
}

function parseStatus(status: string | undefined) {
  return leadStatuses.includes(status as LeadStatus)
    ? (status as LeadStatus)
    : undefined;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
