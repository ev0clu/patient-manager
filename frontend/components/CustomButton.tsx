import { BaseSyntheticEvent } from "react";
import { Text, Pressable, ActivityIndicator } from "react-native";

interface CustomButtonProps {
  title: string;
  onPress: (
    e?: BaseSyntheticEvent<object, any, any> | undefined
  ) => Promise<void> | void;
  isLoading?: boolean;
}

const CustomButton = ({ title, onPress, isLoading }: CustomButtonProps) => {
  return (
    <Pressable
      className="bg-primary w-36 rounded-xl h-12 flex flex-row justify-center items-center"
      onPress={onPress}
    >
      <Text className="text-white font-bold text-md">{title}</Text>
      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#fff"
          size="small"
          className="ml-2"
        />
      )}
    </Pressable>
  );
};

export default CustomButton;
