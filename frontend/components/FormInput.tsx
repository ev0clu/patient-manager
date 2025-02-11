import {
  NativeSyntheticEvent,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
} from "react-native";

type FormInputProps = TextInputProps & {
  onBlur: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onChangeText: (text: string) => void;
  value: string;
  placeholder: string;
  isSecure?: boolean;
};

const FormInput = ({
  onBlur,
  onChangeText,
  value,
  placeholder,
  isSecure,
  ...props
}: FormInputProps) => {
  return (
    <TextInput
      className="border rounded-md px-5 py-4 border-stone-700 font-semibold text-lg text-white"
      onBlur={onBlur}
      onChangeText={onChangeText}
      value={value}
      placeholder={placeholder}
      placeholderTextColor="#a8a29e"
      secureTextEntry={isSecure}
      {...props}
    />
  );
};

export default FormInput;
