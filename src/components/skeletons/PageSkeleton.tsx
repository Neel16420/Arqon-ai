import { OverviewSkeleton } from "./OverviewSkeleton"
import { ProvidersSkeleton } from "./ProvidersSkeleton"
import { ModelsSkeleton } from "./ModelsSkeleton"
import { TablePageSkeleton } from "./TablePageSkeleton"
import { RoutingSkeleton } from "./RoutingSkeleton"
import { AnalyticsSkeleton } from "./AnalyticsSkeleton"
import { PlaygroundSkeleton } from "./PlaygroundSkeleton"
import { SettingsSkeleton } from "./SettingsSkeleton"
import { ComingSoonSkeleton } from "./ComingSoonSkeleton"
import { TeamSkeleton } from "./TeamSkeleton"

export function PageSkeleton({ activePage }: { activePage: string }) {
  switch (activePage) {
    case "overview":
      return <OverviewSkeleton />
    case "providers":
      return <ProvidersSkeleton />
    case "models":
      return <ModelsSkeleton />
    case "routing":
      return <RoutingSkeleton />
    case "analytics":
      return <AnalyticsSkeleton />
    case "playground":
      return <PlaygroundSkeleton />
    case "settings":
      return <SettingsSkeleton />
    case "requests":
    case "logs":
      return <TablePageSkeleton hasStats={true} />
    case "api-keys":
      return <TablePageSkeleton hasStats={false} />
    case "team":
      return <TeamSkeleton />
    case "roles":
    case "limits":
    case "audit-logs":
    case "timeline":
      return <TablePageSkeleton hasStats={true} />
    default:
      return <ComingSoonSkeleton />
  }
}
