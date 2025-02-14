import AppointmentItem from "@/components/AppointmentItem";
import ContainerView from "@/components/ContainerView";
import ErrorText from "@/components/ErrorText";
import { useAuthContext } from "@/context/AuthProvider";
import {
  fetchDeleteAppointment,
  fetchGetAllAppointments,
  fetchRefreshAccessToken,
} from "@/lib/fetch";
import {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from "@/lib/secure-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Appointments = () => {
  const queryClient = useQueryClient();
  const { setIsLogged } = useAuthContext();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const showDeleteAlert = (id: number) => {
    Alert.alert(
      "Are you absolutely sure to delete",
      "This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          style: "default",
          onPress: async () => {
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();

            if (!accessToken) throw new Error("Access token is missing");
            if (!refreshToken) throw new Error("Refresh token is missing");

            try {
              const body = await fetchDeleteAppointment(
                accessToken,
                refreshToken,
                id
              );

              queryClient.invalidateQueries({ queryKey: ["appointments"] });
              queryClient.invalidateQueries({ queryKey: ["appointment"] });
              queryClient.invalidateQueries({ queryKey: ["doctors"] });

              return body;
            } catch (error) {
              if (
                error instanceof Error &&
                error.message === "access-token-expired"
              ) {
                console.log("Access token expired, refreshing token...");
                try {
                  const accessToken = await fetchRefreshAccessToken(
                    refreshToken
                  );

                  if (!accessToken)
                    throw new Error("Unable to refresh access token");

                  saveAccessToken(accessToken);

                  const body = await fetchDeleteAppointment(
                    accessToken,
                    refreshToken,
                    id
                  );

                  queryClient.invalidateQueries({ queryKey: ["appointments"] });
                  queryClient.invalidateQueries({ queryKey: ["appointment"] });
                  queryClient.invalidateQueries({ queryKey: ["doctors"] });

                  return body;
                } catch (error) {
                  setIsLogged(false);

                  throw new Error("Token refresh failed");
                }
              }
              throw new Error("An unexpected error is occured");
            }
          },
        },
      ]
    );
  };

  const {
    data: appointments,
    isPending,
    error,
  } = useQuery<Appointment[], Error>({
    queryKey: ["appointments"],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();

      if (!accessToken) throw new Error("Access token is missing");
      if (!refreshToken) throw new Error("Refresh token is missing");

      try {
        const body = await fetchGetAllAppointments(accessToken, refreshToken);

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

            const body = await fetchGetAllAppointments(
              newAccessToken,
              refreshToken
            );

            return body;
          } catch (error) {
            setIsLogged(false);

            throw new Error("Token refresh failed");
          }
        }
        throw new Error("An unexpected error is occured");
      }
    },
  });

  if (isPending) {
    <SafeAreaView className="h-full">
      <ContainerView>
        <Text className="text-3xl font-bold text-white">Appointments</Text>
        <ActivityIndicator
          animating={isPending}
          color="#059669"
          size="large"
          className="ml-2"
        />
      </ContainerView>
    </SafeAreaView>;
  }

  return (
    <SafeAreaView className="h-full">
      <ContainerView className="justify-start">
        <Text className="text-3xl font-bold text-white mb-5">Appointments</Text>
        <View>
          {error && <ErrorText title={error.message} />}
          {appointments?.length === 0 ? (
            <View>
              <Text className="text-white/50">
                There is still no any appointments.
              </Text>
            </View>
          ) : (
            <View className="p-2 h-full">
              <FlatList
                data={appointments}
                renderItem={({ item }) => (
                  <AppointmentItem
                    item={item}
                    showDeleteAlert={showDeleteAlert}
                  />
                )}
                keyExtractor={(appointment) => appointment.id.toString()}
                ListHeaderComponent={() => (
                  <View className="flex p-1 gap-3 flex-row w-full justify-between bg-primary">
                    <View className="flex flex-row flex-1 justify-between">
                      <Text className="font-bold text-lg w-16 text-center text-white">
                        Doctor
                      </Text>
                      <Text className="font-bold text-lg w-40 text-center text-white">
                        Date
                      </Text>
                      <Text className="font-bold text-lg w-28 text-center text-white">
                        Status
                      </Text>
                    </View>
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              />
            </View>
          )}
        </View>
      </ContainerView>
    </SafeAreaView>
  );
};

export default Appointments;
