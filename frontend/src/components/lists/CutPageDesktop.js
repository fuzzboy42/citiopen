import React, { useState, useEffect } from "react";
import { useDrop } from "react-dnd";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";

import RemoveCircleOutline from "@mui/icons-material/RemoveCircleOutline";
import Dangerous from "@mui/icons-material/Dangerous";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ThumbUpOutlined from "@mui/icons-material/ThumbUpOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import PersonOffOutlined from "@mui/icons-material/PersonOffOutlined";

import {
  filterBallkids,
  getAuthHeader,
  SearchAndFilter,
  ConfirmDialog,
  DraggableBallkidAndIcon,
  Alerts,
  renderSwitch,
} from "../Utils";
import { CUT_STATUSES, POSITIONS } from "../Consts";
import { cut } from "../HelpMessages";
import { ListPageShell, ListPageHeader, ListToolbarCard } from "./ListPageLayout";

// Color + icon treatment per cut status, shared by the desktop and mobile
// cut page views so both stay visually consistent.
export const CUT_STATUS_META = {
  "Definitely Keep": {
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    icon: <CheckCircleOutline fontSize="small" />,
  },
  "Possibly Keep": {
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    icon: <ThumbUpOutlined fontSize="small" />,
  },
  "Possibly Cut": {
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
    icon: <WarningAmberOutlined fontSize="small" />,
  },
  "Definitely Cut": {
    color: "#c8102e",
    bg: "#fef2f2",
    border: "#fecaca",
    icon: <Dangerous fontSize="small" />,
  },
  "Self-Cut": {
    color: "#475569",
    bg: "#f1f5f9",
    border: "#e2e8f0",
    icon: <PersonOffOutlined fontSize="small" />,
  },
};

export function getCutStatusMeta(section) {
  return CUT_STATUS_META[section] || CUT_STATUS_META["Self-Cut"];
}

