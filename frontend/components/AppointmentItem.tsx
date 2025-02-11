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
    <View className="flex gap-3 flex-row w-full justify-between my-1 px-1 py-5 border border-stone-500">
      <Pressable
        className="flex flex-row w-10 flex-1 justify-between"
        onPress={() => router.navigate(`/appointments/${item.id}`)}
      >
        <Image
          source={
            DOCTORS.find((doctor) => doctor.name === item.doctor.name)?.image
          }
          style={{
            width: 300,
            height: 250,
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
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="w-16 text-center text-lg text-white"
        >
          {item.userId}
        </Text>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="w-16 text-center text-lg text-white"
        >
          {format(new Date(item.slot.date), "dd-MM-yyyy HH:mm")}
        </Text>
        <Text
          className={cn("w-16 text-center text-md font-bold", {
            "text-green-600": item.status === "SCHEDULED",
            "text-yellow-600": item.status === "PENDING",
            "text-rose-600": item.status === "CANCELLED",
          })}
        >
          {item.status}
        </Text>
      </Pressable>

      <Pressable onPress={() => showDeleteAlert(item.id)} className="w-16">
        <AntDesign
          name="delete"
          size={24}
          color="black"
          className="text-center"
        />
      </Pressable>
    </View>
  );
};

export default AppointmentItem;
