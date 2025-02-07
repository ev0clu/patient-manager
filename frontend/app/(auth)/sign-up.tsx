import { useState } from "react";
import { Link, router } from "expo-router";
import { Text, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PhoneInput from "react-phone-number-input/react-native-input";
import { signUpSchema, signUpType } from "@/schemas/authSchema";
import { env } from "@/lib/env";
import ContainerView from "@/components/ContainerView";
import FormInput from "@/components/FormInput";
import CustomButton from "@/components/CustomButton";
import ErrorText from "@/components/ErrorText";

const SignUp = () => {
  const [errorText, setErrorText] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<signUpType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  });

  const onSubmit = async (data: signUpType) => {
    try {
      setErrorText(undefined);
      setSubmitting(true);
      const response = await fetch(`${env.EXPO_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          phone: data.phone,
        }),
      });

      if (response.ok) {
        setSubmitting(false);
        router.navigate("/sign-in", { relativeToDirectory: true });
        reset({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
        });
      } else {
        setSubmitting(false);
        const body = await response.json();

        if (body.error) {
          setErrorText(body.error);
        }
      }
    } catch (error) {
      console.log({ error });
      setErrorText("An unexpected error is occured");
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="h-full">
      <ScrollView>
        <ContainerView className="justify-start">
          <Text className="text-3xl font-bold text-white">Sign Up</Text>
          <View className="w-full mt-10 mb-5">
            {errorText && <ErrorText title={errorText} />}
            <View>
              <Text className="text-base font-medium text-left text-white">
                Username
              </Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="username"
                  />
                )}
                name="username"
                rules={{ required: true }}
              />

              {errors.username && <ErrorText title={errors.username.message} />}
            </View>
            <View>
              <Text className="text-base font-medium text-white">Email</Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="john@example.com"
                  />
                )}
                name="email"
                rules={{ required: true }}
              />
              {errors.email && <ErrorText title={errors.email.message} />}
            </View>
            <View>
              <Text className="text-base font-medium text-white">Password</Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="**********"
                    isSecure
                  />
                )}
                name="password"
                rules={{ required: true }}
              />
              {errors.password && <ErrorText title={errors.password.message} />}
            </View>
            <View>
              <Text className="text-base font-medium text-white">
                Confirm password
              </Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="**********"
                    isSecure
                  />
                )}
                name="confirmPassword"
                rules={{ required: true }}
              />
              {errors.confirmPassword && (
                <ErrorText title={errors.confirmPassword.message} />
              )}
            </View>
            <View>
              <Text className="text-base font-medium text-white">Phone</Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <PhoneInput
                    style={{
                      borderWidth: 1,
                      borderRadius: 6,
                      borderColor: "#44403c",
                      paddingX: 16,
                      paddingY: 8,
                      fontWeight: 600,
                      fontSize: 16,
                      lineHeight: 24,
                      color: "#fff",
                    }}
                    onBlur={onBlur}
                    onChange={onChange}
                    value={value}
                    placeholder="36501234567"
                    placeholderTextColor="#a8a29e"
                  />
                )}
                name="phone"
                rules={{ required: true }}
              />
              {errors.phone && <ErrorText title={errors.phone.message} />}
            </View>
          </View>
          <CustomButton
            title="SIGN UP"
            onPress={handleSubmit(onSubmit)}
            isLoading={submitting}
          />
          <Text className="text-white/50 mt-5">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-sky-600 font-bold underline">
              Sign In
            </Link>
          </Text>
        </ContainerView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
