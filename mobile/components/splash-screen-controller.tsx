import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore repeated calls during Fast Refresh.
});

export function SplashScreenController() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {
        // noop
      });
    }
  }, [isLoading]);

  return null;
}
