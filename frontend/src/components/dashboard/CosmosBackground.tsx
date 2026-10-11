"use client";
import React from "react";

export default function CosmosBackground() {
  return (
    <>
      <canvas id="cosmos-canvas" />
      <div className="cosmos-scroll-hint" id="cosmos-scroll-hint" />
      <div className="cosmos-vignette" aria-hidden="true" />
      <div className="aurora" aria-hidden="true" />
    </>
  );
}
