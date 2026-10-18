import type { Metadata } from "next";
import RoomAirflowHvacView, { roomAirflowMetadata } from "@/app/cfd/room-airflow-hvac/view";

// /cfd/room-airflow-hvac for a visitor outside India: proxy.ts rewrites to
// this path, so the browser (and the canonical) stay on the public URL.
// A direct hit on /usd/... is redirected by proxy.ts.
export const metadata: Metadata = roomAirflowMetadata;

export default function RoomAirflowHvacPageUsd() {
  return <RoomAirflowHvacView currency="USD" />;
}
