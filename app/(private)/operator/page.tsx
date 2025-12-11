import {
  getOperatorDashboardStats,
  getRecentActions,
  getRecentKYCRequests,
} from "@/app/actions/operator-mail";
import OperatorDashboardClient from "./OperatorDashboardClient";

export default async function OperatorDashboardPage() {
  const [queueStats, recentActions, recentKYCRequests] = await Promise.all([
    getOperatorDashboardStats(),
    getRecentActions(5),
    getRecentKYCRequests(5),
  ]);

  // Convert ISO strings to Date objects for client component
  const recentActionsWithDates = recentActions.map((action) => ({
    ...action,
    completedAt: action.completedAt ? new Date(action.completedAt) : null,
    startedAt: action.startedAt ? new Date(action.startedAt) : null,
    requestedAt: new Date(action.requestedAt),
  }));

  const recentKYCWithDates = recentKYCRequests.map((kyc) => ({
    ...kyc,
    submittedAt: kyc.submittedAt ? new Date(kyc.submittedAt) : null,
  }));

  return (
    <OperatorDashboardClient
      queueStats={queueStats}
      recentActions={recentActionsWithDates}
      recentKYCRequests={recentKYCWithDates}
    />
  );
}
