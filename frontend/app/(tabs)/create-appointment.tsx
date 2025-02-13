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
        if (
          error instanceof Error &&
          error.message === "access-token-expired"
        ) {
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

            throw new Error("Token refresh failed");
          }
        }
        throw new Error("An unexpected error is occured during get doctors");
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
      doctorId: "",
      description: undefined,
      slotId: "",
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
        if (
          error instanceof Error &&
          error.message === "access-token-expired"
        ) {
          console.log("Access token expired, refreshing token...");
          try {
            const newAccessToken = await fetchRefreshAccessToken(refreshToken);
            console.log(newAccessToken);
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

            throw new Error("Token refresh failed");
          }
        }

        throw new Error("An unexpected error is occured during creation");
      }
    },
    onSuccess: async () => {
      // Invalidate and refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["appointments"] }),
        queryClient.invalidateQueries({ queryKey: ["doctors"] }),
      ]);
      router.replace("/appointments", { relativeToDirectory: true });
      reset({ doctorId: "", description: undefined, slotId: "" });
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
