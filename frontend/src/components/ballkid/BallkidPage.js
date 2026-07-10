import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getAuthHeader } from "../Utils";
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

export default function BallkidPage(props) {
  const [ballkid, setBallkid] = useState(null);
  const [showTeams, setShowTeams] = useState(false);
  const [loadState, setLoadState] = useState("loading");

  const { pk } = useParams();
  const ballkidId = parseInt(pk, 10);

  useEffect(() => {
    if (!Number.isFinite(ballkidId)) {
      setLoadState("error");
      return;
    }
    setLoadState("loading");
    setBallkid(null);

    fetch("/api/get-ballkid/" + ballkidId, { headers: getAuthHeader() })
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
      })
      .catch(() => setLoadState("error"));

    fetch("/api/get-tournament", {
      method: "GET",
      headers: getAuthHeader(),
    })
      .then((response) => response.json())
      .then((data) => setShowTeams(data["show_teams"]));
  }, [ballkidId]);

  if (loadState === "loading") {
    return <ProfileLoadingState />;
  }

  if (loadState === "error" || ballkid == null) {
    return (
      <ProfileErrorState>
        Could not load ballkid #{pk}. Log in, check that this ID exists in the
        roster, and that the backend is running on port 8000.
      </ProfileErrorState>
    );
  }

  const showCurrent =
    !ballkid.is_cut && ballkid.is_active && showTeams;

  return (
    <ProfilePageShell>
      <ProfileBrandedHero ballkid={ballkid} />

      <ProfileContent>
        <ProfileCard title="Personal info">
          <ProfileInfoRow
            label="Experience"
            value={`${ballkid.num_years_experience} years`}
          />
          <ProfileInfoRow label="Preferred position">
            <ProfilePositionPills preferred={ballkid.preferred_position} />
          </ProfileInfoRow>
        </ProfileCard>

        {showCurrent ? (
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
        ) : null}
      </ProfileContent>
    </ProfilePageShell>
  );
}
