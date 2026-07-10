import { CheckIcon, CloseIcon } from "@/components/icons";

type AuthNoticeProps = {
  title: string;
  body: string;
  tone: "success" | "error";
};

export function AuthNotice({ title, body, tone }: AuthNoticeProps) {
  const success = tone === "success";
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`relative overflow-hidden rounded-2xl border px-4 py-3.5 ${
        success
          ? "border-[rgba(109,211,176,0.35)] bg-[rgba(109,211,176,0.10)]"
          : "border-[rgba(255,107,122,0.35)] bg-[rgba(255,107,122,0.10)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
            success
              ? "bg-[rgba(109,211,176,0.22)] text-[var(--color-success)]"
              : "bg-[rgba(255,107,122,0.22)] text-[var(--color-danger)]"
          }`}
        >
          {success ? <CheckIcon size={14} /> : <CloseIcon size={14} />}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-pearl)]">{title}</p>
          <p className="mt-0.5 text-[13px] leading-5 text-[var(--color-pearl)]/80">{body}</p>
        </div>
      </div>
    </div>
  );
}
