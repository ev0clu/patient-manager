import {
  getAccessToken,
  getRefreshToken,
  removeTokens,
} from "@/lib/secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthContextType = {
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  setRefreshToken: React.Dispatch<React.SetStateAction<string | null>>;
  clearTokenStorage: () => void;
  isLogged: boolean;
  setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo | null>>;
  userInfo: UserInfo | null;
};

const AuthContext = createContext<AuthContextType>({
  setAccessToken: () => {},
  setRefreshToken: () => {},
  clearTokenStorage: () => {},
  isLogged: false,
  setIsLogged: () => {},
  setUserInfo: () => {},
  userInfo: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();

      setAccessToken(accessToken);
      setRefreshToken(refreshToken);

      if (accessToken && refreshToken) {
        setIsLogged(true);
      }
    };

    initializeAuth();
  }, []);

  const clearTokenStorage = useCallback(() => {
    removeTokens();
    setAccessToken(null);
    setRefreshToken(null);
    setIsLogged(false);
    setUserInfo(null);
  }, [isLogged]);

  const contextValue = useMemo(
    () => ({
      setAccessToken,
      setRefreshToken,
      clearTokenStorage,
      isLogged,
      setIsLogged,
      setUserInfo,
      userInfo,
    }),
    [accessToken, refreshToken, isLogged, userInfo]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within a AuthProvider");
  }
  return context;
}
