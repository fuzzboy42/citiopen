import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import {
  getAuthHeader,
  getLocalStorage,
  SearchAndFilter,
  filterBallkids,
  BallkidCard,
} from "../Utils";
import { inactive } from "../HelpMessages";
import {
  ListPageShell,
  ListPageHeader,
  ListToolbarCard,
  ListSection,
  ListCards,
  ListEmpty,
} from "./ListPageLayout";

function renderUnarchiveButton(ballkid, setUpdated) {
  return (
    <Button
      variant="outlined"
      color="success"
      size="small"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        fetch("/api/update-ballkid", {
          method: "PATCH",
          headers: getAuthHeader(),
          body: JSON.stringify({
            first_name: ballkid.first_name,
            last_name: ballkid.last_name,
            is_active: true,
          }),
        })
          .then((response) => response.json())
          .then(() => setUpdated(true));
      }}
    >
      Un-Archive
    </Button>
  );
}

function renderUncutButton(ballkid, setUpdated) {
  return (
    <Button
      variant="outlined"
      label="Cut"
      color="success"
      size="small"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        fetch("/api/update-ballkid", {
          method: "PATCH",
          headers: getAuthHeader(),
          body: JSON.stringify({
            first_name: ballkid.first_name,
            last_name: ballkid.last_name,
            is_cut: false,
          }),
        })
          .then((response) => response.json())
          .then(() => setUpdated(true));
      }}
    >
      Un-cut
    </Button>
  );
}

function renderBallkids(ballkids, section, layout, setUpdated) {
  if (ballkids.length === 0) {
    return (
      <ListEmpty>There are currently no {section} ballkids.</ListEmpty>
    );
  }

  return (
    <ListCards layout={layout}>
      {ballkids.map((ballkid) => (
        <BallkidCard
          key={ballkid.id}
          ballkid={ballkid}
          renderAdditional={
            <Box className="list-by-name-card-actions" textAlign="center">
              {section === "cut"
                ? renderUncutButton(ballkid, setUpdated)
                : renderUnarchiveButton(ballkid, setUpdated)}
            </Box>
          }
        />
      ))}
    </ListCards>
  );
}

export default function InactiveBallkidList(props) {
  const [archived, setArchived] = useState([]);
  const [cut, setCut] = useState([]);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterGroup, setFilterGroup] = useState();
  const [layout, setLayout] = useState(getLocalStorage("layout") ?? "list");
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    fetch("/api/inactive-list", { headers: getAuthHeader() })
      .then((response) => response.json())
      .then((data) => {
        setArchived(data.filter((ballkid) => ballkid.is_active === false));
        setCut(
          data.filter(
            (ballkid) => ballkid.is_active === true && ballkid.is_cut === true
          )
        );
      })
      .then(() => setUpdated(false));
  }, [updated]);

  const filteredCut = filterBallkids(cut, searchKeyword, filterGroup);
  const filteredArchived = filterBallkids(archived, searchKeyword, filterGroup);
  const total = archived.length + cut.length;
  const totalVisible = filteredCut.length + filteredArchived.length;

  return (
    <ListPageShell>
      <ListPageHeader
        title="Inactive"
        count={totalVisible}
        helpPage="Inactive"
        helpMessage={inactive}
        layout={layout}
        setLayout={setLayout}
        showLayout={total > 0}
      />

      {total === 0 ? (
        <ListEmpty>There are no inactive ballkids to show.</ListEmpty>
      ) : (
        <>
          <ListToolbarCard>
            <SearchAndFilter
              useGridItem={false}
              setSearchKeyword={setSearchKeyword}
              filterGroup={filterGroup}
              setFilterGroup={setFilterGroup}
            />
          </ListToolbarCard>

          <ListSection title="Cut Ballkids" count={filteredCut.length}>
            {renderBallkids(filteredCut, "cut", layout, setUpdated)}
          </ListSection>

          <ListSection title="Archived Ballkids" count={filteredArchived.length}>
            {renderBallkids(filteredArchived, "archived", layout, setUpdated)}
          </ListSection>
        </>
      )}
    </ListPageShell>
  );
}
