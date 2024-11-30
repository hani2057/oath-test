import { useState } from "react";
import { Link } from "react-router";

const OAUTH2_LOGIN_END_POINT = "https://www.instagram.com/oauth/authorize";
const CLIENT_ID = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
const REDIRECT_BASE_URL = import.meta.env.VITE_APP_BASE_URL;
const STATE = import.meta.env.VITE_STATE;

export function Instagram() {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("instagram_access_token")
  );

  const handleOauthLogIn = () => {
    const paramsObj = {
      enable_fb_login: "0",
      force_authentication: "1",
      client_id: CLIENT_ID,
      redirect_uri: `${REDIRECT_BASE_URL}/instagram/redirect`,
      response_type: "code",
      scope:
        "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish",
      state: STATE,
    };

    const params = new URLSearchParams(paramsObj).toString();

    window.location.href = `${OAUTH2_LOGIN_END_POINT}?${params}`;
  };

  const handleClickReset = () => {
    localStorage.clear();
    setAccessToken(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Link to="/">
        <button style={{ width: "5rem", height: "2rem" }}>홈으로</button>
      </Link>
      <div style={{ display: "flex", gap: "1rem" }}>
        <p>step 1.</p>
        <button onClick={handleOauthLogIn}>인스타그램 로그인</button>
        {accessToken && <p>인스타그램 access token 발급 완료</p>}
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <p>reset</p>
        <button onClick={handleClickReset}>다시 하기</button>
      </div>
    </div>
  );
}
