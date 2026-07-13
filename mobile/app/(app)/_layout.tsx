import { useEffect, useState } from "react";
import { Tabs, router } from "expo-router";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@freeborn/shared";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

function TabIcon({ icon, focused, label }: { icon: string; focused: boolean; label: string }) {
  if (focused) {
    return (
      <View style={styles.activeContainer}>
        <LinearGradient
          colors={[colors.ember500, colors.gold300]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeIconBg}
        >
          <Text style={styles.activeGlyph}>{icon}</Text>
        </LinearGradient>
        <Text style={[styles.tabLabel, styles.tabLabelActive]}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.inactiveContainer}>
      <View style={styles.inactiveIconBg}>
        <Text style={styles.inactiveGlyph}>{icon}</Text>
      </View>
      <Text style={styles.tabLabel}>{label}</Text>
    </View>
  );
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!user) return;
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("onboarding_stage")
        .eq("id", user.id)
        .maybeSingle<{ onboarding_stage: string }>();

      if (cancelled) return;

      if (profile?.onboarding_stage === "account_created") {
        router.replace("/(app)/onboarding");
      } else {
        setChecking(false);
      }
    }
    check();
    return () => { cancelled = true; };
  }, [user]);

  if (checking) {
    return (
      <View style={styles.gateLoader}>
        <ActivityIndicator size="small" color={colors.gold300} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function AppTabsLayout() {
  return (
    <OnboardingGate>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.pearl,
          tabBarInactiveTintColor: colors.mist,
          tabBarLabelStyle: { display: "none" },
          tabBarItemStyle: styles.tabItem,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Discover",
            tabBarIcon: ({ focused }) => <TabIcon icon="✦" focused={focused} label="Discover" />,
          }}
        />
        <Tabs.Screen
          name="likes"
          options={{
            title: "Likes",
            tabBarIcon: ({ focused }) => <TabIcon icon="♥" focused={focused} label="Likes" />,
          }}
        />
        <Tabs.Screen
          name="matches"
          options={{
            title: "Matches",
            tabBarIcon: ({ focused }) => <TabIcon icon="◈" focused={focused} label="Matches" />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => <TabIcon icon="◯" focused={focused} label="Profile" />,
          }}
        />
        <Tabs.Screen name="onboarding" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
      </Tabs>
    </OnboardingGate>
  );
}

const styles = StyleSheet.create({
  gateLoader: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.night },
  tabBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    height: 76,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopWidth: 0,
    borderRadius: 32,
    backgroundColor: "rgba(7,16,28,0.82)",
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: -6 },
    elevation: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tabItem: { borderRadius: 24 },
  activeContainer: { alignItems: "center", gap: 3 },
  inactiveContainer: { alignItems: "center", gap: 3 },
  activeIconBg: {
    width: 38,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.gold300,
    shadowOpacity: 0.40,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  inactiveIconBg: {
    width: 38,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  activeGlyph: { color: "white", fontSize: 16, fontWeight: "900" },
  inactiveGlyph: { color: colors.mist, fontSize: 16, fontWeight: "800" },
  tabLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.6, color: colors.mist },
  tabLabelActive: { color: colors.pearl },
});
