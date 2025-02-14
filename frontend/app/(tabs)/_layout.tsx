import { Redirect, Tabs } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";

import { HapticTab } from "@/components/HapticTab";
import { useAuthContext } from "@/context/AuthProvider";

export default function TabLayout() {
  const { isLogged, userInfo } = useAuthContext();

  if (!isLogged) return <Redirect href="/sign-in" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: "#059669",
        tabBarInactiveTintColor: "#ecfdf5",
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopWidth: 1,
          borderTopColor: "#232533",
          /* height: 80,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",*/
        },
      }}
    >
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Appointments",
          tabBarIcon: ({ color }) => (
            <AntDesign name="calendar" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="create-appointment"
        options={{
          title: "New Appointment",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="calendar-plus-o" size={24} color={color} />
          ),
          href: userInfo && userInfo.role === "USER" ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
