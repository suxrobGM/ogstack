"use client";

import type { ReactElement } from "react";
import { Autocomplete, Box, Chip, Link as MuiLink, TextField, Typography } from "@mui/material";
import { isValidDomain, Plan, PLAN_CONFIGS, UNLIMITED } from "@ogstack/shared";
import type { AnyFieldApi } from "@tanstack/react-form";
import NextLink from "next/link";
import { ROUTES } from "@/lib/constants";
import { useAuth } from "@/providers/auth-provider";
import type { AnyReactForm } from "./types";

interface FormDomainFieldProps {
  form: AnyReactForm;
  name: string;
  label?: string;
  placeholder?: string;
  /** Show the "X / cap on Plan" counter and upgrade CTA. Default: true. */
  showPlanCap?: boolean;
  /** Default helper text shown when there's no error. */
  helperText?: string;
}

/**
 * Chip-based input for project allowed-domain lists.
 * Validates each entry with `isValidDomain`, splits pasted comma/space input
 * into separate chips, de-duplicates and lowercases, and surfaces the user's
 * per-plan domain cap with an inline upgrade link.
 */
export function FormDomainField(props: FormDomainFieldProps): ReactElement {
  const {
    form,
    name,
    label = "Allowed Domains",
    placeholder = "example.com",
    showPlanCap = true,
    helperText,
  } = props;

  const { user } = useAuth();
  const plan = user?.plan ?? Plan.FREE;
  const planConfig = PLAN_CONFIGS[plan];
  const cap = planConfig.domainsPerProject;
  const isUnlimited = cap === UNLIMITED;

  const defaultHelper =
    helperText ??
    "Optional. Leave empty to serve OG images for any URL. Add domains to restrict the public endpoint to those hosts.";

  const normalizeAutoCompleteValues = (field: AnyFieldApi, next: string[]) => {
    const normalized = Array.from(
      new Set(
        next
          .flatMap((d) => d.split(/[,\s]+/))
          .map((d) => d.trim().toLowerCase())
          .filter(Boolean),
      ),
    );
    field.handleChange(normalized);
  };

  return (
    <form.Field name={name}>
      {(field: AnyFieldApi) => {
        const value = (field.state.value as string[]) ?? [];
        const overCap = !isUnlimited && value.length > cap;
        const atCap = !isUnlimited && value.length >= cap;
        const invalidEntries = value.filter((d) => !isValidDomain(d));
        const submitError = field.state.meta.errors[0]?.message as string | undefined;

        const resolvedHelper = overCap
          ? `Your ${planConfig.name} plan allows up to ${cap} domain${cap === 1 ? "" : "s"} per project.`
          : invalidEntries.length > 0
            ? `Not a valid domain: ${invalidEntries.join(", ")}`
            : (submitError ?? defaultHelper);

        return (
          <Box>
            <Autocomplete
              multiple
              freeSolo
              autoSelect
              options={[]}
              value={value}
              onChange={(_, next) => normalizeAutoCompleteValues(field, next)}
              onBlur={field.handleBlur}
              renderValue={(tags, getItemProps) =>
                tags.map((tag, idx) => {
                  const { key, ...itemProps } = getItemProps({ index: idx });
                  const invalid = !isValidDomain(tag);

                  return (
                    <Chip
                      key={key}
                      {...itemProps}
                      label={tag}
                      size="small"
                      color={invalid ? "error" : "default"}
                      variant={invalid ? "outlined" : "filled"}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={label}
                  placeholder={value.length === 0 ? placeholder : ""}
                  error={overCap || invalidEntries.length > 0 || Boolean(submitError)}
                  helperText={resolvedHelper}
                />
              )}
            />
            {showPlanCap && (
              <Box
                sx={{
                  mt: 0.75,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography variant="captionMuted">
                  {overCap ? (
                    <MuiLink component={NextLink} href={ROUTES.billing}>
                      Upgrade for more domains →
                    </MuiLink>
                  ) : atCap ? (
                    <>
                      You&apos;ve reached your plan&apos;s limit.{" "}
                      <MuiLink component={NextLink} href={ROUTES.billing}>
                        Upgrade
                      </MuiLink>{" "}
                      for more.
                    </>
                  ) : null}
                </Typography>
                <Typography variant="captionMuted">
                  <strong>{value.length}</strong> / {isUnlimited ? "Unlimited" : cap} on{" "}
                  {planConfig.name}
                </Typography>
              </Box>
            )}
          </Box>
        );
      }}
    </form.Field>
  );
}
