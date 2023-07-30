import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";

import { Alerts } from "../Utils";

function handleSubmit(email, navigate, setErrorMsg, setLoading) {
  fetch("/accounts/users/reset_password/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  }).then((response) => {
    if (response.ok) {
      navigate("/reset-email-sent");
    } else {
      setErrorMsg(
        "Email not found to be associated with an account! Please enter another email."
      );
    }
    setLoading(false);
  });
}

export default function ForgotPasswordPage(props) {
  const [email, setEmail] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="center">
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
              Forgot Password?
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              Enter your email address below, and we'll email instructions for
              setting a new one.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Email"
              name="email"
              variant="standard"
              required={true}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setLoading(true);
                  handleSubmit(
                    email.toLowerCase(),
                    navigate,
                    setErrorMsg,
                    setLoading
                  );
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <LoadingButton
              loading={loading}
              color="primary"
              variant="contained"
              onClick={(e) => {
                setLoading(true);
                handleSubmit(
                  email.toLowerCase(),
                  navigate,
                  setErrorMsg,
                  setLoading
                );
              }}
            >
              Submit
            </LoadingButton>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
