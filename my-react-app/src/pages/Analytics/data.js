

export function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function shortTask(name) {
  const first = name.trim().split("\n")[0];
  return first.length > 36 ? first.slice(0, 34) + "…" : first;
}

export function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
