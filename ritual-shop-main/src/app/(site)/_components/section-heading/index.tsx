import styles from "./section-heading.module.css";

type SectionHeadingProps = {
  eyebrow?: null | string;
  title: string;
  align?: "left" | "center";
  light?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  align = "left",
  light = false,
}: SectionHeadingProps) {
  return (
    <div
      className={[
        styles.heading,
        align === "center" ? styles.center : "",
        light ? styles.light : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {eyebrow ? <h3>{eyebrow}</h3> : null}
      <h2>{title}</h2>
    </div>
  );
}
