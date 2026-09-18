import { Container, Divider, Grid, Typography } from "@mui/material";
import React from "react";

export default function Project() {
  console.log("Project");
  return (
    <Container>
      <Grid container spacing={4} direction={"column"}>
        <Grid item xs={12}>
          <Typography>New project</Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Typography>New project</Typography>
        </Grid>
      </Grid>
    </Container>
  );
}
