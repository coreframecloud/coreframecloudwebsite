// "/usd/pricing" -> "/pricing". Leading slashes are collapsed (security audit
// 26 Nov 2026) so "/usd//evil.example" can never become a protocol-relative
// "//evil.example" redirect, which a browser would treat as another host.
export function usdTargetPath(pathname: string): string {
  return "/" + pathname.slice(4).replace(/^[/\\]+/, "");
}
