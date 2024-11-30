import axios from "axios";
import { useEffect } from "react";
import { redirect } from "react-router";

const OAUTH2_TOKEN_END_POINT = "https://oauth2.googleapis.com/token";
const CLIENT_ID = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_YOUTUBE_CLIENT_SECRET;
const STATE = import.meta.env.VITE_STATE;
const REDIRECT_BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export function YoutubeRedirect() {
  const url = new URL(window.location.href);

  useEffect(() => {
    // url.searchParams에 code가 있으면 토큰 요청
    if (url.searchParams.has("code")) handleGetTokenFromCode();
    // 없으면 리다이렉트
    else redirect("/youtube");
  }, []);

  const handleGetTokenFromCode = async () => {
    const state = url.searchParams.get("state");
    if (state !== STATE) {
      alert("state 값이 일치하지 않습니다.");
      return redirect("/youtube");
    }
    const code = url.searchParams.get("code");
    if (code) console.log("유튜브 code 요청 성공");

    const res = await axios({
      method: "POST",
      url: OAUTH2_TOKEN_END_POINT,
      data: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${REDIRECT_BASE_URL}/youtube/redirect`,
      },
    });
    if (res.data.access_token) console.log("유튜브 access token 요청 성공");
    if (res.data.refresh_token) console.log("유튜브 refresh token 요청 성공");
    localStorage.setItem("youtube_access_token", res.data.access_token);
    localStorage.setItem("youtube_refresh_token", res.data.refresh_token);
    return redirect("/youtube");
  };

  return <>리다이렉트</>;
}
