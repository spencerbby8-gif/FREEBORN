import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { colors } from "@freeborn/shared";

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: focused ? colors.pearl : colors.mist, fontSize: 20 }}>{icon}</Text>
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
          borderTopColor: "rgba(255,255,255,0.08)",
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.pearl,
        tabBarInactiveTintColor: colors.mist,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ focused }) => <TabIcon icon="✨" focused={focused} />,
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
