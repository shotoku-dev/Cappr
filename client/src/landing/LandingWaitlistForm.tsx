import { useId, useState } from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import "./waitlist.css";

const CTA_ARROW_SIZE = 14;

// Client-side cooldown: soft guard against button-mashing / casual spam.
// The hard backstop is the per-IP rate limit enforced in Postgres.
const COOLDOWN_MS = 30_000;
const COOLDOWN_KEY = "cappr:waitlist:lastSubmit";

function inCooldown(): boolean {
  const last = Number(localStorage.getItem(COOLDOWN_KEY) ?? 0);
  return Date.now() - last < COOLDOWN_MS;
}

type LandingWaitlistFormProps = {
  variant?: "inline" | "stacked";
  className?: string;
};

export function LandingWaitlistForm({
  variant = "inline",
  className,
}: LandingWaitlistFormProps) {
  const id = useId();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const form = e.currentTarget;
    const email = new FormData(form).get("email")?.toString().trim().toLowerCase();
    if (!email) return;

    if (inCooldown()) {
      toast("You're already on the list.");
      form.reset();
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("waitlist").insert({ email });
    setSubmitting(false);

    // 23505 = unique_violation: already signed up. Treat as success.
    if (error && error.code !== "23505") {
      // The Postgres rate-limit trigger raises with SQLSTATE P0001.
      toast.error(
        error.code === "P0001"
          ? "Too many signups from your network. Please try again later."
          : "Something went wrong. Please try again.",
      );
      return;
    }

    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
    form.reset();
    toast("You've been added to the list.");
  }

  return (
    <form
      className={["landing-waitlist", `landing-waitlist--${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      onSubmit={handleSubmit}
    >
      <label htmlFor={id} className="landing-waitlist__sr-only">
        Work email
      </label>
      <input
        id={id}
        type="email"
        name="email"
        autoComplete="email"
        required
        placeholder="you@company.com"
        className="landing-waitlist__input"
      />
      <button type="submit" className="landing-waitlist__btn" disabled={submitting}>
        {submitting ? "Adding…" : "Notify me"}
        <IconArrowRight
          size={CTA_ARROW_SIZE}
          stroke={1.75}
          aria-hidden
          className="landing-waitlist__arrow"
        />
      </button>
    </form>
  );
}
