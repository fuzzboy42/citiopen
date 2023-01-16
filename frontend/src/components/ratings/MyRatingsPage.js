import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import { getAuthHeader, getSessionStorage, RatingsGrid } from "../Utils";

export default function MyRatingsPage(props) {
  const [ratings, setRatings] = useState([]);
  const ballkidId = getSessionStorage("ballkid_id");

  useEffect(() => {
    fetch("/api/my-ratings/" + ballkidId, { headers: getAuthHeader() })
      .then((response) => response.json())
      .then((data) => setRatings(data));
  }, [ballkidId]);

  return (
    <div className="page">
      <Typography variant="h4" sx={{ mb: 2 }}>
        View My Ratings
      </Typography>

      <RatingsGrid ratings={ratings} />
    </div>
  );
}