export function CutStatusSection({
  section,
  active,
  showHovercard,
  setUpdated,
}) {
  const [open, setOpen] = useState(false);

  const shouldCut = section.includes("Cut") ? true : false;
  const cutAllStr = section.includes("Cut") ? "Cut All" : "Keep All";
  const meta = getCutStatusMeta(section);

  const [{ isOver }, dropRef] = useDrop({
    accept: "ballkid",
    drop: (ballkid) =>
      fetch("/api/update-ballkid", {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify({
          first_name: ballkid.first_name,
          last_name: ballkid.last_name,
          cut_status: section,
        }),
      })
        .then((response) => response.json())
        .then(() => setUpdated(true)),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  return (
    <div className="cut-status-card-wrap" ref={dropRef}>
      <ConfirmDialog
        message={`You are about to cut all ${active.length} ballkid${
          active.length > 1 ? "s" : ""
        }. This will be publicly visible to all ballkids and captains.`}
        url={"/api/cut-all"}
        body={{
          cut_status: section,
          should_cut: true,
        }}
        open={open}
        setOpen={setOpen}
        setUpdated={setUpdated}
      />

      <Card
        sx={{
          mb: 2,
          borderTop: `3px solid ${meta.color}`,
          background: isOver ? meta.bg : undefined,
        }}
        elevation={isOver ? 10 : 1}
      >
        <CardContent className="cut-card-body">
          <div className="cut-card-header">
            <div className="sxs" style={{ gap: 8, minWidth: 0 }}>
              <span
                className="cut-status-icon"
                style={{ background: meta.bg, color: meta.color }}
              >
                {meta.icon}
              </span>
              <span className="cut-card-title">{section}</span>
              <span className="cut-card-count">({active.length})</span>
            </div>
            <button
              type="button"
              className="cut-pill-btn"
              style={{ "--pill-color": meta.color }}
              onClick={(e) => {
                shouldCut
                  ? setOpen(true)
                  : fetch("/api/cut-all", {
                      method: "PATCH",
                      headers: getAuthHeader(),
                      body: JSON.stringify({
                        cut_status: section,
                        should_cut: shouldCut,
                      }),
                    })
                      .then((response) => response.json())
                      .then(() => setUpdated(true));
              }}
            >
              {cutAllStr}
            </button>
          </div>

          {POSITIONS.map((position) => (
            <div key={position}>
              <Divider sx={{ mt: 1, mb: 1 }} />
              <div className="sxs">
                <span className="cut-position-label">{position}s</span>
                <span className="cut-position-count">
                  (
                  {
                    active.filter((ballkid) =>
                      ballkid.preferred_position.startsWith(position)
                    ).length
                  }
                  )
                </span>
              </div>
              {renderBallkidsInSection(
                active.filter((ballkid) => ballkid.cut_status === section),
                section,
                position,
                showHovercard,
                setUpdated
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function renderBallkidsInSection(
  active,
  section,
  position,
  showHovercard,
  setUpdated
) {
  return (
    <div>
      {active.map((ballkid) =>
        !ballkid.preferred_position.startsWith(position) ? (
          ""
        ) : (
          <div key={`ballkid${ballkid.id}`} className="justify">
            <DraggableBallkidAndIcon
              ballkid={ballkid}
              commentTypes={
                section === "Self-Cut"
                  ? ["last_day"]
                  : ["experience", "rank", "last_day"]
              }
              showHovercard={showHovercard}
              hoverCommentTypes={["experience", "rank", "last_day"]}
            />

            <div className="sxs">
              {section === "Self-Cut" ? (
                ""
              ) : (
                <Tooltip title="Uncategorize">
                  <IconButton
                    size="small"
                    sx={{ p: 0.5 }}
                    onClick={(e) => {
                      fetch("/api/update-ballkid", {
                        method: "PATCH",
                        headers: getAuthHeader(),
                        body: JSON.stringify({
                          first_name: ballkid.first_name,
                          last_name: ballkid.last_name,
                          cut_status: "",
                        }),
                      })
                        .then((response) => response.json())
                        .then(() => setUpdated(true));
                    }}
                  >
                    <RemoveCircleOutline color="primary" />
                  </IconButton>
                </Tooltip>
              )}

              {!section.includes("Cut") ? (
                ""
              ) : (
                <Tooltip title="Cut">
                  <IconButton
                    size="small"
                    sx={{ p: 0.5 }}
                    onClick={(e) => {
                      fetch("/api/update-ballkid", {
                        method: "PATCH",
                        headers: getAuthHeader(),
                        body: JSON.stringify({
                          first_name: ballkid.first_name,
                          last_name: ballkid.last_name,
                          is_cut: true,
                          self_cut: section === "Self-Cut",
                        }),
                      })
                        .then((response) => response.json())
                        .then(() => setUpdated(true));
                    }}
                  >
                    <Dangerous color="error" />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}

function ActiveSection({ active, showHovercard, setUpdated }) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterGroup, setFilterGroup] = useState();
  const [{ isOver }, dropRef] = useDrop({
    accept: "ballkid",
    drop: (ballkid) =>
      fetch("/api/update-ballkid", {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify({
          first_name: ballkid.first_name,
          last_name: ballkid.last_name,
          cut_status: "",
        }),
      })
        .then((response) => response.json())
        .then(() => setUpdated(true)),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  return (
    <Box
      component={Paper}
      ref={dropRef}
      elevation={isOver ? 10 : 1}
      className="cut-active-panel"
      sx={{
        background: isOver ? "#eef2ff" : undefined,
      }}
    >
      <div className="cut-panel-header">
        <span className="cut-panel-title">Active Ballkids</span>
        <span className="cut-panel-count">({active.length})</span>
      </div>

      <ListToolbarCard>
        <SearchAndFilter
          useGridItem={false}
          setSearchKeyword={setSearchKeyword}
          filterGroup={filterGroup}
          setFilterGroup={setFilterGroup}
          filters={["rookie", "supervet", "captain", "back", "net"]}
        />
      </ListToolbarCard>

      {POSITIONS.map((position) => {
        const filtered = filterBallkids(
          active,
          searchKeyword,
          filterGroup
        ).filter((ballkid) => ballkid.preferred_position.startsWith(position));
        const half = Math.ceil(filtered.length / 2);

        return (
          <div key={position}>
            <div className="sxs">
              <span className="cut-position-label large">{position}s</span>
              <span className="cut-position-count">({filtered.length})</span>
            </div>

            {active.length === 0 ? (
              <p className="cut-empty-note">
                There are currently no active ballkids left to categorize.
              </p>
            ) : (
              <Grid container>
                {[filtered.slice(0, half), filtered.slice(half)].map((sliced) =>
                  sliced.length === 0 ? (
                    ""
                  ) : (
                    <Grid
                      container
                      item
                      key={sliced[0].id}
                      direction="column"
                      xs={12}
                      sm={12}
                      md={6}
                      lg={6}
                      xl={6}
                    >
                      {sliced.map((ballkid) => (
                        <Grid key={ballkid.id} item sx={{ px: 1 }}>
                          <DraggableBallkidAndIcon
                            ballkid={ballkid}
                            commentTypes={["experience", "rank", "last_day"]}
                            showHovercard={showHovercard}
                            hoverCommentTypes={[
                              "experience",
                              "rank",
                              "calibrated_avg",
                              "last_day",
                            ]}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )
                )}
              </Grid>
            )}
          </div>
        );
      })}
    </Box>
  );
}

export function renderCopyButtons(active, emails, setSuccessMsg) {
  return (
    <div className="cut-copy-actions">
      <button
        type="button"
        className="cut-pill-btn"
        style={{ "--pill-color": "var(--list-nav)" }}
        onClick={() => {
          const names = active
            .filter(
              (ballkid) =>
                ballkid.cut_status === "Definitely Keep" ||
                ballkid.cut_status === "Possibly Keep" ||
                ballkid.cut_status === ""
            )
            .map((ballkid) => `${ballkid.first_name} ${ballkid.last_name}`)
            .join("\n");
          navigator.clipboard.writeText(names);
          setSuccessMsg("Successfully copied non-cut ballkid names!");
        }}
      >
        Copy keep names
      </button>

      <button
        type="button"
        className="cut-pill-btn"
        style={{ "--pill-color": "var(--list-nav)" }}
        onClick={() => {
          navigator.clipboard.writeText(emails);
          setSuccessMsg(
            "Successfully copied all currently active, non-cut ballkid emails!"
          );
        }}
      >
        Copy keep emails
      </button>
    </div>
  );
}

export function SelfCutCard({ updated, showHovercard, setUpdated }) {
  const [selfCut, setSelfCut] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/self-cut-list", { headers: getAuthHeader() })
      .then((response) => response.json())
      .then((data) => setSelfCut(data));
  }, [updated]);

  const [{ isOver }, dropRef] = useDrop({
    accept: "ballkid",
    drop: (ballkid) =>
      fetch("/api/update-ballkid", {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify({
          first_name: ballkid.first_name,
          last_name: ballkid.last_name,
          cut_status: "Self-Cut",
        }),
      })
        .then((response) => response.json())
        .then(() => setUpdated(true)),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  return (
    <div className="cut-status-card-wrap cut-self-cut-span" ref={dropRef}>
      <ConfirmDialog
        message={`You are about to cut all ${selfCut.length} ballkid${
          selfCut.length > 1 ? "s" : ""
        }. This will be publicly visible to all ballkids and captains.`}
        url={"/api/cut-all"}
        body={{
          should_cut: true,
          self_cut: true,
        }}
        open={open}
        setOpen={setOpen}
        setUpdated={setUpdated}
      />

      <Card
        sx={{ mb: 2, borderTop: `3px solid ${getCutStatusMeta("Self-Cut").color}` }}
        elevation={isOver ? 10 : 1}
      >
        <CardContent className="cut-card-body">
          <div className="cut-card-header">
            <div className="sxs" style={{ gap: 8, minWidth: 0 }}>
              <span
                className="cut-status-icon"
                style={{
                  background: getCutStatusMeta("Self-Cut").bg,
                  color: getCutStatusMeta("Self-Cut").color,
                }}
              >
                {getCutStatusMeta("Self-Cut").icon}
              </span>
              <span className="cut-card-title">Self-Cut</span>
              <span className="cut-card-count">({selfCut.length})</span>
            </div>

            <button
              type="button"
              className="cut-pill-btn"
              style={{ "--pill-color": getCutStatusMeta("Self-Cut").color }}
              onClick={(e) => setOpen(true)}
            >
              Cut All
            </button>
          </div>

          {POSITIONS.map((position) => (
            <div key={position}>
              <Divider sx={{ mt: 1, mb: 1 }} />
              <div className="sxs">
                <span className="cut-position-label">{position}s</span>
                <span className="cut-position-count">
                  (
                  {
                    selfCut.filter((ballkid) =>
                      ballkid.preferred_position.startsWith(position)
                    ).length
                  }
                  )
                </span>
              </div>
              {renderBallkidsInSection(
                selfCut,
                "Self-Cut",
                position,
                showHovercard,
                setUpdated
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CutPageDesktop(props) {
  const [active, setActive] = useState([]);
  const [emails, setEmails] = useState([]);
  const [updated, setUpdated] = useState(false);
  const [showHovercard, setShowHovercard] = useState(true);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const sections = Object.keys(CUT_STATUSES).map((key) => CUT_STATUSES[key]);

  useEffect(() => {
    fetch("/api/sorted-list", { headers: getAuthHeader() })
      .then((response) => response.json())
      .then((data) =>
        setActive(
          data.filter((ballkid) => !ballkid.is_cut && !ballkid.is_chairperson)
        )
      );

    fetch("/api/emails-list", { headers: getAuthHeader() })
      .then((response) => response.json())
      .then((data) => setEmails(data["emails"]))
      .then(() => setUpdated(false));
  }, [updated]);

  return (
    <ListPageShell>
      <Alerts
        successMsg={successMsg}
        errorMsg={errorMsg}
        setSuccessMsg={setSuccessMsg}
        setErrorMsg={setErrorMsg}
      />

      <ListPageHeader
        title="Cut Page"
        count={active.length}
        helpPage="Cut"
        helpMessage={cut}
        showLayout={false}
        trailing={
          <div className="cut-header-toolbar">
            {renderCopyButtons(active, emails, setSuccessMsg)}
            <div className="cut-header-divider" />
            <div className="cut-hovercard-toggle">
              {renderSwitch(
                showHovercard,
                setShowHovercard,
                "",
                "Hovercards"
              )}
            </div>
          </div>
        }
      />

      <div className="cut-page-layout">
        <div className="cut-status-col">
          <div className="cut-status-grid">
            {sections.map((section) => (
              <CutStatusSection
                key={section}
                section={section}
                active={active.filter(
                  (ballkid) => ballkid.cut_status === section
                )}
                showHovercard={showHovercard}
                setUpdated={setUpdated}
              />
            ))}

            <SelfCutCard
              updated={updated}
              showHovercard={showHovercard}
              setUpdated={setUpdated}
            />
          </div>
        </div>

        <div className="cut-active-col">
          <ActiveSection
            active={active.filter((ballkid) => ballkid.cut_status === "")}
            showHovercard={showHovercard}
            setUpdated={setUpdated}
          />
        </div>
      </div>
    </ListPageShell>
  );
}
