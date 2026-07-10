import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";

import LoadingButton from "@mui/lab/LoadingButton/LoadingButton";

import {
  getAuthHeader,
  getLocalStorage,
  SearchAndFilter,
  filterBallkids,
  ConfirmDialog,
  BallkidCard,
  useIsMobile,
  CommentsText,
} from "../Utils";
import { CHECKOUT_OPTIONS, LAST_DAY_OPTIONS } from "../Consts";
import { checkin } from "../HelpMessages";
import { TextField } from "@mui/material";
import {
  ListPageShell,
  ListPageHeader,
  ListToolbarCard,
  ListSection,
  ListCards,
  ListEmpty,
} from "./ListPageLayout";

function CheckinButton({ ballkid, isCheckedIn, setUpdated }) {
  const checkinString = isCheckedIn ? "Check Out" : "Check In";
  const color = isCheckedIn ? "error" : "success";
  const newCheckinStatus = isCheckedIn ? false : true;

  const [loading, setLoading] = useState(false);

  return (
    <LoadingButton
      className="list-by-name-checkin-cta"
      variant="outlined"
      loading={loading}
      color={color}
      size="small"
      onMouseDown={isolatePointer}
      onClick={(e) => {
        setLoading(true);
        isolatePointer(e);
        fetch("/api/update-ballkid", {
          method: "PATCH",
          headers: getAuthHeader(),
          body: JSON.stringify({
            first_name: ballkid.first_name,
            last_name: ballkid.last_name,
            is_checked_in: newCheckinStatus,
          }),
        })
          .then((response) => response.json())
          .then(() => {
            setUpdated(true);
            setLoading(false);
          });
      }}
    >
      {checkinString}
    </LoadingButton>
  );
}

function isolatePointer(e) {
  e.stopPropagation();
}

function fieldIsPersisted(raw) {
  return raw !== "" && raw !== null && raw !== undefined;
}

