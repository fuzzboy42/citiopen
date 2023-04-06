import React, { useState, useEffect } from "react";
import { Typography, Link, Switch } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import { getAuthHeader, getTimeStr } from "../Utils";

export default function CourtLeaderboard(props) {
  const [ballkids, setBallkids] = useState([]);
  const [showAdjusted, setShowAdjusted] = useState(false);

  const timeColWidth = 150;

  useEffect(() => {
    fetch("/api/get-court-leaderboard", { headers: getAuthHeader() })
      .then((response) => response.json())
      .then((data) => console.log(data));
    // .then((data) => setBallkids(data));
  }, []);

  const columns = [
    {
      field: "name",
      headerName: "Ballkid",
      width: 200,
      renderCell: (rowData) => (
        <Link href={`/ballkid/${rowData.row.ballkid.id}`}>
          {rowData.row.ballkid.first_name} {rowData.row.ballkid.last_name}
        </Link>
      ),
    },
    {
      field: "time",
      headerName: "Total Time",
      width: timeColWidth,
      renderCell: (rowData) => getTimeStr(rowData.row.time),
    },
    {
      field: "courtPerCheckin",
      headerName: "% Time on Court",
      width: timeColWidth,
      renderCell: (rowData) => getTimeStr(rowData.row.time),
    },
    {
      field: "stadium",
      headerName: "Time on Stadium",
      width: timeColWidth,
      valueGetter: (rowData) => rowData.row.days,
    },
    {
      field: "harris",
      headerName: "Time on Harris",
      width: timeColWidth,
      valueGetter: (rowData) => rowData.row.days,
    },
    {
      field: "grandstand",
      headerName: "Time on Grandstand",
      width: timeColWidth,
      valueGetter: (rowData) => rowData.row.days,
    },
    {
      field: "four",
      headerName: "Time on Court 4",
      width: timeColWidth,
      valueGetter: (rowData) => rowData.row.days,
    },
    {
      field: "five",
      headerName: "Time on Court 5",
      width: timeColWidth,
      valueGetter: (rowData) => rowData.row.days,
    },
  ];

  const rows = ballkids.map((ballkid) => ({
    ballkid: ballkid,
    ballkid_name: ballkid.ballkid_name,
    time: ballkid.duration,
  }));

  return (
    <div className="page">
      <Typography variant="h4" mb={2}>
        Court Time Leaderboard
      </Typography>

      <div className="sxs">
        <Typography variant="body1">Raw Court Time</Typography>
        <Switch
          checked={showAdjusted}
          onClick={(e) => setShowAdjusted(e.target.checked)}
        />
        <Typography variant="body1">Adjusted Court Time</Typography>
      </div>

      <div style={{ height: 500 }}>
        <DataGrid
          columns={columns}
          rows={rows}
          pageSize={25}
          density="compact"
        />
      </div>

      <Typography variant="body1" mt={2}>
        Note: % Time on Court = (Total time on court) / (Total time checked in)
      </Typography>
      <Typography variant="body1">
        Note: Raw court time takes into account rain delays and courts ending
        early. Adjusted court time additionally takes into account number of
        ballkids per team.
      </Typography>
    </div>
  );
}
