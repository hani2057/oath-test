import { useEffect } from "react";
import { redirect } from "react-router";

export function InstagramRedirect() {
  const url = new URL(window.location.href);

  useEffect(() => {
    // url.searchParams에 code가 있으면 토큰 요청
    if (url.searchParams.has("code")) handleGetTokenFromCode();
    // 없으면 리다이렉트
    else redirect("/instagram");
  }, []);

  const handleGetTokenFromCode = async () => {
    const code = url.searchParams.get("code");
    if (code) console.log("code 요청 성공");

    // TODO: 인스타그램 access token 요청

    // if (res.data.access_token) console.log("인스타그램 access token 요청 성공");
    // if (res.data.refresh_token) console.log("인스타그램 refresh token 요청 성공");
    // localStorage.setItem("instagram_access_token", res.data.access_token);
    // localStorage.setItem("instagram_refresh_token", res.data.refresh_token);
    // return redirect("/instagram");
  };

  return <>리다이렉트</>;
}
