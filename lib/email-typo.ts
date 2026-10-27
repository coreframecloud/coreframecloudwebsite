// "Did you mean name@gmail.com?" (27 Oct 2026). A typo'd domain - gmial.com,
// hotmial.com - sends the sign-in code nowhere and the customer waits on an
// empty inbox. Pure function: suggests, never changes what was typed.
// Keep in step with the Connect app: coreframe-control-plane apps/desktop-client/src/lib/email-typo.js.

const KNOWN_DOMAINS = [
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in", "hotmail.com",
  "outlook.com", "live.com", "icloud.com", "rediffmail.com",
];

// Common misspellings seen in the wild, mapped straight to the intended domain.
const TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com", "gamil.com": "gmail.com", "gmai.com": "gmail.com", "gmal.com": "gmail.com",
  "gnail.com": "gmail.com", "gmail.co": "gmail.com", "gmail.cm": "gmail.com", "gmail.con": "gmail.com",
  "gmaill.com": "gmail.com", "gmali.com": "gmail.com", "gimal.com": "gmail.com", "gmail.om": "gmail.com",
  "gmail.in": "gmail.com", "googlemail.co": "googlemail.com",
  "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com", "yahoo.co": "yahoo.com", "yhoo.com": "yahoo.com",
  "yaho.co.in": "yahoo.co.in", "yahoo.co.i": "yahoo.co.in",
  "hotmial.com": "hotmail.com", "hotmal.com": "hotmail.com", "hotmai.com": "hotmail.com", "hotmil.com": "hotmail.com",
  "hotmail.co": "hotmail.com", "homail.com": "hotmail.com",
  "outlok.com": "outlook.com", "outloo.com": "outlook.com", "outlook.co": "outlook.com", "otlook.com": "outlook.com",
  "iclod.com": "icloud.com", "icoud.com": "icloud.com", "icloud.co": "icloud.com", "iclould.com": "icloud.com",
  "rediffmail.co": "rediffmail.com", "redifmail.com": "rediffmail.com", "rediffmial.com": "rediffmail.com",
  "live.co": "live.com",
};

// Levenshtein distance, small inputs only.
function distance(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

export function suggestEmail(value: string): string | null {
  const email = String(value || "").trim();
  const at = email.lastIndexOf("@");
  if (at < 1 || at === email.length - 1) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1).toLowerCase();
  if (KNOWN_DOMAINS.includes(domain)) return null;
  if (TYPOS[domain]) return `${local}@${TYPOS[domain]}`;
  // One slip away from a known domain with the same ending (gmsil.com).
  for (const known of KNOWN_DOMAINS) {
    if (Math.abs(known.length - domain.length) <= 1 && distance(domain, known) === 1) {
      return `${local}@${known}`;
    }
  }
  return null;
}
