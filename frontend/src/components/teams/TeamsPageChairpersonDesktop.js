import React, { useState, useEffect } from "react";
import { useDrop } from "react-dnd";

import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import {
  getAuthHeader,
  SearchAndFilter,
  filterBallkids,
  ConfirmDialog,
  DraggableBallkidAndIcon,
} from "../Utils";
import { MARGINS, POSITIONS } from "../Consts";
import {
  Teams,
  Header,
  renderCheckoutUnassignedButton,
  ActionsButtons,
} from "./TeamsPageChairpersonUtils";
import { TeamsPageShell } from "./TeamsPageLayout";
import "./teams-pages.css";

export function UnassignedDesktop({
  unassigned,
  setUpdated,
  showHovercard = false,
  isFinalsPage = false,
}) {
  const [open, setOpen] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterGroup, setFilterGroup] = useState();

  const [{ isOver }, dropRef] = useDrop({
    accept: "ballkid",
    drop: (ballkid) => {
      const teamAssignDict = isFinalsPage
        ? { finals_team: "" }
        : { current_team: 0 };

      fetch("/api/update-ballkid", {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify({
          first_name: ballkid.first_name,
          last_name: ballkid.last_name,
          ...teamAssignDict,
        }),
      })
        .then((response) => response.json())
        .then(() => setUpdated(true));
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  return (
    <Box
      component={Paper}
      className="teams-panel"
      ref={dropRef}
      elevation={isOver ? 4 : 0}
      sx={{ pl: { xs: 0, sm: 0 }, ml: { xs: 0, sm: 0 }, pb: 2 }}
    >
      <ConfirmDialog
        message={`You are about to check out all ${
          unassigned.length
        } unassigned ballkid${unassigned.length > 1 ? "s" : ""}.`}
        url={"/api/checkout-all"}
        body={{
          checkout_group: "unassigned",
        }}
        open={open}
        setOpen={setOpen}
        setUpdated={setUpdated}
      />

      <div className="teams-section-header">
        <h2 className="teams-section-title">
          Unassigned
          <span className="teams-section-count">
            ({filterBallkids(unassigned, searchKeyword, filterGroup).length})
          </span>
        </h2>

        {unassigned.length === 0 || isFinalsPage
          ? ""
          : renderCheckoutUnassignedButton(setOpen)}
      </div>

      <div className="teams-toolbar-card">
        <SearchAndFilter
          setSearchKeyword={setSearchKeyword}
          filterGroup={filterGroup}
          setFilterGroup={setFilterGroup}
          filters={
            isFinalsPage
              ? ["rookie", "supervet", "captain"]
              : ["rookie", "supervet", "captain", "chairperson"]
          }
        />
      </div>
        {POSITIONS.map((position) => {
          const ballkids = filterBallkids(
            unassigned,
            searchKeyword,
            filterGroup
          ).filter((ballkid) => ballkid.position === position);
          const half = Math.ceil(ballkids.length / 2);

          return (
            <div key={position}>
              <div className="sxs">
                <Typography variant="h6" sx={MARGINS}>
                  {position}s
                </Typography>
                <Typography variant="subtitle1" sx={{ ...MARGINS, ml: 1 }}>
                  ({ballkids.length})
                </Typography>
              </div>

              {ballkids.length === 0 ? (
                <Typography variant="body1" sx={{ pb: 1 }}>
                  There are currently no {isFinalsPage ? "" : "checked in "}
                  {position.toLowerCase()}s who are unassigned.
                </Typography>
              ) : (
                <Grid container>
                  {[ballkids.slice(0, half), ballkids.slice(half)].map(
                    (sliced) =>
                      sliced.length === 0 ? (
                        ""
                      ) : (
                        <Grid
                          container
                          item
                          key={sliced[0].id}
                          direction="column"
                          xs={12}
                          sm={6}
                          md={6}
                          lg={6}
                          xl={4}
                        >
                          {sliced.map((ballkid) => (
                            <Grid key={ballkid.id} item sx={{ px: 1 }}>
                              <DraggableBallkidAndIcon
                                ballkid={ballkid}
                                commentTypes={
                                  isFinalsPage
                                    ? ["rank", "experience"]
                                    : ["checkout_teams"]
                                }
                                showHovercard={showHovercard}
                                hoverCommentTypes={
                                  isFinalsPage
                                    ? ["experience", "rank", "calibrated_avg"]
                                    : []
                                }
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

export default function TeamsPageChairpersonDesktop(props) {
  const [assigned, setAssigned] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [nextShifts, setNextShifts] = useState([]);
  const [teams, setTeams] = useState([]);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    fetch("/api/sorted-list", { headers: getAuthHeader() })
      .then((response) => response.json())
      .then((data) => {
        setAssigned(
          data.filter(
            (ballkid) =>
              ballkid.is_checked_in === true && ballkid.current_team > 0
          )
        );
        setUnassigned(
          data.filter(
            (ballkid) =>
              ballkid.is_checked_in === true && ballkid.current_team === 0
          )
        );
      });

    fetch("/api/calc-num-teams", { headers: getAuthHeader() })
      .then((response) => response.json())
      .then((data) => setTeams(data["teams"]));

    fetch("/api/get-next-shifts", { headers: getAuthHeader() })
      .then((response) => response.json())
      .then((data) => setNextShifts(data))
      .then(() => setUpdated(false));
  }, [updated]);

  return (
    <TeamsPageShell wide>
      <Grid container className="justify-top teams-chairperson-layout">
        <Grid
          item
          sm={6}
          md={7}
          lg={8}
          xl={9}
          className="teams-chairperson-main"
        >
          <Header />
          <ActionsButtons
            numAssigned={assigned.length}
            setUpdated={setUpdated}
          />
          <Teams
            assigned={assigned}
            teams={teams}
            nextShifts={nextShifts}
            setUpdated={setUpdated}
          />
        </Grid>

        <Grid
          item
          sm={6}
          md={5}
          lg={4}
          xl={3}
          className="teams-chairperson-side"
        >
          <UnassignedDesktop unassigned={unassigned} setUpdated={setUpdated} />
        </Grid>
      </Grid>
    </TeamsPageShell>
  );
}
