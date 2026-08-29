import React from "react";
  import { pushEvent } from "@/lib/analytics";

  type Props = {
    label?: string;
    targetId?: string; // id of the enquiry form section, defaults to "enquiry-form"
    phoneHref?: string; // tel:+911234567890
    showOnDesktop?: boolean; // if false, hidden on md+
    tracking?: { eventName?: string; ctaLocation?: string };
    className?: string; // optional extra classes
  };

  function smoothScrollToId(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 12;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  const StickyEnquireCTA: React.FC<Props> = ({
    label = "Get Quote",
    targetId = "enquiry-form",
    phoneHref,
    showOnDesktop = false,
    tracking = { eventName: "cta_click", ctaLocation: "sticky_mobile" },
    className = "",
  }) => {
    const visibility = showOnDesktop ? "" : "md:hidden";

    const onClick = () => {
      pushEvent(tracking.eventName || "cta_click", {
        cta_label: label,
        cta_location: tracking.ctaLocation || "sticky_mobile",
        target_id: targetId,
      });
      smoothScrollToId(targetId);
    };

    return (
      <div
        role="region"
        aria-label="Sticky enquiry actions"
        className={[
          "fixed left-0 right-0 bottom-0 z-50 flex items-center justify-center gap-3",
          "border-t border-slate-200 bg-white/95 backdrop-blur p-2",
          visibility,
          className,
        ].join(" ")}
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)" }}
      >
        {phoneHref && (
          <a
            href={phoneHref}
            className="min-w-36 rounded-xl border border-sky-200 bg-white px-4 py-3 text-sky-600 font-semibold shadow-sm hover:bg-sky-50 transition"
            onClick={() =>
              pushEvent(tracking.eventName || "cta_click", {
                cta_label: "Call",
                cta_location: tracking.ctaLocation || "sticky_mobile",
                target_id: "phone",
              })
            }
          >
            Call
          </a>
        )}
        <button
          className="min-w-36 rounded-xl border border-sky-500 bg-sky-500 px-4 py-3 text-white font-semibold shadow-sm hover:bg-sky-600 transition"
          onClick={onClick}
          aria-label={label}
        >
          {label}
        </button>
      </div>
    );
  };

  export default StickyEnquireCTA;