import { Text, TextProps } from "react-native";

type ErrorTextProps = TextProps & {
  title: string | undefined;
};

const ErrorText = ({ title, ...props }: ErrorTextProps) => {
  return (
    <Text className="text-rose-500" {...props}>
      {title}
    </Text>
  );
};

export default ErrorText;
