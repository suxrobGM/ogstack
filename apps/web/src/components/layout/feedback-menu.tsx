"use client";

import { useState, type MouseEvent, type ReactElement } from "react";
import BugReportIcon from "@mui/icons-material/BugReport";
import FeedbackIcon from "@mui/icons-material/Feedback";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import {
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { radii } from "@/theme/tokens";

const GITHUB_REPO = "https://github.com/suxrobgm/ogstack";

interface FeedbackMenuProps {
  collapsed?: boolean;
}

export function FeedbackMenu(props: FeedbackMenuProps): ReactElement {
  const { collapsed = false } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const trigger = collapsed ? (
    <Tooltip title="Feedback" placement="right" arrow>
      <IconButton
        onClick={handleOpen}
        size="small"
        sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
      >
        <FeedbackIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  ) : (
    <ListItemButton onClick={handleOpen} sx={{ borderRadius: `${radii.md}px`, px: 2, mb: 0.5 }}>
      <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>
        <FeedbackIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={<Typography variant="body2">Feedback</Typography>} />
    </ListItemButton>
  );

  return (
    <>
      {trigger}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "center", horizontal: "right" }}
        transformOrigin={{ vertical: "center", horizontal: "left" }}
      >
        <MenuItem
          component="a"
          href={`${GITHUB_REPO}/issues/new?template=bug_report.yml`}
          target="_blank"
          onClick={handleClose}
        >
          <ListItemIcon>
            <BugReportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Report a bug</ListItemText>
        </MenuItem>
        <MenuItem
          component="a"
          href={`${GITHUB_REPO}/issues/new?template=feature_request.yml`}
          target="_blank"
          onClick={handleClose}
        >
          <ListItemIcon>
            <LightbulbIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Feature request</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
