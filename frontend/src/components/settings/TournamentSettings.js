import React, { useState } from "react";

import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import { Alerts, HideShowToggle, getAuthHeader } from "../Utils";

export default function TournamentSettings(props) {
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // const downloadFile = ({ data, fileName, fileType }) => {
  //   const blob = new Blob([data], { type: fileType });

  //   const a = document.createElement("a");
  //   a.download = fileName;
  //   a.href = window.URL.createObjectURL(blob);
  //   const clickEvt = new MouseEvent("click", {
  //     view: window,
  //     bubbles: true,
  //     cancelable: true,
  //   });
  //   a.dispatchEvent(clickEvt);
  //   a.remove();
  // };

  return (
    <div className="page">
      <Alerts
        successMsg={successMsg}
        errorMsg={errorMsg}
        setSuccessMsg={setSuccessMsg}
        setErrorMsg={setErrorMsg}
      />

      <Typography variant="h4" sx={{ mb: 1 }}>
        Tournament Settings
      </Typography>

      <Grid container spacing={2} sx={{ px: 2 }}>
        {["", "finals "].map((teamType) => (
          <Grid item key={teamType} xs={12} className="justify">
            <Typography variant="subtitle1">
              Visiblity of {teamType}teams to captains and ballkids
            </Typography>

            <HideShowToggle
              teamType={teamType.trim()}
              setSuccessMsg={setSuccessMsg}
              setErrorMsg={setErrorMsg}
            />
          </Grid>
        ))}

        <Grid item xs={12} className="justify">
          <Typography variant="subtitle1">
            Export all data from database
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() =>
              fetch("/api/download", {
                method: "GET",
                headers: getAuthHeader(),
              })
                .then((response) => {
                  if (response.ok) {
                    setSuccessMsg("Downloaded all data!");
                  } else {
                    setErrorMsg("Error downloading data.");
                  }
                  return response.blob();
                })
                .then((blob) => {
                  // Create blob link to download
                  const url = window.URL.createObjectURL(new Blob([blob]));
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", `sample.zip`);
                  // Append to html page, force download, and clean up by removing link
                  document.body.appendChild(link);
                  link.click();
                  link.parentNode.removeChild(link);
                  // downloadFile({
                  //   data: data,
                  //   fileName: "test.csv",
                  //   fileType: "text/csv",
                  // });
                })
            }
          >
            Download
          </Button>
        </Grid>

        <Grid item xs={12} className="justify">
          <Typography variant="subtitle1">
            Wrap up this year's tournament
          </Typography>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {}}
          >
            Complete
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}
