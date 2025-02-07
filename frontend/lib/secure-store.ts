import * as SecureStore from "expo-secure-store";
import { env } from "./env";

export const saveAccessToken = async (token: string) => {
  await SecureStore.setItemAsync(env.EXPO_PUBLIC_ACCESS_TOKEN_KEY, token);
};

export const saveRefreshToken = async (token: string) => {
  await SecureStore.setItemAsync(env.EXPO_PUBLIC_REFRESH_TOKEN_KEY, token);
};

export const getAccessToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(env.EXPO_PUBLIC_ACCESS_TOKEN_KEY);
};
export const getRefreshToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(env.EXPO_PUBLIC_REFRESH_TOKEN_KEY);
};

export const removeTokens = async () => {
  await SecureStore.deleteItemAsync(env.EXPO_PUBLIC_ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(env.EXPO_PUBLIC_REFRESH_TOKEN_KEY);
};
