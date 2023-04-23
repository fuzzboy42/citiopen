import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import { getAuthHeader } from "../Utils";

export default function TournamentSettings(props) {
  // eslint-disable-next-line no-unused-vars
  const [showTeams, setShowTeams] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [showFinalsTeams, setShowFinalsTeams] = useState(false);

  useEffect(() => {
    fetch("/api/show-teams", {
      method: "GET",
      headers: getAuthHeader(),
    })
      .then((response) => response.json())
      .then((data) => setShowTeams(data["show_teams"]));

    fetch("/api/show-finals-teams", {
      method: "GET",
      headers: getAuthHeader(),
    })
      .then((response) => response.json())
      .then((data) => setShowFinalsTeams(data["show_finals_teams"]));
  }, []);

  return (
    <div className="page">
      <div className="justify">
        <Typography variant="h4" sx={{ mb: 1 }}>
          Tournament Settings
        </Typography>
      </div>
    </div>
  );
}
