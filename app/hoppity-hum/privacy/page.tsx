import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

export const metadata: Metadata = {
  title: "Hoppity Hum Publisher — Privacy Policy | Coreframe",
  description: "How Hoppity Hum Publisher, Coreframe's internal YouTube publishing tool, uses and protects data.",
};

const wrap: CSSProperties = { maxWidth: 760, margin: "0 auto", padding: "48px 20px 80px", lineHeight: 1.65 };
const h2: CSSProperties = { fontSize: 22, marginTop: 36 };
const UPDATED = "21 September 2026";

export default function HoppityHumPrivacy() {
  return (
    <main style={wrap}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Hoppity Hum Publisher: Privacy Policy</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>Last updated {UPDATED}</p>

      <p>
        This policy describes how <strong>Hoppity Hum Publisher</strong> (&quot;the tool&quot;), operated by Coreframe
        Compute Labs Pvt Ltd (&quot;Coreframe&quot;, &quot;we&quot;), uses data obtained through YouTube API Services.
        The tool is an internal application used only by Coreframe staff to publish and manage videos on our own
        YouTube channel, <Link href="/hoppity-hum">Hoppity Hum</Link>. It has no external users.
      </p>

      <h2 style={h2}>YouTube API Services</h2>
      <p>
        The tool uses YouTube API Services. By using the tool, and by watching videos it publishes, you are also bound
        by the <a href="https://www.youtube.com/t/terms">YouTube Terms of Service</a>. Google&apos;s handling of data
        is described in the <a href="https://policies.google.com/privacy">Google Privacy Policy</a>.
      </p>

      <h2 style={h2}>What data the tool accesses</h2>
      <ul>
        <li>
          <strong>Our own channel account:</strong> an OAuth authorisation, granted by Coreframe for the Hoppity Hum
          channel only, that lets the tool upload videos and update their details (title, description, tags,
          thumbnail, playlist, audience and synthetic-content settings, and publish time).
        </li>
        <li>
          <strong>Statistics for our own videos:</strong> view and like counts of videos on the Hoppity Hum channel,
          used for an internal weekly report.
        </li>
      </ul>
      <p>
        The tool does <strong>not</strong> access, collect or store any information about viewers, children, other
        YouTube users or other channels. It does not use cookies, advertising identifiers or tracking of any kind,
        and it does not show YouTube content to anyone.
      </p>

      <h2 style={h2}>How the data is used and shared</h2>
      <p>
        The data is used only to publish and manage Hoppity Hum videos and to measure how our own videos perform. We
        do not sell, rent or share it with anyone, and we do not use it for advertising. It is stored on servers
        controlled by Coreframe, with access limited to authorised staff. Credentials are kept in restricted files
        that only the tool&apos;s service account can read.
      </p>

      <h2 style={h2}>Retention and deletion</h2>
      <ul>
        <li>Video statistics obtained from the YouTube API are refreshed or deleted within 30 days.</li>
        <li>
          The OAuth authorisation is kept only while the tool is in use and is deleted when it is no longer needed,
          or immediately on request.
        </li>
        <li>
          Access can be revoked at any time from the Google account&apos;s security settings at{" "}
          <a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a>. When access is
          revoked, the tool can no longer reach the channel, and we delete any stored authorisation and statistics
          within 7 days.
        </li>
      </ul>

      <h2 style={h2}>Children</h2>
      <p>
        Hoppity Hum videos are made for children and are marked as made for kids on YouTube, so YouTube limits data
        collection on them in line with the US Children&apos;s Online Privacy Protection Act (COPPA) and similar laws.
        The tool itself never collects data from or about children.
      </p>

      <h2 style={h2}>Changes</h2>
      <p>If this policy changes, we will update this page and the date at the top.</p>

      <h2 style={h2}>Contact</h2>
      <p>
        Coreframe Compute Labs Pvt Ltd, India.{" "}
        <a href="mailto:hello@coreframecloud.com">hello@coreframecloud.com</a>
      </p>
    </main>
  );
}
