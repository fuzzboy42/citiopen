import React, { useEffect, useState } from "react";
import {
  Button,
  Rating,
  Grid,
  Typography,
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
} from "@mui/material";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Alerts,
  getAuthHeader,
  getToday,
  getSessionStorage,
  RatingAndLabel,
} from "../Utils";

export default function RatingDialog({ open, setOpen, ballkid }) {
  const raterId = getSessionStorage("ballkid_id");

  const [ratee, setRatee] = useState({
    label: ballkid.first_name + " " + ballkid.last_name,
    id: ballkid.id,
  });
  const [date, setDate] = useState(getToday());
  const [rating, setRating] = useState(null);
  const [comments, setComments] = useState("");
  const [speedRating, setSpeedRating] = useState(null);
  const [decisionRating, setDecisionRating] = useState(null);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [ballkids, setBallkids] = useState([]);
  useEffect(() => {
    fetch("/api/list", { headers: getAuthHeader() })
      .then((response) => response.json())
      .then((data) => setBallkids(data));
  }, []);

  const ballkidsList = ballkids.map((ballkid) => ({
    label: ballkid.first_name + " " + ballkid.last_name,
    id: ballkid.id,
  }));

  const handleClose = () => {
    setOpen(false);
    setErrorMsg("");
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
        <Grid
          container
          spacing={2}
          alignItems="center"
          direction="column"
          justifyContent="center"
        >
          <Grid item xs={12}>
            <Alerts
              successMsg={successMsg}
              errorMsg={errorMsg}
              setSuccessMsg={setSuccessMsg}
              setErrorMsg={setErrorMsg}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography component="h4" variant="h4">
              Give Rating
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <div className="sxs">
              <Autocomplete
                disablePortal
                openOnFocus
                sx={{ width: 250 }}
                options={ballkidsList}
                value={ratee}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(e, newVal) => {
                  setRatee(newVal);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Ratee"
                    required
                  />
                )}
              />
              <LocalizationProvider dateAdapter={AdapterLuxon}>
                <DatePicker
                  renderInput={(props) => (
                    <TextField
                      sx={{ mx: 2 }}
                      required={true}
                      variant="standard"
                      {...props}
                    />
                  )}
                  label="Date"
                  value={date}
                  mask={"__/__/____"}
                  onChange={(newVal) => {
                    setDate(newVal.toLocaleString());
                  }}
                />
              </LocalizationProvider>
            </div>
          </Grid>

          <RatingAndLabel
            label={"Overall"}
            rating={rating}
            setRating={setRating}
          />
          <RatingAndLabel
            label={"Speed"}
            rating={speedRating}
            setRating={setSpeedRating}
          />
          <RatingAndLabel
            label={"Decision-making"}
            rating={decisionRating}
            setRating={setDecisionRating}
          />

          <Grid item xs={12}>
            <TextField
              label="Comments"
              variant="standard"
              sx={{ width: 400 }}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              multiline
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={(e) => {
            fetch("/api/create-rating", {
              method: "POST",
              headers: getAuthHeader(),
              body: JSON.stringify({
                rater: raterId,
                ratee: ratee.id,
                date: date,
                rating: rating,
                speed_rating: speedRating,
                decision_rating: decisionRating,
                comments: comments,
              }),
            }).then((response) => {
              if (response.ok) {
                setSuccessMsg("Rating submitted!");
                setTimeout(() => {
                  setOpen(false);
                  setComments("");
                  setRating(null);
                  setSpeedRating(null);
                  setDecisionRating(null);
                  setSuccessMsg("");
                }, 1000);
              } else {
                setErrorMsg("Error submitting rating.");
              }
            });
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
