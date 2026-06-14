import { LiveClock } from "./live-clock";

export function Hero({ greetingName }: { greetingName: string }) {
  return (
    <section className="ritual-dashboard__hero">
      <div className="ritual-dashboard__hero-copy">
        <h1>Welcome back, {greetingName}.</h1>
        <p>The dashboard is shifting from promotional blocks into a calmer operational overview built for day-to-day store management.</p>
      </div>

      <div className="ritual-dashboard__hero-tools">
        <LiveClock />
      </div>
    </section>
  );
}
