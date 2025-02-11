import ContainerView from "@/components/ContainerView";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  return (
    <SafeAreaView className="h-full">
      <ScrollView
        contentContainerStyle={{
          height: "100%",
        }}
      >
        <ContainerView>
          <View>
            <Text className="text-white">profile</Text>
          </View>
        </ContainerView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
