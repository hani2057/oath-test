import axios from "axios";
import { useEffect } from "react";
import { redirect } from "react-router";

const CLIENT_ID = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET;
const STATE = import.meta.env.VITE_STATE;
const REDIRECT_BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export function InstagramRedirect() {
  const url = new URL(window.location.href);

  useEffect(() => {
    // url.searchParams에 code가 있으면 토큰 요청
    if (url.searchParams.has("code")) handleGetTokenFromCode();
    // 없으면 리다이렉트
    else redirect("/instagram");
  }, []);

  const handleGetTokenFromCode = async () => {
    const state = url.searchParams.get("state");
    if (state !== STATE) {
      alert("state 값이 일치하지 않습니다.");
      return redirect("/instagram");
    }
    const code = url.searchParams.get("code");
    if (code) console.log("code 요청 성공");

    try {
      const shortAccessTokenRes = await axios({
        method: "POST",
        url: "/instagram-short",
        data: {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: "authorization_code",
          redirect_uri: `${REDIRECT_BASE_URL}/instagram/redirect`,
          code: code?.split("#")[0],
        },
      });
      if (shortAccessTokenRes.data[0].access_token)
        console.log("인스타그램 short lived access token 요청 성공");

      const longAccessTokenRes = await axios({
        method: "GET",
        url: "/instagram-long",
        params: {
          grant_type: "ig_exchange_token",
          client_secret: CLIENT_SECRET,
          access_token: shortAccessTokenRes.data[0].access_token,
        },
      });
      if (longAccessTokenRes.data[0].access_token)
        console.log("인스타그램 long lived access token 요청 성공");

      localStorage.setItem(
        "instagram_access_token",
        longAccessTokenRes.data[0].access_token
      );
      return redirect("/instagram");
    } catch (err) {
      console.error(err);
    }
  };

  return <>리다이렉트</>;
}
