import ContainerView from "@/components/ContainerView";
import CustomButton from "@/components/CustomButton";
import { useAuthContext } from "@/context/AuthProvider";
import { router } from "expo-router";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { setIsLogged, clearTokenStorage, userInfo } = useAuthContext();

  if (!userInfo) {
    <SafeAreaView className="h-full">
      <ContainerView>
        <Text className="text-3xl font-bold text-white mb-5">Profile</Text>
        <View>
          <Text className="text-white/50">Something went wrong!</Text>
        </View>
      </ContainerView>
    </SafeAreaView>;
  }
  return (
    <SafeAreaView className="h-full">
      <ContainerView className="justify-start">
        <Text className="text-3xl font-bold text-white mb-5">Profile</Text>
        <View className="mb-5 w-full">
          <View className="flex flex-row gap-2 mb-5">
            <Text className="text-lg font-medium text-white">Username:</Text>
            <Text className="text-lg font-semibold text-white/50">
              {userInfo?.username}
            </Text>
          </View>
          <View className="flex flex-row gap-2 mb-5">
            <Text className="text-lg font-medium text-white">Email:</Text>
            <Text className="text-lg font-semibold text-white/50">
              {userInfo?.email}
            </Text>
          </View>
          <View className="flex flex-row gap-2">
            <Text className="text-lg font-medium text-white">Role:</Text>
            <Text className="text-lg font-semibold text-white/50">
              {userInfo?.role}
            </Text>
          </View>
        </View>
        <View className="mx-auto mt-3">
          <CustomButton
            title="SIGN OUT"
            onPress={() => {
              setIsLogged(false);
              clearTokenStorage(), router.push("/");
            }}
          />
        </View>
      </ContainerView>
    </SafeAreaView>
  );
};

export default Profile;
