"use client";

import { createContext, use, useState, type PropsWithChildren, type ReactElement } from "react";
import { UpgradePrompt } from "@/components/features/billing";

interface PlanLimitContextValue {
  showUpgradePrompt: (message: string) => void;
}

const PlanLimitContext = createContext<PlanLimitContextValue | null>(null);

export function PlanLimitProvider(props: PropsWithChildren): ReactElement {
  const { children } = props;
  const [message, setMessage] = useState<string | null>(null);

  const value: PlanLimitContextValue = {
    showUpgradePrompt: setMessage,
  };

  return (
    <PlanLimitContext value={value}>
      {children}
      <UpgradePrompt
        open={message !== null}
        onClose={() => setMessage(null)}
        message={message ?? ""}
      />
    </PlanLimitContext>
  );
}

export function useSubscriptionPlanLimit(): PlanLimitContextValue {
  const context = use(PlanLimitContext);
  if (!context) {
    throw new Error("useSubscriptionPlanLimit must be used within PlanLimitProvider");
  }
  return context;
}