function CheckinSelectField({
  label,
  rawValue,
  options,
  minWidth = 128,
  ballkid,
  apiField,
  setUpdated,
}) {
  const serverDisplay = rawValue ?? "End";
  const [value, setValue] = useState(serverDisplay);
  const [savedValue, setSavedValue] = useState(() =>
    fieldIsPersisted(rawValue) ? serverDisplay : null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const next = rawValue ?? "End";
    setValue(next);
    if (fieldIsPersisted(rawValue)) {
      setSavedValue(next);
    }
  }, [rawValue, ballkid.id]);

  const isDirty = savedValue === null || value !== savedValue;

  const persist = () => {
    setLoading(true);
    fetch("/api/update-ballkid", {
      method: "PATCH",
      headers: getAuthHeader(),
      body: JSON.stringify({
        first_name: ballkid.first_name,
        last_name: ballkid.last_name,
        [apiField]: value,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Save failed");
        }
        return response.json();
      })
      .then(() => {
        setSavedValue(value);
        setUpdated(true);
      })
      .catch(() => {
        window.alert(`Could not save ${label.toLowerCase()}. Please try again.`);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div
      className="list-by-name-checkin-field"
      onMouseDown={isolatePointer}
    >
      <span className="list-by-name-checkin-field-label">{label}</span>
      <div className="list-by-name-checkin-field-row">
        <TextField
          select
          size="small"
          variant="outlined"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onMouseDown={isolatePointer}
          className="list-by-name-checkin-select"
          sx={{ minWidth, flex: "1 1 auto" }}
          SelectProps={{
            MenuProps: {
              PaperProps: { className: "list-by-name-checkin-menu-paper" },
            },
          }}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        {isDirty ? (
          <LoadingButton
            type="button"
            size="small"
            variant="contained"
            className="list-by-name-checkin-save-btn"
            loading={loading}
            onMouseDown={isolatePointer}
            onClick={(e) => {
              e.preventDefault();
              isolatePointer(e);
              persist();
            }}
          >
            Save
          </LoadingButton>
        ) : (
          <Button
            type="button"
            size="small"
            variant="contained"
            disabled
            className="list-by-name-checkin-saved-btn"
            onMouseDown={isolatePointer}
          >
            Saved
          </Button>
        )}
      </div>
    </div>
  );
}

function CheckoutComments({ ballkid, layout, setUpdated }) {
  return useIsMobile() ? (
    ""
  ) : ballkid.is_checked_in ? (
    <CommentsText ballkid={ballkid} commentType="checkout" layout={layout} />
  ) : (
    <CheckinSelectField
      label="Check-out time"
      rawValue={ballkid.checkout_comments}
      options={CHECKOUT_OPTIONS}
      minWidth={108}
      ballkid={ballkid}
      apiField="checkout_comments"
      setUpdated={setUpdated}
    />
  );
}

function LastDayComments({ ballkid, layout, setUpdated }) {
  return useIsMobile() || ballkid.is_checked_in ? (
    ""
  ) : (
    <CheckinSelectField
      label="Last day"
      rawValue={ballkid.last_day}
      options={LAST_DAY_OPTIONS}
      minWidth={132}
      ballkid={ballkid}
      apiField="last_day"
      setUpdated={setUpdated}
    />
  );
}

function renderBallkids(ballkids, isCheckedIn, layout, setUpdated) {
  if (ballkids.length === 0) {
    return (
      <ListEmpty>
        {isCheckedIn
          ? "There are currently no ballkids checked in."
          : "There are currently no ballkids checked out."}
      </ListEmpty>
    );
  }

  return (
    <ListCards layout={layout}>
      {ballkids.map((ballkid) => (
        <BallkidCard
          key={ballkid.id}
          ballkid={ballkid}
          actionsOutsideLink
          renderAdditional={
            <Box
              className={`list-by-name-card-actions list-by-name-checkin-actions layout-${layout}`}
              onMouseDown={isolatePointer}
            >
              {layout === "grid" ? (
                <CheckinButton
                  ballkid={ballkid}
                  isCheckedIn={isCheckedIn}
                  setUpdated={setUpdated}
                />
              ) : null}
              <LastDayComments
                ballkid={ballkid}
                layout={layout}
                setUpdated={setUpdated}
              />
              <CheckoutComments
                ballkid={ballkid}
                layout={layout}
                setUpdated={setUpdated}
              />
              {layout === "list" ? (
                <CheckinButton
                  ballkid={ballkid}
                  isCheckedIn={isCheckedIn}
                  setUpdated={setUpdated}
                />
              ) : null}
            </Box>
          }
        />
      ))}
    </ListCards>
  );
}

export default function CheckinPage(props) {
  const [checkedIn, setCheckedIn] = useState([]);
  const [checkedOut, setCheckedOut] = useState([]);
  const [open, setOpen] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterGroup, setFilterGroup] = useState();
  const [layout, setLayout] = useState(getLocalStorage("layout") ?? "list");
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    fetch("/api/list", { headers: getAuthHeader() })
      .then((response) => response.json())
      .then((data) => {
        setCheckedIn(
          data.filter(
            (ballkid) =>
              ballkid.is_checked_in === true && ballkid.is_cut === false
          )
        );
        setCheckedOut(
          data.filter(
            (ballkid) =>
              ballkid.is_checked_in === false && ballkid.is_cut === false
          )
        );
      })
      .then(() => setUpdated(false));
  }, [updated]);

  const filteredIn = filterBallkids(checkedIn, searchKeyword, filterGroup);
  const filteredOut = filterBallkids(checkedOut, searchKeyword, filterGroup);
  const totalVisible = filteredIn.length + filteredOut.length;

  return (
    <ListPageShell>
      <ConfirmDialog
        message={`You are about to check out all ${
          checkedIn.length
        } checked in ballkid${checkedIn.length > 1 ? "s" : ""}.`}
        url={"/api/checkout-all"}
        body={{
          checkout_group: "all",
        }}
        open={open}
        setOpen={setOpen}
        setUpdated={setUpdated}
      />

      <ListPageHeader
        title="Check-in"
        count={totalVisible}
        helpPage="Check-in"
        helpMessage={checkin}
        layout={layout}
        setLayout={setLayout}
        showLayout={checkedIn.length + checkedOut.length > 0}
      />

      {checkedIn.length + checkedOut.length === 0 ? (
        <ListEmpty>There are no ballkids to show.</ListEmpty>
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

          <ListSection
            title="Checked In"
            count={filteredIn.length}
            actions={
              checkedIn.length > 0 ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setOpen(true)}
                >
                  Check Out All
                </Button>
              ) : null
            }
          >
            {renderBallkids(filteredIn, true, layout, setUpdated)}
          </ListSection>

          <ListSection title="Checked Out" count={filteredOut.length}>
            {renderBallkids(filteredOut, false, layout, setUpdated)}
          </ListSection>
        </>
      )}
    </ListPageShell>
  );
}
