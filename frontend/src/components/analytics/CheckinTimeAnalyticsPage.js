import React, { useState, useEffect } from "react";
import { Typography, Link } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import { getAuthHeader, getTimeStr } from "../Utils";

export default function CheckinTimeAnalyticsPage(props) {
  const [checkinTimes, setCheckinTimes] = useState([]);

  useEffect(() => {
    fetch("/api/get-checkin-times", { headers: getAuthHeader() })
      .then((response) => response.json())
      .then((data) => setCheckinTimes(data));
  }, []);

  const columns = [
    {
      field: "name",
      headerName: "Ballkid",
      width: 200,
      renderCell: (rowData) => (
        <Link href={`/ballkid/${rowData.row.ballkid_id}`}>
          {rowData.row.ballkid_name}
        </Link>
      ),
    },
    {
      field: "time",
      headerName: "Total Checkin Time",
      width: 300,
      renderCell: (rowData) => getTimeStr(rowData.row.time),
    },
  ];

  const rows = checkinTimes.map((analytic) => ({
    id: analytic.id,
    ballkid_id: analytic.ballkid,
    ballkid_name: analytic.ballkid_name,
    time: analytic.duration,
  }));

  return (
    <div className="page">
      <Typography variant="h4" sx={{ mb: 2 }}>
        Checkin Time Leaderboard
      </Typography>

      <div style={{ height: 500 }}>
        <DataGrid
          columns={columns}
          rows={rows}
          pageSize={25}
          density="compact"
        />
      </div>
    </div>
  );
}
