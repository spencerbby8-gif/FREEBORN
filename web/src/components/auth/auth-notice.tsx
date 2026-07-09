type AuthNoticeProps = {
  title: string;
  body: string;
  tone: "success" | "error";
};

export function AuthNotice({ title, body, tone }: AuthNoticeProps) {
  return (
    <div
      className={`rounded-[26px] border px-5 py-4 ${
        tone === "success"
          ? "border-emerald-300/24 bg-emerald-300/10 text-emerald-50"
          : "border-rose-300/28 bg-rose-400/10 text-rose-50"
      }`}
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6 opacity-88">{body}</p>
    </div>
  );
}
