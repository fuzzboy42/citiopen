import React from "react";

const LOGO_SRC = `${process.env.PUBLIC_URL}/mubadala-dc-open-logo.png`;

/** Official Mubadala DC Open tournament mark (PNG). */
export default function BallcrewLogo({ size = 28 }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Mubadala DC Open"
      width={size}
      height={size}
      className="ballcrew-logo-img"
      draggable={false}
    />
  );
}
