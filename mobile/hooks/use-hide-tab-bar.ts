import { useEffect } from "react";
import { useNavigation } from "expo-router";

const tabBarStyle = {
  position: "absolute" as const,
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
};

export const TAB_BAR_STYLE = tabBarStyle;

/** Call in any sub-screen that should hide the bottom tab bar */
export function useHideTabBar() {
  const navigation = useNavigation();
  useEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({ tabBarStyle: { display: "none" } });
      return () => {
        parent.setOptions({ tabBarStyle });
      };
    }
  }, [navigation]);
}
