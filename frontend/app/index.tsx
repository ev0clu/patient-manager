import { router } from "expo-router";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContainerView from "@/components/ContainerView";
import CustomButton from "@/components/CustomButton";
import AntDesign from "@expo/vector-icons/AntDesign";

const HomeScreen = () => {
  return (
    <SafeAreaView className="h-full">
      <ScrollView
        contentContainerStyle={{
          height: "100%",
        }}
      >
        <ContainerView className="justify-center gap-12">
          <View className="flex flex-row gap-5 justify-center items-center mt-10">
            <AntDesign name="medicinebox" size={36} color="#059669" />
            <Text className="text-3xl font-bold text-white">
              Patient Manager
            </Text>
          </View>
          <Image
            source={require("@/assets/images/cover.png")}
            style={{
              width: 300,
              height: 250,
              marginVertical: 10,
              resizeMode: "contain",
              borderRadius: 30,
            }}
            resizeMode="cover"
          />

          <View>
            <Text className="text-lg text-center text-white/50">
              Manage your health easily and get an appointment fastest than
              before!
            </Text>
          </View>

          <View className="flex flex-row items-center justify-between gap-5">
            <CustomButton
              title="START"
              onPress={() => router.navigate("/sign-in")}
            />
          </View>
        </ContainerView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
