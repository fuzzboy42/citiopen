import React, { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";

import Button from "@mui/material/Button";
import Shortcut from "@mui/icons-material/Shortcut";

import {
  getAuthHeader,
  getBallkidId,
  RatingButton,
  useIsMobile,
  DraftRatingButton,
} from "../Utils";
import {
  ProfilePageShell,
  ProfileLoadingState,
  ProfileErrorState,
  ProfileBrandedHero,
  ProfileContent,
  ProfileCard,
  ProfileInfoRow,
  ProfilePositionPills,
} from "./BallkidProfileLayout";

export default function BallkidPageCaptain(props) {
  const [ballkid, setBallkid] = useState(null);
  const [updated, setUpdated] = useState(false);
  const [showTeams, setShowTeams] = useState(false);
  const [loadState, setLoadState] = useState("loading");

  const isMobile = useIsMobile();
  const { pk } = useParams();
  const ballkidId = parseInt(pk, 10);
  const myBallkidId = getBallkidId();

  useEffect(() => {
    if (!Number.isFinite(ballkidId) || myBallkidId === null) {
      setLoadState("error");
      return;
    }
    setLoadState("loading");
    setBallkid(null);

    fetch(`/api/get-ballkid/${ballkidId}/${myBallkidId}`, {
      headers: getAuthHeader(),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(String(response.status));
        }
        return response.json();
      })
      .then((data) => {
        if (!data?.id) {
          throw new Error("invalid");
        }
        setBallkid(data);
        setLoadState("ready");
        setUpdated(false);
      })
      .catch(() => setLoadState("error"));

    fetch("/api/get-tournament", {
      method: "GET",
      headers: getAuthHeader(),
    })
      .then((response) => response.json())
      .then((data) => setShowTeams(data["show_teams"]));
  }, [updated, ballkidId, myBallkidId]);

  if (loadState === "loading") {
    return <ProfileLoadingState />;
  }

  if (loadState === "error" || ballkid == null) {
    return (
      <ProfileErrorState>
        Could not load ballkid #{pk}. Log out and log in again so your
        ballkid_id is set, or pick someone from List by Name.
      </ProfileErrorState>
    );
  }

  const showCurrent =
    !ballkid.is_cut && ballkid.is_active && showTeams;
  const isSelf = ballkid.id === getBallkidId();

  const ratingAction =
    isSelf ? null : ballkid.have_draft ? (
      <DraftRatingButton ballkid={ballkid} setUpdated={setUpdated} />
    ) : (
      <RatingButton
        ballkid={ballkid}
        setUpdated={setUpdated}
        isMobile={isMobile}
      />
    );

  return (
    <ProfilePageShell>
      <ProfileBrandedHero ballkid={ballkid} actions={ratingAction} />

      <ProfileContent>
        <ProfileCard title="Personal info">
          <ProfileInfoRow label="Age" value={ballkid.age} />
          <ProfileInfoRow
            label="Experience"
            value={`${ballkid.num_years_experience} years`}
          />
          <ProfileInfoRow label="Phone" value={ballkid.phone} />
          <ProfileInfoRow label="Preferred position">
            <ProfilePositionPills preferred={ballkid.preferred_position} />
          </ProfileInfoRow>
        </ProfileCard>

        {showCurrent ? (
          <>
            <ProfileCard title="Current tournament">
              <ProfileInfoRow label="Position" value={ballkid.position} />
              <ProfileInfoRow
                label="Current team"
                value={
                  ballkid.current_team === 0
                    ? "Unassigned"
                    : ballkid.current_team
                }
              />
            </ProfileCard>
            <ProfileCard
              title="Ratings"
              action={
                <RouterLink
                  to={`/my-ratings?ratee=${ballkid.id}`}
                  className="ballkid-profile-card-action"
                >
                  View all →
                </RouterLink>
              }
            >
              <div className="ballkid-profile-card-body--padded">
                <Button
                  size="small"
                  variant="outlined"
                  component={RouterLink}
                  to={`/my-ratings?ratee=${ballkid.id}`}
                  endIcon={<Shortcut />}
                >
                  View my {ballkid.num_my_ratings} rating(s) for this ballkid
                </Button>
              </div>
            </ProfileCard>
          </>
        ) : null}
      </ProfileContent>
    </ProfilePageShell>
  );
}
