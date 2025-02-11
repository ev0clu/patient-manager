import { ActivityIndicator, Text } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  appointmentSchema,
  appointmentType,
} from "@/schemas/appointmentSchema";
import { SafeAreaView } from "react-native-safe-area-context";
import ContainerView from "@/components/ContainerView";
import { useAuthContext } from "@/context/AuthProvider";
import ErrorText from "@/components/ErrorText";
import AppointmentForm from "@/components/AppointmentForm";
import {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from "@/lib/secure-store";
import {
  fetchGetAllDoctors,
  fetchPostCreateAppointment,
  fetchRefreshAccessToken,
} from "@/lib/fetch";
import { router } from "expo-router";

const CreateAppointment = () => {
  const queryClient = useQueryClient();

  const { setIsLogged, userInfo } = useAuthContext();

  const queryDoctors = useQuery<Doctor[]>({
    queryKey: ["doctors"],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();

      if (!accessToken) throw new Error("Access token is missing");
      if (!refreshToken) throw new Error("Refresh token is missing");

      try {
        const body = await fetchGetAllDoctors(accessToken, refreshToken);

        return body;
      } catch (error) {
        if (error === "access-token-expired") {
          console.log("Access token expired, refreshing token...");
          try {
            const newAccessToken = await fetchRefreshAccessToken(refreshToken);

            if (!newAccessToken)
              throw new Error("Unable to refresh access token");

            saveAccessToken(newAccessToken);

            const body = await fetchGetAllDoctors(newAccessToken, refreshToken);

            return body;
          } catch (error) {
            setIsLogged(false);
            throw new Error("An unexpected error is occured");
          }
        }
        throw new Error("An unexpected error is occured");
      }
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<appointmentType>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctorId: queryDoctors.data ? queryDoctors.data[0].id.toString() : "",
      description: undefined,
      slotId: queryDoctors.data
        ? queryDoctors.data[0].slots[0].id.toString()
        : "",
    },
  });

  const mutationAppointment = useMutation({
    mutationFn: async (data: appointmentType) => {
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();

      if (!accessToken) throw new Error("Access token is missing");
      if (!refreshToken) throw new Error("Refresh token is missing");

      try {
        const body = await fetchPostCreateAppointment(
          accessToken,
          refreshToken,
          data
        );

        return body;
      } catch (error) {
        if (error === "access-token-expired") {
          console.log("Access token expired, refreshing token...");
          try {
            const newAccessToken = await fetchRefreshAccessToken(refreshToken);

            if (!newAccessToken)
              throw new Error("Unable to refresh access token");

            saveAccessToken(newAccessToken);

            const body = await fetchPostCreateAppointment(
              newAccessToken,
              refreshToken,
              data
            );

            return body;
          } catch (error) {
            setIsLogged(false);
            throw new Error("An unexpected error is occured");
          }
        }
        throw new Error("An unexpected error is occured");
      }
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      router.replace("/appointments", { relativeToDirectory: true });
    },
  });

  const onSubmit = async (data: appointmentType) => {
    await mutationAppointment.mutateAsync(data);
  };

  return (
    <SafeAreaView className="h-full">
      <ContainerView className="justify-start">
        <Text className="text-3xl font-bold text-white">New Appointment</Text>
        {queryDoctors.error && <ErrorText title={queryDoctors.error.message} />}
        {queryDoctors.isPending ? (
          <SafeAreaView className="h-full">
            <ContainerView>
              <ActivityIndicator
                animating={queryDoctors.isPending}
                color="#059669"
                size="large"
                className="ml-2"
              />
            </ContainerView>
          </SafeAreaView>
        ) : queryDoctors.data === undefined ? (
          <Text className="text-3xl font-bold text-white/50">
            Currently there is no available doctor. Come back later.
          </Text>
        ) : (
          <AppointmentForm
            errors={errors}
            control={control}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            submitting={mutationAppointment.isPending}
            type="CREATE"
            userInfo={userInfo}
            doctors={queryDoctors.data}
            error={mutationAppointment.error}
          />
        )}
      </ContainerView>
    </SafeAreaView>
  );
};

export default CreateAppointment;
/*
<RNPickerSelect
  onValueChange={onChange}
  items={DOCTORS.map((item) => ({
    label: item.name,
    value: item.name,
  }))}
  value={value}
  placeholder={{ label: "Choose a doctor...", value: null }}
  useNativeAndroidPickerStyle={false}
  textInputProps={{
    className:
      "border rounded-md px-4 py-2 border-stone-700 font-semibold text-base text-white",
  }}
/>;
*/
