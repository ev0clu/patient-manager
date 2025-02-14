import { ActivityIndicator, Text } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  updateAppointmentSchema,
  updateAppointmentType,
} from "@/schemas/appointmentSchema";
import { SafeAreaView } from "react-native-safe-area-context";
import ContainerView from "@/components/ContainerView";
import { useAuthContext } from "@/context/AuthProvider";
import ErrorText from "@/components/ErrorText";
import UpdateAppointmentForm from "@/components/UpdateAppointmentForm";
import {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from "@/lib/secure-store";
import {
  fetchGetAppointment,
  fetchPutUpdateAppointment,
  fetchRefreshAccessToken,
} from "@/lib/fetch";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect } from "react";

const Appointment = () => {
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams();
  const appointmentId = id as string;

  const { setIsLogged, userInfo } = useAuthContext();

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
    }, [])
  );

  const queryAppointment = useQuery<Appointment>({
    queryKey: ["appointment"],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();

      if (!accessToken) throw new Error("Access token is missing");
      if (!refreshToken) throw new Error("Refresh token is missing");

      try {
        const body = await fetchGetAppointment(
          accessToken,
          refreshToken,
          appointmentId
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

            if (!newAccessToken)
              throw new Error("Unable to refresh access token");

            saveAccessToken(newAccessToken);

            const body = await fetchGetAppointment(
              newAccessToken,
              refreshToken,
              appointmentId
            );

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
    setValue,
    formState: { errors },
  } = useForm<updateAppointmentType>({
    resolver: zodResolver(updateAppointmentSchema),
    defaultValues: {
      description: queryAppointment.data?.description,
      status: queryAppointment.data?.status,
    },
  });

  useEffect(() => {
    setValue("description", queryAppointment.data?.description);
    setValue("status", queryAppointment.data?.status);
  }, [queryAppointment.data]);

  const mutationAppointment = useMutation({
    mutationFn: async (data: updateAppointmentType) => {
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();

      if (!accessToken) throw new Error("Access token is missing");
      if (!refreshToken) throw new Error("Refresh token is missing");

      try {
        const body = await fetchPutUpdateAppointment(
          accessToken,
          refreshToken,
          data,
          appointmentId
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

            const body = await fetchPutUpdateAppointment(
              newAccessToken,
              refreshToken,
              data,
              appointmentId
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
        queryClient.invalidateQueries({ queryKey: ["appointment"] }),
        queryClient.invalidateQueries({ queryKey: ["doctors"] }),
      ]);
      router.replace("/appointments", { relativeToDirectory: true });
    },
  });

  const onSubmit = async (data: updateAppointmentType) => {
    await mutationAppointment.mutateAsync(data);
  };

  return (
    <SafeAreaView className="h-full">
      <ContainerView className="justify-start">
        <Text className="text-3xl font-bold text-white">
          Update Appointment
        </Text>
        {queryAppointment.error && (
          <ErrorText title={queryAppointment.error.message} />
        )}
        {queryAppointment.isPending ? (
          <SafeAreaView className="h-full">
            <ContainerView>
              <ActivityIndicator
                animating={queryAppointment.isPending}
                color="#059669"
                size="large"
                className="ml-2"
              />
            </ContainerView>
          </SafeAreaView>
        ) : queryAppointment.data === undefined ? (
          <Text className="text-3xl font-bold text-white/50">
            Appointment does not exist!
          </Text>
        ) : (
          <UpdateAppointmentForm
            errors={errors}
            control={control}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            submitting={mutationAppointment.isPending}
            userInfo={userInfo}
            appointment={queryAppointment.data}
            error={mutationAppointment.error}
          />
        )}
      </ContainerView>
    </SafeAreaView>
  );
};

export default Appointment;
