import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@freeborn/shared";

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  if (focused) {
    return (
      <LinearGradient colors={[colors.ember500, colors.gold300]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.activeIcon}>
        <Text style={styles.activeGlyph}>{icon}</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.inactiveIcon}>
      <Text style={styles.inactiveGlyph}>{icon}</Text>
    </View>
  );
}

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.pearl,
        tabBarInactiveTintColor: colors.mist,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ focused }) => <TabIcon icon="✦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="likes"
        options={{
          title: "Likes",
          tabBarIcon: ({ focused }) => <TabIcon icon="♥" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "Matches",
          tabBarIcon: ({ focused }) => <TabIcon icon="◈" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon icon="◯" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="onboarding"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
    height: 72,
    paddingBottom: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)",
    borderRadius: 28,
    backgroundColor: "rgba(7,16,28,0.88)",
    shadowColor: colors.ember500,
    shadowOpacity: 0.18,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: -8 },
    elevation: 18,
  },
  tabItem: {
    borderRadius: 22,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.35,
    marginTop: 2,
  },
  activeIcon: {
    width: 34,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.gold300,
    shadowOpacity: 0.38,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  inactiveIcon: {
    width: 34,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
  },
  activeGlyph: { color: "white", fontSize: 17, fontWeight: "900" },
  inactiveGlyph: { color: colors.mist, fontSize: 17, fontWeight: "800" },
});
