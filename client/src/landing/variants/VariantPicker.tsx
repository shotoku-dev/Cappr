import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "./variant-picker.css";

export type VariantOption = {
  id: string;
  label: string;
};

export function useActiveVariant(
  variants: readonly VariantOption[],
  defaultVariant: string,
) {
  const [params, setParams] = useSearchParams();
  const raw = params.get("variant");
  const active = variants.some((variant) => variant.id === raw) ? raw! : defaultVariant;

  const setVariant = useCallback(
    (id: string) => {
      const next = new URLSearchParams(params);
      next.set("variant", id);
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  return { active, setVariant };
}

type VariantPickerProps = {
  variants: readonly VariantOption[];
  active: string;
  onSelect: (id: string) => void;
};

export function VariantPicker({ variants, active, onSelect }: VariantPickerProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (target instanceof HTMLElement && target.isContentEditable) return;

      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        if (target instanceof Element && target.closest('[role="tablist"]')) return;
        event.preventDefault();
        const index = variants.findIndex((variant) => variant.id === active);
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const next = variants[(index + direction + variants.length) % variants.length];
        onSelect(next.id);
        return;
      }

      const numeric = Number(event.key);
      if (numeric >= 1 && numeric <= variants.length) {
        event.preventDefault();
        onSelect(variants[numeric - 1].id);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, onSelect, variants]);

  return (
    <nav className="variant-picker" aria-label="Variants">
      {variants.map((variant) => (
        <button
          key={variant.id}
          type="button"
          data-variant={variant.id}
          aria-current={active === variant.id ? "true" : undefined}
          onClick={() => onSelect(variant.id)}
        >
          {variant.label}
        </button>
      ))}
    </nav>
  );
}
