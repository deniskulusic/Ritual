import type { ServerProps } from "payload";

const resolveUserText = (value: unknown, fallback: string): string =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;

const getInitials = (value: string): string =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join("");

export function RitualAdminAvatar({ user }: ServerProps) {
  const accountName =
    user && typeof user === "object" && "name" in user
      ? resolveUserText(user.name, "")
      : "";
  const accountEmail =
    user && typeof user === "object" && "email" in user
      ? resolveUserText(user.email, "Ritual Admin")
      : "Ritual Admin";
  const primary = accountName || accountEmail;

  return (
    <div className="ritual-admin-avatar">
      <span className="ritual-admin-avatar__image" aria-hidden="true">
        {getInitials(primary)}
      </span>
      <span className="ritual-admin-avatar__copy">
        <span className="ritual-admin-avatar__name">{primary}</span>
        <span className="ritual-admin-avatar__meta">{accountEmail}</span>
      </span>
    </div>
  );
}
