"use client";

import { useState, type ReactElement } from "react";
import { Box, Button, Stack } from "@mui/material";
import { PLANS, type Plan } from "@ogstack/shared";
import { useRouter } from "next/navigation";
import { SelectInput } from "@/components/ui/form/select-input";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { Surface } from "@/components/ui/layout/surface";
import { useApiMutation } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import { useConfirm } from "@/providers/confirm-provider";

interface AdminUserActionsProps {
  userId: string;
  email: string;
  currentPlan: string;
  suspended: boolean;
}

export function AdminUserActions(props: AdminUserActionsProps): ReactElement {
  const { userId, email, currentPlan, suspended } = props;
  const router = useRouter();
  const confirm = useConfirm();

  const [planDraft, setPlanDraft] = useState<Plan>(currentPlan as Plan);

  const planMutation = useApiMutation(
    (plan: Plan) => client.api.admin.users({ id: userId }).plan.patch({ plan }),
    {
      successMessage: "Plan updated (comp subscription applied).",
      invalidateKeys: [queryKeys.admin.userDetail(userId), queryKeys.admin.usersAll()],
      onSuccess: () => router.refresh(),
    },
  );

  const suspendMutation = useApiMutation(
    (suspend: boolean) => client.api.admin.users({ id: userId }).suspend.post({ suspend }),
    {
      invalidateKeys: [queryKeys.admin.userDetail(userId), queryKeys.admin.usersAll()],
      successMessage: (data) => (data.suspended ? "User suspended." : "User unsuspended."),
      onSuccess: () => router.refresh(),
    },
  );

  const handleSuspendToggle = async () => {
    if (!suspended) {
      const ok = await confirm({
        title: "Suspend user",
        description: `This will block ${email} from signing in. They can be unsuspended later.`,
        confirmLabel: "Suspend",
        destructive: true,
      });
      if (!ok) return;
    }
    suspendMutation.mutate(!suspended);
  };

  return (
    <Stack spacing={2}>
      <SectionHeader
        title="Plan & Account"
        description="Change plan assigns a complimentary subscription. Suspending blocks sign-in."
      />
      <Surface padding={3}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ alignItems: "center" }}>
          <SelectInput<Plan>
            label="Plan"
            minWidth={200}
            value={planDraft}
            onChange={setPlanDraft}
            items={PLANS.map((p) => ({ value: p, label: p }))}
          />
          <Button
            variant="contained"
            disabled={planDraft === currentPlan || planMutation.isPending}
            onClick={() => planMutation.mutate(planDraft)}
          >
            {planMutation.isPending ? "Updating..." : "Change Plan"}
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            variant="outlined"
            color={suspended ? "primary" : "error"}
            disabled={suspendMutation.isPending}
            onClick={handleSuspendToggle}
          >
            {suspended ? "Unsuspend" : "Suspend"}
          </Button>
        </Stack>
      </Surface>
    </Stack>
  );
}
