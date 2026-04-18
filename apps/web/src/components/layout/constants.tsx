import type { ReactElement } from "react";
import BarChartIcon from "@mui/icons-material/BarChart";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import GroupsIcon from "@mui/icons-material/Groups";
import HandymanIcon from "@mui/icons-material/Handyman";
import ImageIcon from "@mui/icons-material/Image";
import LandscapeIcon from "@mui/icons-material/Landscape";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import PaymentIcon from "@mui/icons-material/Payment";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import StarsIcon from "@mui/icons-material/Stars";
import VerifiedIcon from "@mui/icons-material/Verified";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { ROUTES } from "@/lib/constants";

export interface NavLeaf {
  label: string;
  href: string;
  icon: ReactElement;
}

export interface NavGroup {
  label: string;
  icon: ReactElement;
  children: readonly NavLeaf[];
}

export type NavEntry = NavLeaf | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

const iconProps = { fontSize: "small" } as const;

export const SIDEBAR_NAV_ITEMS: readonly NavEntry[] = [
  { label: "Overview", href: ROUTES.overview, icon: <DashboardIcon {...iconProps} /> },
  { label: "Analytics", href: ROUTES.analytics, icon: <BarChartIcon {...iconProps} /> },
  { label: "Projects", href: ROUTES.projects, icon: <FolderIcon {...iconProps} /> },
  { label: "Playground", href: ROUTES.playground, icon: <PlayCircleIcon {...iconProps} /> },
  {
    label: "Tools",
    icon: <HandymanIcon {...iconProps} />,
    children: [
      {
        label: "OG Images",
        href: `${ROUTES.playground}?kind=og` as typeof ROUTES.playground,
        icon: <ImageIcon {...iconProps} />,
      },
      {
        label: "Blog Heroes",
        href: `${ROUTES.playground}?kind=blog_hero` as typeof ROUTES.playground,
        icon: <LandscapeIcon {...iconProps} />,
      },
      {
        label: "Favicons",
        href: `${ROUTES.playground}?kind=icon_set` as typeof ROUTES.playground,
        icon: <StarsIcon {...iconProps} />,
      },
      { label: "Audits", href: ROUTES.audits, icon: <VerifiedIcon {...iconProps} /> },
    ],
  },
  {
    label: "Library",
    icon: <LibraryBooksIcon {...iconProps} />,
    children: [
      { label: "Gallery", href: ROUTES.images, icon: <PhotoLibraryIcon {...iconProps} /> },
      { label: "Templates", href: ROUTES.templates, icon: <LibraryBooksIcon {...iconProps} /> },
    ],
  },
  {
    label: "Account",
    icon: <SettingsIcon {...iconProps} />,
    children: [
      { label: "API Keys", href: ROUTES.apiKeys, icon: <VpnKeyIcon {...iconProps} /> },
      { label: "Billing", href: ROUTES.billing, icon: <PaymentIcon {...iconProps} /> },
      { label: "Settings", href: ROUTES.settings, icon: <SettingsIcon {...iconProps} /> },
    ],
  },
];

export const ADMIN_NAV_ITEMS: readonly NavLeaf[] = [
  { label: "Overview", href: ROUTES.adminOverview, icon: <DashboardIcon {...iconProps} /> },
  { label: "Users", href: ROUTES.adminUsers, icon: <GroupsIcon {...iconProps} /> },
  { label: "Images", href: ROUTES.adminImages, icon: <PhotoLibraryIcon {...iconProps} /> },
];
