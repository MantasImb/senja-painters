"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  inputControlClassName,
  nativeSelectControlClassName,
  textareaControlClassName,
} from "@/components/forms/control-styles";
import {
  readCurrentAttribution,
} from "@/lib/analytics/attribution";

export const leadFormDraftStorageKey = "senja-malere:lead-form-draft";
const legacyLeadFormDraftStorageKey = "senja-painters:lead-form-draft";

export type LeadFormValues = {
  name: string;
  phone: string;
  email: string;
  area: string;
  serviceType: string;
  propertyType: string;
  desiredTimeframe: string;
  projectDescription: string;
};

export type LeadFormState = {
  ok: boolean;
  message: string;
  leadId?: string;
  fieldErrors: Partial<Record<keyof LeadFormValues | "consent", string>>;
  values: Partial<Record<keyof LeadFormValues | string, FormDataEntryValue>>;
};

export type LeadFormAction = (
  previousState: LeadFormState,
  formData: FormData,
) => Promise<LeadFormState>;

const services = [
  "Innvendig maling",
  "Utvendig maling",
  "Møbler og detaljer",
] as const;

const propertyTypes = ["Enebolig", "Leilighet", "Hytte", "Annet"] as const;

const emptyValues: LeadFormValues = {
  name: "",
  phone: "",
  email: "",
  area: "",
  serviceType: "",
  propertyType: "",
  desiredTimeframe: "",
  projectDescription: "",
};

const initialState: LeadFormState = {
  ok: false,
  message: "",
  fieldErrors: {},
  values: {},
};

