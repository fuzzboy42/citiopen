import React from "react";
import { Link as RouterLink } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";

export default function ForgotPasswordComplete(props) {
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
            <Typography variant="h4">Password reset complete!</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              Your password has been reset. You can log in now with your new
              password.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Link variant="body1" component={RouterLink} to="/login">
              Log in
            </Link>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
