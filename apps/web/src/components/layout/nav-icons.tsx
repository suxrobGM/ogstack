import type { ReactElement } from "react";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
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

export const NAV_ICON_MAP: Record<string, ReactElement> = {
  dashboard: <DashboardIcon fontSize="small" />,
  barChart: <BarChartIcon fontSize="small" />,
  folder: <FolderIcon fontSize="small" />,
  playCircle: <PlayCircleIcon fontSize="small" />,
  library: <LibraryBooksIcon fontSize="small" />,
  photoLibrary: <PhotoLibraryIcon fontSize="small" />,
  image: <ImageIcon fontSize="small" />,
  landscape: <LandscapeIcon fontSize="small" />,
  stars: <StarsIcon fontSize="small" />,
  verified: <VerifiedIcon fontSize="small" />,
  vpnKey: <VpnKeyIcon fontSize="small" />,
  payment: <PaymentIcon fontSize="small" />,
  settings: <SettingsIcon fontSize="small" />,
  groups: <GroupsIcon fontSize="small" />,
  tools: <HandymanIcon fontSize="small" />,
  adminPanel: <AdminPanelSettingsIcon fontSize="small" />,
};
