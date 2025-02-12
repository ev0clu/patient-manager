import { Image, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { cn } from "@/lib/utils";
import AntDesign from "@expo/vector-icons/AntDesign";
import { format } from "date-fns";
import { DOCTORS } from "@/constants/doctors";

interface AppointmentItemProps {
  item: Appointment;
  showDeleteAlert: (id: number) => void;
}

const AppointmentItem = ({ item, showDeleteAlert }: AppointmentItemProps) => {
  return (
    <View className="flex gap-2 flex-col w-full justify-between my-1 px-1 py-5 border border-stone-500">
      <Pressable
        className="flex flex-row justify-between items-center"
        onPress={() => router.navigate(`/appointments/${item.id}`)}
      >
        <View className="flex flex-col gap-1 items-center">
          <Image
            source={
              DOCTORS.find((doctor) => doctor.name === item.doctor.name)?.image
            }
            style={{
              width: 40,
              height: 40,
              marginVertical: 10,
              resizeMode: "contain",
              borderRadius: 30,
            }}
            resizeMode="cover"
          />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="w-16 text-center text-lg text-white"
          >
            {item.doctor.name}
          </Text>
        </View>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="w-40 text-center text-base text-white"
        >
          {format(new Date(item.slot.date), "dd-MM-yyyy HH:mm")}
        </Text>
        <Text
          className={cn("w-28 text-center text-base font-bold", {
            "text-green-600": item.status === "SCHEDULED",
            "text-yellow-600": item.status === "PENDING",
            "text-rose-600": item.status === "CANCELLED",
          })}
        >
          {item.status}
        </Text>
      </Pressable>
      <View className="flex items-end">
        <Pressable
          onPress={() => showDeleteAlert(item.id)}
          className="w-16 text-right"
        >
          <AntDesign
            name="delete"
            size={20}
            color="#f43f5e"
            className="text-center"
          />
        </Pressable>
      </View>
    </View>
  );
};

export default AppointmentItem;
