import type { ReactElement } from "react";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import GroupsIcon from "@mui/icons-material/Groups";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import PaymentIcon from "@mui/icons-material/Payment";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import VerifiedIcon from "@mui/icons-material/Verified";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

export const NAV_ICON_MAP: Record<string, ReactElement> = {
  dashboard: <DashboardIcon fontSize="small" />,
  folder: <FolderIcon fontSize="small" />,
  playCircle: <PlayCircleIcon fontSize="small" />,
  library: <LibraryBooksIcon fontSize="small" />,
  photoLibrary: <PhotoLibraryIcon fontSize="small" />,
  verified: <VerifiedIcon fontSize="small" />,
  vpnKey: <VpnKeyIcon fontSize="small" />,
  payment: <PaymentIcon fontSize="small" />,
  settings: <SettingsIcon fontSize="small" />,
  groups: <GroupsIcon fontSize="small" />,
  adminPanel: <AdminPanelSettingsIcon fontSize="small" />,
};
