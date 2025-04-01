import { getAggregateUserOpUsage, getUserOpUsage } from "@/api/analytics";
import { getProject } from "@/api/projects";
import { getTeamBySlug } from "@/api/team";
import { getThirdwebClient } from "@/constants/thirdweb.server";
import {
  type Range,
  getLastNDaysRange,
} from "components/analytics/date-range-selector";
import { AccountAbstractionAnalytics } from "components/smart-wallets/AccountAbstractionAnalytics";
import { notFound, redirect } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { getAuthToken } from "../../../../../api/lib/getAuthToken";
import { searchParamLoader } from "./search-params";

interface PageParams {
  team_slug: string;
  project_slug: string;
}

export default async function Page(props: {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
  children: React.ReactNode;
}) {
  const [params, searchParams, authToken] = await Promise.all([
    props.params,
    searchParamLoader(props.searchParams),
    getAuthToken(),
  ]);

  if (!authToken) {
    notFound();
  }

  const [team, project] = await Promise.all([
    getTeamBySlug(params.team_slug),
    getProject(params.team_slug, params.project_slug),
  ]);

  if (!team) {
    redirect("/team");
  }

  if (!project) {
    redirect(`/team/${params.team_slug}`);
  }

  const interval = searchParams.interval ?? "week";
  const rangeType = searchParams.range || "last-120";

  const range: Range = {
    from:
      rangeType === "custom"
        ? searchParams.from
        : getLastNDaysRange(rangeType).from,
    to:
      rangeType === "custom"
        ? searchParams.to
        : getLastNDaysRange(rangeType).to,
    type: rangeType,
  };

  const userOpStatsPromise = getUserOpUsage({
    teamId: project.teamId,
    projectId: project.id,
    from: range.from,
    to: range.to,
    period: interval,
  });

  const aggregateUserOpStatsPromise = getAggregateUserOpUsage({
    teamId: team.id,
    projectId: project.id,
  });

  const [userOpStats, aggregateUserOpStats] = await Promise.all([
    userOpStatsPromise,
    aggregateUserOpStatsPromise,
  ]);

  return (
    <AccountAbstractionAnalytics
      userOpStats={userOpStats}
      client={getThirdwebClient(authToken)}
      teamId={project.teamId}
      projectId={project.id}
      teamSlug={params.team_slug}
      aggregateUserOpStats={aggregateUserOpStats}
    />
  );
}
