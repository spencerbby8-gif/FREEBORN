import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { colors, type NotificationPreferencesRow } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { SaveActionBar } from "@/components/ui/save-action-bar";
import { ToggleRow } from "@/components/ui/toggle-row";
import { SettingsSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [likeAlerts, setLikeAlerts] = useState(true);
  const [profileActivity, setProfileActivity] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle<NotificationPreferencesRow>();
    if (data) {
      setMatchAlerts(data.match_alerts);
      setMessageAlerts(data.message_alerts);
      setLikeAlerts(data.like_alerts);
      setProfileActivity(data.profile_activity);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!user) return;
    setNotice(null);
    setSaving(true);
    const { error } = await supabase.from("notification_preferences").upsert({
      user_id: user.id,
      match_alerts: matchAlerts,
      message_alerts: messageAlerts,
      like_alerts: likeAlerts,
      profile_activity: profileActivity,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) {
      setNotice({ tone: "error", message: "Could not save notification preferences. Please try again." });
    } else {
      setNotice({ tone: "success", message: "Notification preferences saved." });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DetailScreenShell title="Notifications" subtitle="Choose what alerts you">
        <SettingsSkeleton />
        <SettingsSkeleton />
        <SettingsSkeleton />
      </DetailScreenShell>
    );
  }

  return (
    <DetailScreenShell title="Notifications" subtitle="Choose what alerts you">
      <SurfaceCard>
        <SectionHeader eyebrow="Matches" title="Match alerts" body="Get notified when someone likes you back." />
        <ToggleRow title="New matches" body="When a like becomes mutual." value={matchAlerts} onValueChange={setMatchAlerts} />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Messages" title="Message alerts" body="Know when someone reaches out." />
        <ToggleRow title="New messages" body="When a match sends you a message." value={messageAlerts} onValueChange={setMessageAlerts} />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Profile" title="Profile activity" body="Stay aware of interest in your profile." />
        <ToggleRow title="New likes" body="When someone likes your profile." value={likeAlerts} onValueChange={setLikeAlerts} />
        <ToggleRow title="Profile views" body="Activity and engagement on your profile." value={profileActivity} onValueChange={setProfileActivity} />
      </SurfaceCard>

      <SaveActionBar onSave={save} saving={saving} notice={notice} label="Save notification settings" />
    </DetailScreenShell>
  );
}
