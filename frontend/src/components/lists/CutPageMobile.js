import React, { useState, useEffect } from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import {
  filterBallkids,
  getAuthHeader,
  SearchAndFilter,
  DraggableBallkidAndIcon,
  Alerts,
} from "../Utils";
import {
  SelfCutCard,
  renderCopyButtons,
  CutStatusSection,
} from "./CutPageDesktop";
import { CUT_STATUSES } from "../Consts";
import { cut } from "../HelpMessages";
import {
  ListPageShell,
  ListPageHeader,
  ListToolbarCard,
  ListSection,
  ListEmpty,
} from "./ListPageLayout";

function renderAssignCutButton(ballkid, section, setUpdated) {
  var color;
  switch (section) {
    case "Definitely Keep":
      color = "success";
      break;
    case "Possibly Keep":
      color = "primary";
      break;
    case "Possibly Cut":
      color = "warning";
      break;
    case "Definitely Cut":
      color = "error";
      break;
    default:
      console.log("Unrecognized cut status: " + section);
  }

  return (
    <Button
      key={section}
      sx={{ m: 0.2 }}
      size="small"
      color={color}
      variant="outlined"
      onClick={(e) => {
        fetch("/api/update-ballkid", {
          method: "PATCH",
          headers: getAuthHeader(),
          body: JSON.stringify({
            first_name: ballkid.first_name,
            last_name: ballkid.last_name,
            cut_status: section,
          }),
        })
          .then((response) => response.json())
          .then(() => setUpdated(true));
      }}
    >
      {section}
    </Button>
  );
}

function ActiveSection({ active, sections, setUpdated, hideHeader }) {
  const uncategorized = active.filter((ballkid) => ballkid.cut_status === "");

  return (
    <div>
      {!hideHeader ? (
        <div className="list-by-name-section-header">
          <div className="list-by-name-section-title-row">
            <h2 className="list-by-name-section-title">Active Ballkids</h2>
            <span className="list-by-name-section-count">
              {uncategorized.length}
            </span>
          </div>
        </div>
      ) : null}
      {active.length === 0 ? (
        <ListEmpty>
          There are currently no active ballkids left to categorize.
        </ListEmpty>
      ) : uncategorized.length === 0 ? (
        <ListEmpty>All active ballkids have been categorized.</ListEmpty>
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Preferred Position</TableCell>
                <TableCell align="right">Mark As</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {uncategorized.map((ballkid) => (
                  <TableRow key={ballkid.id}>
                    <TableCell component="th" scope="row">
                      <DraggableBallkidAndIcon
                        ballkid={ballkid}
                        commentTypes={["rank", "experience", "last_day"]}
                      />
                    </TableCell>
                    <TableCell>{ballkid.preferred_position}</TableCell>
                    <TableCell align="right">
                      {sections.map((section) =>
                        renderAssignCutButton(ballkid, section, setUpdated)
                      )}
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}

export default function CutPageMobile() {
  const [active, setActive] = useState([]);
  const [emails, setEmails] = useState([]);

  const [updated, setUpdated] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterGroup, setFilterGroup] = useState();

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const sections = Object.keys(CUT_STATUSES).map((key) => CUT_STATUSES[key]);

  useEffect(() => {
    fetch("/api/sorted-list", { headers: getAuthHeader() })
      .then((response) => response.json())
      .then((data) =>
        setActive(
          data.filter((ballkid) => !ballkid.is_cut && !ballkid.is_chairperson)
        )
      );

    fetch("/api/emails-list", { headers: getAuthHeader() })
      .then((response) => response.json())
      .then((data) => setEmails(data["emails"]))
      .then(() => setUpdated(false));
  }, [updated]);

  const filteredActive = filterBallkids(active, searchKeyword, filterGroup);
  const uncategorizedCount = filteredActive.filter(
    (ballkid) => ballkid.cut_status === ""
  ).length;

  return (
    <ListPageShell>
      <Alerts
        successMsg={successMsg}
        errorMsg={errorMsg}
        setSuccessMsg={setSuccessMsg}
        setErrorMsg={setErrorMsg}
      />

      <ListPageHeader
        title="Cut Page"
        count={active.length}
        helpPage="Cut"
        helpMessage={cut}
        showLayout={false}
        trailing={renderCopyButtons(active, emails, setSuccessMsg)}
      />

      <Grid container spacing={2} className="list-by-name-cut-grid">
        {sections.map((section) => (
          <CutStatusSection
            key={section}
            section={section}
            active={active.filter((ballkid) => ballkid.cut_status === section)}
            setUpdated={setUpdated}
          />
        ))}

        <SelfCutCard updated={updated} setUpdated={setUpdated} />
      </Grid>

      <ListToolbarCard>
        <SearchAndFilter
          useGridItem={false}
          setSearchKeyword={setSearchKeyword}
          filterGroup={filterGroup}
          setFilterGroup={setFilterGroup}
          filters={["rookie", "supervet", "captain", "back", "net"]}
        />
      </ListToolbarCard>

      <ListSection title="Active Ballkids" count={uncategorizedCount}>
        <ActiveSection
          active={filteredActive}
          sections={sections}
          setUpdated={setUpdated}
          hideHeader
        />
      </ListSection>
    </ListPageShell>
  );
}
