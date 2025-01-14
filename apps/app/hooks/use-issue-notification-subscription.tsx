import { useCallback } from "react";

import useSWR from "swr";

// hooks
import useUserAuth from "hooks/use-user-auth";
// services
import userNotificationServices from "services/notifications.service";

const useUserIssueNotificationSubscription = (
  workspaceSlug?: string | string[] | null,
  projectId?: string | string[] | null,
  issueId?: string | string[] | null
) => {
  const { user } = useUserAuth();

  const { data, error, mutate } = useSWR(
    workspaceSlug && projectId && issueId
      ? `SUBSCRIPTION_STATUE_${workspaceSlug}_${projectId}_${issueId}`
      : null,
    workspaceSlug && projectId && issueId
      ? () =>
          userNotificationServices.getIssueNotificationSubscriptionStatus(
            workspaceSlug.toString(),
            projectId.toString(),
            issueId.toString()
          )
      : null
  );

  const handleUnsubscribe = useCallback(() => {
    if (!workspaceSlug || !projectId || !issueId) return;

    userNotificationServices
      .unsubscribeFromIssueNotifications(
        workspaceSlug as string,
        projectId as string,
        issueId as string
      )
      .then(() => {
        mutate({
          subscribed: false,
        });
      });
  }, [workspaceSlug, projectId, issueId, mutate]);

  const handleSubscribe = useCallback(() => {
    console.log(workspaceSlug, projectId, issueId, user);

    if (!workspaceSlug || !projectId || !issueId || !user) return;

    userNotificationServices
      .subscribeToIssueNotifications(
        workspaceSlug as string,
        projectId as string,
        issueId as string,
        {
          subscriber: user.id,
        }
      )
      .then(() => {
        mutate({
          subscribed: true,
        });
      });
  }, [workspaceSlug, projectId, issueId, mutate, user]);

  return {
    loading: !data && !error,
    subscribed: data?.subscribed,
    handleSubscribe,
    handleUnsubscribe,
  } as const;
};

export default useUserIssueNotificationSubscription;
