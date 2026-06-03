// Facebook JS SDK global type declarations
interface Window {
  FB: {
    init(options: {
      appId: string;
      cookie?: boolean;
      xfbml?: boolean;
      version: string;
    }): void;
    login(
      callback: (response: {
        authResponse?: {
          accessToken: string;
          userID: string;
          expiresIn: number;
          signedRequest: string;
        };
        status: string;
      }) => void,
      options?: { scope: string }
    ): void;
    logout(callback?: () => void): void;
    getLoginStatus(callback: (response: { status: string }) => void): void;
  };
  fbAsyncInit?: () => void;
}