export function LeadForm({
  action,
  sourcePage,
  title,
}: {
  action: LeadFormAction;
  sourcePage: string;
  title: string;
}) {
  const visitorIdInputRef = useRef<HTMLInputElement>(null);
  const sessionIdInputRef = useRef<HTMLInputElement>(null);
  const landingPageInputRef = useRef<HTMLInputElement>(null);
  const pagesSeenInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<LeadFormValues>(() => readDraft());
  const [state, formAction, isPending] = useActionState(
    async (previousState: LeadFormState, formData: FormData) => {
      const result = await action(previousState, formData);

      if (result.ok) {
        window.localStorage.removeItem(leadFormDraftStorageKey);
        window.localStorage.removeItem(legacyLeadFormDraftStorageKey);
        setValues(emptyValues);
      }

      return result;
    },
    initialState,
  );

  useEffect(() => {
    const attribution = readCurrentAttribution(sourcePage);

    if (!attribution) {
      return;
    }

    if (visitorIdInputRef.current) {
      visitorIdInputRef.current.value = attribution.visitorId;
    }

    if (sessionIdInputRef.current) {
      sessionIdInputRef.current.value = attribution.sessionId;
    }

    if (landingPageInputRef.current) {
      landingPageInputRef.current.value = attribution.landingPage;
    }

    if (pagesSeenInputRef.current) {
      pagesSeenInputRef.current.value = attribution.pagesSeen.toString();
    }
  }, [sourcePage]);

  useEffect(() => {
    const hasDraft = Object.values(values).some((value) => value.length > 0);

    if (!hasDraft) {
      window.localStorage.removeItem(leadFormDraftStorageKey);
      return;
    }

    window.localStorage.setItem(leadFormDraftStorageKey, JSON.stringify(values));
    window.localStorage.removeItem(legacyLeadFormDraftStorageKey);
  }, [values]);

  const statusClassName = useMemo(
    () =>
      state.ok
        ? "mt-5 rounded-[6px] border-emerald-200 bg-emerald-50 text-emerald-950 [&_[data-slot=alert-description]]:text-emerald-950"
        : "mt-5 rounded-[6px] border-red-200 bg-red-50 text-red-950 [&_[data-slot=alert-description]]:text-red-950",
    [state.ok],
  );

  function updateValue(
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) {
    const { name, value } = event.currentTarget;
    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  return (
    <form
      action={formAction}
      className="rounded-[8px] border border-neutral-300 bg-white p-5 shadow-xl shadow-black/10 sm:p-6"
      noValidate
    >
      <input name="sourcePage" type="hidden" value={sourcePage} />
      <input
        name="visitorId"
        ref={visitorIdInputRef}
        type="hidden"
        defaultValue=""
      />
      <input
        name="sessionId"
        ref={sessionIdInputRef}
        type="hidden"
        defaultValue=""
      />
      <input
        name="landingPage"
        ref={landingPageInputRef}
        type="hidden"
        defaultValue={sourcePage}
      />
      <input
        name="pagesSeen"
        ref={pagesSeenInputRef}
        type="hidden"
        defaultValue="1"
      />
      <div className="sr-only" aria-hidden="true">
        <label>
          Ikke fyll ut dette feltet
          <input
            autoComplete="off"
            name="companyWebsite"
            tabIndex={-1}
            type="text"
          />
        </label>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-600">
            Forespørsel
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
        </div>
        <Badge className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
          Kontakt
        </Badge>
      </div>
      <FieldGroup className="mt-5 grid gap-4 sm:grid-cols-2">
        <TextField
          error={state.fieldErrors.name}
          label="Navn *"
          name="name"
          onChange={updateValue}
          placeholder="Ola Nordmann"
          required
          value={values.name}
        />
        <TextField
          error={state.fieldErrors.phone}
          label="Telefon *"
          name="phone"
          onChange={updateValue}
          placeholder="900 00 000"
          required
          value={values.phone}
        />
        <TextField
          error={state.fieldErrors.email}
          label="E-post"
          name="email"
          onChange={updateValue}
          placeholder="valgfritt"
          type="email"
          value={values.email}
        />
        <TextField
          error={state.fieldErrors.area}
          label="Område/by *"
          name="area"
          onChange={updateValue}
          placeholder="Finnsnes"
          required
          value={values.area}
        />
        <Field data-invalid={!!state.fieldErrors.serviceType}>
          <FieldLabel htmlFor="serviceType">Tjeneste *</FieldLabel>
          <NativeSelect
            aria-invalid={!!state.fieldErrors.serviceType}
            className={nativeSelectControlClassName}
            id="serviceType"
            name="serviceType"
            onChange={updateValue}
            required
            value={values.serviceType}
          >
            <NativeSelectOption value="">Velg tjeneste</NativeSelectOption>
            {services.map((service) => (
              <NativeSelectOption key={service} value={service}>
                {service}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{state.fieldErrors.serviceType}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="propertyType">Boligtype</FieldLabel>
          <NativeSelect
            className={nativeSelectControlClassName}
            id="propertyType"
            name="propertyType"
            onChange={updateValue}
            value={values.propertyType}
          >
            <NativeSelectOption value="">Valgfritt</NativeSelectOption>
            {propertyTypes.map((propertyType) => (
              <NativeSelectOption key={propertyType} value={propertyType}>
                {propertyType}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <TextField
          className="sm:col-span-2"
          label="Ønsket tidspunkt"
          name="desiredTimeframe"
          onChange={updateValue}
          placeholder="f.eks. våren 2027"
          value={values.desiredTimeframe}
        />
        <Field
          className="sm:col-span-2"
          data-invalid={!!state.fieldErrors.projectDescription}
        >
          <FieldLabel htmlFor="projectDescription">
            Prosjektbeskrivelse *
          </FieldLabel>
          <Textarea
            aria-invalid={!!state.fieldErrors.projectDescription}
            className={textareaControlClassName}
            id="projectDescription"
            name="projectDescription"
            onChange={updateValue}
            placeholder="Fortell kort hva som skal males, omtrent størrelse og underlag."
            required
            value={values.projectDescription}
          />
          <FieldError>{state.fieldErrors.projectDescription}</FieldError>
        </Field>
      </FieldGroup>
      <Field
        className="mt-5"
        data-invalid={!!state.fieldErrors.consent}
        orientation="horizontal"
      >
        <Checkbox
          aria-invalid={!!state.fieldErrors.consent}
          className="mt-1"
          id="consent"
          name="consent"
          required
          value="yes"
        />
        <FieldContent>
          <FieldLabel
            className="font-normal leading-6 text-neutral-600"
            htmlFor="consent"
          >
            Jeg samtykker til at Senja Malere kan kontakte meg om denne
            forespørselen. *
          </FieldLabel>
          <FieldError>{state.fieldErrors.consent}</FieldError>
        </FieldContent>
      </Field>
      {state.message ? (
        <Alert aria-live="polite" className={statusClassName}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <Button
        className="mt-5 h-12 w-full rounded-[6px] px-5 text-sm font-semibold"
        disabled={isPending}
        size="lg"
        type="submit"
        variant="brand"
      >
        {isPending ? "Sender..." : "Send forespørsel"}
      </Button>
    </form>
  );
}

function TextField({
  className = "",
  error,
  label,
  name,
  onChange,
  placeholder,
  required = false,
  type = "text",
  value,
}: {
  className?: string;
  error?: string;
  label: string;
  name: keyof LeadFormValues;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <Field className={className} data-invalid={!!error}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        aria-invalid={!!error}
        className={inputControlClassName}
        id={name}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
      <FieldError>{error}</FieldError>
    </Field>
  );
}

function readDraft(): LeadFormValues {
  if (typeof window === "undefined") {
    return emptyValues;
  }

  const rawDraft =
    window.localStorage.getItem(leadFormDraftStorageKey) ??
    window.localStorage.getItem(legacyLeadFormDraftStorageKey);

  if (!rawDraft) {
    return emptyValues;
  }

  try {
    const parsedDraft = JSON.parse(rawDraft) as Partial<LeadFormValues>;

    return {
      ...emptyValues,
      ...coerceDraftValues(parsedDraft),
    };
  } catch {
    return emptyValues;
  }
}

function coerceDraftValues(
  values: Partial<Record<keyof LeadFormValues | string, unknown>>,
): LeadFormValues {
  return {
    name: stringify(values.name),
    phone: stringify(values.phone),
    email: stringify(values.email),
    area: stringify(values.area),
    serviceType: stringify(values.serviceType),
    propertyType: stringify(values.propertyType),
    desiredTimeframe: stringify(values.desiredTimeframe),
    projectDescription: stringify(values.projectDescription),
  };
}

function stringify(value: unknown) {
  return typeof value === "string" ? value : "";
}
