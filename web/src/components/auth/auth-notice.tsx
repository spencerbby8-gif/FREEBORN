type AuthNoticeProps = {
  title: string;
  body: string;
  tone: "success" | "error";
};

export function AuthNotice({ title, body, tone }: AuthNoticeProps) {
  return (
    <div
      className={`rounded-2xl border px-5 py-4 ${
        tone === "success"
          ? "border-emerald-300/20 bg-emerald-300/8 text-emerald-50"
          : "border-red-300/20 bg-red-400/8 text-red-50"
      }`}
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
          tone === "success" ? "bg-emerald-400/20 text-emerald-300" : "bg-red-400/20 text-red-200"
        }`}>
          {tone === "success" ? "✓" : "!"}
        </span>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6 opacity-85">{body}</p>
        </div>
      </div>
    </div>
  );
}
