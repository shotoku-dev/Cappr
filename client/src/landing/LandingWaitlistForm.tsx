import { useId } from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { toast } from "sonner";
import "./waitlist.css";

const CTA_ARROW_SIZE = 14;

type LandingWaitlistFormProps = {
  variant?: "inline" | "stacked";
  className?: string;
};

export function LandingWaitlistForm({
  variant = "inline",
  className,
}: LandingWaitlistFormProps) {
  const id = useId();

  return (
    <form
      className={["landing-waitlist", `landing-waitlist--${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      onSubmit={(e) => {
        e.preventDefault();
        toast("You've been added to the list.");
      }}
    >
      <label htmlFor={id} className="landing-waitlist__sr-only">
        Work email
      </label>
      <input
        id={id}
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@company.com"
        className="landing-waitlist__input"
      />
      <button type="submit" className="landing-waitlist__btn">
        Notify me
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
