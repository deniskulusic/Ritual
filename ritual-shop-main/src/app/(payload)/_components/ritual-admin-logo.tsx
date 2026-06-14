import Image from "next/image";

export function RitualAdminLogo() {
  return (
    <div className="ritual-admin-logo">
      <Image
        alt="Ritual Admin"
        className="ritual-admin-logo__image"
        height="42"
        src="/ritual/uploads/ritual-logo.png"
        width="171"
      />
    </div>
  );
}
