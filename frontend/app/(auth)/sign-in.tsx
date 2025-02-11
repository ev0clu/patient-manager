import { Text, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, signInType } from "@/schemas/authSchema";
import { useState } from "react";
import { Link, router } from "expo-router";
import { env } from "@/lib/env";
import ContainerView from "@/components/ContainerView";
import FormInput from "@/components/FormInput";
import CustomButton from "@/components/CustomButton";
import ErrorText from "@/components/ErrorText";
import { saveAccessToken, saveRefreshToken } from "@/lib/secure-store";
import { useAuthContext } from "@/context/AuthProvider";

const SignIn = () => {
  const [errorText, setErrorText] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const { setIsLogged, setUserInfo } = useAuthContext();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<signInType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: signInType) => {
    try {
      setErrorText(undefined);
      setSubmitting(true);
      const response = await fetch(`${env.EXPO_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
        mode: "cors",
      });

      const accessToken = response.headers.get("Authorization");
      const refreshToken = response.headers.get("X-Refresh-Token");

      const body = await response.json();

      if (response.ok) {
        if (accessToken && refreshToken) {
          saveAccessToken(accessToken);
          saveRefreshToken(refreshToken);

          setSubmitting(false);
          setUserInfo(body.userInfo);
          setIsLogged(true);
          router.replace("/appointments", { relativeToDirectory: true });
          reset({
            email: "",
            password: "",
          });
        }
      } else {
        setSubmitting(false);

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
          <Text className="text-3xl font-bold text-white">Sign In</Text>
          <View className="w-full mt-10 mb-5">
            {errorText && <ErrorText title={errorText} />}
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
          </View>
          <CustomButton
            title="SIGN IN"
            onPress={handleSubmit(onSubmit)}
            isLoading={submitting}
          />
          <Text className="text-white/50 mt-5">
            Don&apos;t you have account?{" "}
            <Link href="/sign-up" className="text-sky-600 font-bold underline">
              Sign Up
            </Link>
          </Text>
        </ContainerView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
