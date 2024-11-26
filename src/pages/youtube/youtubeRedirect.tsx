import { useEffect } from "react";
import axios from "axios";

const OAUTH2_TOKEN_END_POINT = "https://oauth2.googleapis.com/token";
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
const STATE = import.meta.env.VITE_STATE;
const REDIRECT_BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export function YoutubeRedirect() {
  useEffect(() => {
    handleGetTokenFromCode();
  }, []);

  const handleGetTokenFromCode = async () => {
    const url = new URL(window.location.href);
    const state = url.searchParams.get("state");
    if (state !== STATE) {
      alert("state 값이 일치하지 않습니다.");
      return;
    }

    const code = url.searchParams.get("code");
    if (code) console.log("code 요청 성공");

    const res = await axios({
      method: "POST",
      url: OAUTH2_TOKEN_END_POINT,
      data: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${REDIRECT_BASE_URL}/youtube`,
      },
    });
    localStorage.setItem("access_token", res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);
    if (res.data.access_token) console.log("access token 요청 성공");
    if (res.data.refresh_token) console.log("refresh token 요청 성공");
  };

  return <>리다이렉트</>;
}
