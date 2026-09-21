import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

export const metadata: Metadata = {
  title: "Hoppity Hum — original songs for toddlers | Coreframe",
  description:
    "Hoppity Hum is Coreframe's original nursery-rhyme and learning-song channel for children aged 1-5, and the internal publishing tool behind it.",
};

const wrap: CSSProperties = { maxWidth: 760, margin: "0 auto", padding: "48px 20px 80px", lineHeight: 1.65 };
const h2: CSSProperties = { fontSize: 22, marginTop: 36 };

export default function HoppityHumPage() {
  return (
    <main style={wrap}>
      <h1 style={{ fontSize: 34, marginBottom: 8 }}>Hoppity Hum</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>Original songs for toddlers, made by Coreframe Compute Labs Pvt Ltd</p>

      <p>
        Hoppity Hum is our children&apos;s music channel on YouTube: short, gentle songs for ages 1 to 5 about colours,
        counting, animals, bedtime and everyday habits, sung by our own cast of characters, including Kiran and Truffles
        the pig. Every song is original or based on a traditional public-domain rhyme.
      </p>
      <p>
        <a href="https://www.youtube.com/channel/UC1RiUodCZ_2aPEMgy4F-9wA">Watch Hoppity Hum on YouTube</a>
      </p>

      <h2 style={h2}>How we make the videos</h2>
      <p>
        Our team writes each song and designs its characters. We use AI-assisted tools for parts of the music and
        animation, and a person reviews and approves every video before it is published. Every video is labelled on
        YouTube as made for kids and as containing altered or synthetic content.
      </p>

      <h2 style={h2}>Hoppity Hum Publisher</h2>
      <p>
        Hoppity Hum Publisher is an internal software tool used only by the Coreframe team. It uses the YouTube Data
        API to upload our own approved videos to our single YouTube channel, set their titles, descriptions,
        playlists, thumbnails, made-for-kids and synthetic-content settings, schedule their publication, and read the
        view counts of our own videos for a weekly internal report. It has no external users, no public sign-up, and
        does not access any other YouTube account or any viewer&apos;s data.
      </p>
      <p>
        Hoppity Hum Publisher uses YouTube API Services and follows the{" "}
        <a href="https://www.youtube.com/t/terms">YouTube Terms of Service</a>. See our{" "}
        <Link href="/hoppity-hum/privacy">privacy policy</Link> for how it handles data.
      </p>

      <h2 style={h2}>Contact</h2>
      <p>
        Coreframe Compute Labs Pvt Ltd, India. Email:{" "}
        <a href="mailto:hello@coreframecloud.com">hello@coreframecloud.com</a>
      </p>
    </main>
  );
}
