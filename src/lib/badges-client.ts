// Client-side badge check trigger — hits the API route
export async function checkAndAwardBadgesClient() {
  await fetch("/api/badges/check", { method: "POST" });
}
