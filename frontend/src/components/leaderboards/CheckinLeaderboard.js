import React, { useState, useEffect } from "react";
import { Typography, Link } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import { getAuthHeader, getTimeStr, getTimeFloat, Icons } from "../Utils";

export default function CheckinLeaderboard(props) {
  const [ballkids, setBallkids] = useState([]);

  useEffect(() => {
    fetch("/api/get-checkin-leaderboard", { headers: getAuthHeader() })
      .then((response) => response.json())
      .then((data) => setBallkids(data));
  }, []);

  const columns = [
    {
      field: "rank",
      headerName: "",
      width: 30,
      sortable: true,
      renderCell: (index) => index.api.getRowIndex(index.row.id) + 1,
    },
    {
      field: "name",
      headerName: "Ballkid",
      width: 200,
      renderCell: (rowData) => (
        <div className="sxs">
          <Link href={`/ballkid/${rowData.row.id}`}>
            {rowData.row.ballkid.first_name} {rowData.row.ballkid.last_name}
          </Link>
          &thinsp;
          <Icons ballkid={rowData.row.ballkid} margin={0} />
        </div>
      ),
    },
    {
      field: "time",
      headerName: "Total Time",
      width: 200,
      valueGetter: (rowData) => getTimeFloat(rowData.row.time),
      valueFormatter: (obj) => getTimeStr(obj.value),
    },
    {
      field: "days",
      headerName: "# of Days",
      width: 100,
      valueGetter: (rowData) => rowData.row.days,
    },
    {
      field: "timePerDay",
      headerName: "Average Time Per Day",
      width: 200,
      valueGetter: (rowData) =>
        getTimeFloat(rowData.row.time) / rowData.row.days,
      valueFormatter: (obj) => getTimeStr(obj.value),
    },
  ];

  const rows = ballkids.map((ballkid) => ({
    id: ballkid.id,
    ballkid: ballkid,
    days: ballkid.checkin_days,
    time: ballkid.checkin_duration,
  }));

  return (
    <div className="page">
      <Typography variant="h4" sx={{ mb: 2 }}>
        Check-in Leaderboard
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
