import React, { useState, useEffect } from "react";

import Grid from "@mui/material/Grid";

import { getAuthHeader } from "../Utils";
import { MATCH_TYPES } from "../Consts";
import { UnassignedDesktop } from "./TeamsPageChairpersonDesktop";
import { Header, renderTeams } from "./FinalsTeamsPageChairpersonUtils";

import { TeamsPageShell } from "./TeamsPageLayout";
import "./teams-pages.css";

export default function FinalsTeamsPageChairpersonDesktop(props) {
  const [assigned, setAssigned] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [updated, setUpdated] = useState(false);

  const [showHovercard, setShowHovercard] = useState(true);

  const teams = Object.keys(MATCH_TYPES).map((key) => MATCH_TYPES[key]);

  useEffect(() => {
    fetch("/api/sorted-list", { headers: getAuthHeader() })
      .then((response) => response.json())
      .then((data) => {
        setAssigned(
          data.filter(
            (ballkid) => ballkid.finals_team && !ballkid.is_chairperson
          )
        );
        setUnassigned(
          data.filter(
            (ballkid) => !ballkid.finals_team && !ballkid.is_chairperson
          )
        );
      })
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
          <Header
            showHovercard={showHovercard}
            setShowHovercard={setShowHovercard}
          />
          {renderTeams(assigned, teams, showHovercard, setUpdated)}
        </Grid>

        <Grid
          item
          sm={6}
          md={5}
          lg={4}
          xl={3}
          className="teams-chairperson-side"
        >
          <UnassignedDesktop
            unassigned={unassigned}
            setUpdated={setUpdated}
            showHovercard={showHovercard}
            isFinalsPage={true}
          />
        </Grid>
      </Grid>
    </TeamsPageShell>
  );
}
