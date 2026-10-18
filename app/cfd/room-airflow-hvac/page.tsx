import type { Metadata } from "next";
import RoomAirflowHvacView, { roomAirflowMetadata } from "./view";

// Visitors outside India are rewritten to /usd/cfd/room-airflow-hvac by proxy.ts.
export const metadata: Metadata = roomAirflowMetadata;

export default function RoomAirflowHvacPage() {
  return <RoomAirflowHvacView currency="INR" />;
}
