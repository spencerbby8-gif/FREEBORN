"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { UserProfileRow } from "@freeborn/shared";
import { genderOptions, relationshipGoalOptions, interestOptions, lifestyleOptions, dealBreakerOptions, profilePrompts } from "@freeborn/shared";
import { saveProfileEdit } from "@/lib/discover/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="w-full rounded-xl bg-[var(--color-pearl)] py-3.5 text-sm font-bold text-[var(--color-ink)] transition hover:bg-white hover:translate-y-[-1px] disabled:opacity-60">
      {pending ? "Saving…" : "Save profile"}
    </button>
  );
}

export function ProfileEditor({ profile }: { profile: UserProfileRow }) {
  const [state, formAction] = useActionState(saveProfileEdit, null);
  const [interests, setInterests] = useState<string[]>(profile.interests ?? []);
  const [lifestyle, setLifestyle] = useState<string[]>(profile.lifestyle_preferences ?? []);
  const [dealBreakers, setDealBreakers] = useState<string[]>(profile.deal_breakers ?? []);
  const [goals, setGoals] = useState<string[]>(profile.relationship_goals ?? []);
  const [showGender, setShowGender] = useState<string[]>(profile.show_gender ?? []);
  const [prompts, setPrompts] = useState<{prompt:string;answer:string}[]>(
    Array.isArray(profile.prompt_answers) ? profile.prompt_answers.slice(0,3) : []
  );

  const toggle = (list: string[], set: React.Dispatch<React.SetStateAction<string[]>>, v: string, max = 99) => {
    set((curr: string[]) => curr.includes(v) ? curr.filter(x=>x!==v) : curr.length < max ? [...curr, v] : curr);
  };

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">Edit profile</p>
      <h3 className="mt-1 text-xl font-semibold text-[var(--color-pearl)]">Your story, well-told</h3>

      <form action={formAction} className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-[var(--color-mist)]">Display name</span>
            <input name="display_name" defaultValue={profile.display_name ?? ""} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-pearl)] outline-none focus:border-white/20 transition" />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-mist)]">Birth date</span>
            <input type="date" name="birth_date" defaultValue={profile.birth_date ?? ""} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-pearl)] outline-none focus:border-white/20 transition" />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-mist)]">Gender</span>
            <select name="gender" defaultValue={profile.gender ?? ""} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-pearl)] outline-none focus:border-white/20 transition">
              <option value="">Select…</option>
              {genderOptions.map(g => <option key={g.value} value={g.value} className="bg-[#0c1727]">{g.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-mist)]">Height (cm)</span>
            <input type="number" name="height_cm" defaultValue={profile.height_cm ?? ""} min={120} max={230} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-pearl)] outline-none focus:border-white/20 transition" />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-mist)]">City</span>
            <input name="city" defaultValue={profile.city ?? ""} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-pearl)] outline-none focus:border-white/20 transition" />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-mist)]">Region</span>
            <input name="region" defaultValue={profile.region ?? ""} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-pearl)] outline-none focus:border-white/20 transition" />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-mist)]">Country code</span>
            <input name="country_code" defaultValue={profile.country_code ?? ""} maxLength={2} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm uppercase text-[var(--color-pearl)] outline-none focus:border-white/20 transition" />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-mist)]">Occupation</span>
            <input name="occupation" defaultValue={profile.occupation ?? ""} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-pearl)] outline-none focus:border-white/20 transition" />
          </label>
        </div>

        <label className="block">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-mist)]">Bio</span>
            <span className="text-xs text-[var(--color-mist)]">{(profile.bio ?? "").length} / 500</span>
          </div>
          <textarea name="bio" defaultValue={profile.bio ?? ""} maxLength={500} rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-pearl)] outline-none focus:border-white/20 transition resize-none" />
        </label>

        {/* Relationship goals chips */}
        <div>
          <p className="text-xs text-[var(--color-mist)] mb-2">Relationship goals</p>
          <div className="flex flex-wrap gap-2">
            {relationshipGoalOptions.map(o => {
              const active = goals.includes(o.value);
              return (
                <button key={o.value} type="button" onClick={()=>toggle(goals,setGoals,o.value,3)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold border transition-all ${active ? "border-[var(--color-accent-gold)]/40 bg-[rgba(241,201,122,0.10)] text-[var(--color-pearl)]" : "border-white/10 text-[var(--color-mist)] hover:border-white/20"}`}>
                  {o.label}
                </button>
              );
            })}
          </div>
          {goals.map(g => <input key={g} type="hidden" name="relationship_goals" value={g} />)}
        </div>

        <div className="grid gap-5">
          <ChipGroup label={`Interests (${interests.length}/12)`} options={[...interestOptions]} value={interests} onToggle={(v)=>toggle(interests,setInterests,v,12)} />
          {interests.map(i => <input key={i} type="hidden" name="interests" value={i} />)}

          <ChipGroup label={`Lifestyle (${lifestyle.length}/12)`} options={[...lifestyleOptions]} value={lifestyle} onToggle={(v)=>toggle(lifestyle,setLifestyle,v,12)} />
          {lifestyle.map(i => <input key={i} type="hidden" name="lifestyle_preferences" value={i} />)}

          <ChipGroup label="Deal breakers" options={[...dealBreakerOptions]} value={dealBreakers} onToggle={(v)=>toggle(dealBreakers,setDealBreakers,v,12)} soft />
          {dealBreakers.map(i => <input key={i} type="hidden" name="deal_breakers" value={i} />)}
        </div>

        {/* Prompts */}
        <div>
          <p className="text-xs text-[var(--color-mist)] mb-2">Prompts · up to 3</p>
          <div className="space-y-3">
            {[0,1,2].map(idx => {
              const pa = prompts[idx] ?? { prompt: "", answer: "" };
              return (
                <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <select
                    value={pa.prompt}
                    onChange={e=>{
                      const v=e.target.value;
                      setPrompts(p=>{
                        const n=[...p]; n[idx]={...(n[idx]??{answer:""}), prompt:v, answer:n[idx]?.answer??""}; return n;
                      });
                    }}
                    className="w-full rounded-lg bg-transparent px-2 py-2 text-sm text-[var(--color-pearl)] outline-none"
                  >
                    <option value="">Choose a prompt…</option>
                    {profilePrompts.map(pp => <option key={pp} value={pp}>{pp}</option>)}
                  </select>
                  <textarea
                    value={pa.answer}
                    onChange={e=>{
                      const v=e.target.value;
                      setPrompts(p=>{
                        const n=[...p]; n[idx]={...(n[idx]??{prompt:""}), answer:v.slice(0,280)}; return n;
                      });
                    }}
                    placeholder="Your answer…"
                    className="mt-2 w-full bg-transparent text-sm text-[var(--color-pearl)] outline-none resize-none"
                    rows={2}
                  />
                </div>
              );
            })}
          </div>
          <input type="hidden" name="prompt_answers" value={JSON.stringify(prompts.filter(p=>p.prompt && p.answer.length>=8))} />
        </div>

        {/* Show gender */}
        <div>
          <p className="text-xs text-[var(--color-mist)] mb-2">Show me</p>
          <div className="flex flex-wrap gap-2">
            {genderOptions.slice(0,5).map(g=>{
              const active = showGender.includes(g.value);
              return (
                <button key={g.value} type="button" onClick={()=>toggle(showGender,setShowGender,g.value)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold border transition-all ${active ? "border-[var(--color-accent-blue)]/40 bg-[rgba(140,207,255,0.10)] text-[var(--color-pearl)]" : "border-white/10 text-[var(--color-mist)] hover:border-white/20"}`}>
                  {g.label}
                </button>
              );
            })}
          </div>
          {showGender.map(g => <input key={g} type="hidden" name="show_gender" value={g} />)}
        </div>

        <label className="flex items-center gap-3 text-sm text-[var(--color-pearl)]">
          <input type="checkbox" name="discoverable" defaultChecked={profile.discoverable} className="h-4 w-4 rounded border-white/20 bg-white/10 accent-[var(--color-accent-gold)]" />
          Discoverable in Freeborn
        </label>

        <input type="hidden" name="education" value={profile.education ?? ""} />

        {state && !state.ok && <p className="text-sm text-red-200">{state.error}</p>}
        {state && state.ok && <p className="text-sm text-emerald-200">Profile saved.</p>}

        <SubmitButton />
      </form>
    </div>
  );
}

function ChipGroup({ label, options, value, onToggle, soft }:{ label:string; options:string[]; value:string[]; onToggle:(v:string)=>void; soft?:boolean }) {
  return (
    <div>
      <p className="text-xs text-[var(--color-mist)] mb-2">{label}</p>
      <div className="flex flex-wrap gap-2 max-h-40 overflow-auto pr-1">
        {options.map(o=>{
          const active = value.includes(o);
          return (
            <button key={o} type="button" onClick={()=>onToggle(o)}
              className={`rounded-full px-3 py-1.5 text-xs border transition-all ${active ? (soft ? "border-rose-300/30 bg-rose-300/8 text-rose-100" : "border-[var(--color-accent-gold)]/40 bg-[rgba(241,201,122,0.10)] text-[var(--color-pearl)]") : "border-white/10 text-[var(--color-mist)] hover:bg-white/5"}`}>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
