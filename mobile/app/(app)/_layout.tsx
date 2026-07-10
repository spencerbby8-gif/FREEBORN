import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { colors } from "@freeborn/shared";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: focused ? colors.pearl : colors.mist, fontSize: 16, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(7,16,28,0.96)",
          borderTopColor: colors.lineStrong,
          height: 74,
          paddingBottom: 14,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.pearl,
        tabBarInactiveTintColor: colors.mist,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ focused }) => <TabIcon label="✨" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="likes"
        options={{
          title: "Likes",
          tabBarIcon: ({ focused }) => <TabIcon label="♥" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "Matches",
          tabBarIcon: ({ focused }) => <TabIcon label="◈" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon label="◯" focused={focused} />,
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
