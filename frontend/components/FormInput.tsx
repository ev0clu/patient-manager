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
      className="border rounded-md px-4 py-2 border-stone-700 font-semibold text-base"
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
