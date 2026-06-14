import { loginAdminAction } from "@/lib/actions/admin-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { inputControlClassName } from "@/components/forms/control-styles";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-5 py-12 text-neutral-950">
      <Card className="w-full max-w-sm rounded-[8px] border-neutral-300 bg-white shadow-xl shadow-black/10">
        <form action={loginAdminAction} noValidate>
          <CardHeader>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-600">
              Admin
            </p>
            <CardTitle className="text-2xl font-semibold">Logg inn</CardTitle>
          </CardHeader>
          <CardContent>
            {query.error ? (
              <Alert
                className="mb-5 rounded-[6px] border-red-200 bg-red-50 text-red-950 [&_[data-slot=alert-description]]:text-red-950"
                variant="destructive"
              >
                <AlertDescription>Feil passord.</AlertDescription>
              </Alert>
            ) : null}
            <Field>
              <FieldLabel htmlFor="password">Passord</FieldLabel>
              <Input
                autoComplete="current-password"
                className={inputControlClassName}
                id="password"
                name="password"
                required
                type="password"
              />
            </Field>
            <Button
              className="mt-5 h-12 w-full rounded-[6px] px-5 text-sm font-semibold"
              size="lg"
              type="submit"
              variant="brand"
            >
              Logg inn
            </Button>
          </CardContent>
        </form>
      </Card>
    </main>
  );
}
