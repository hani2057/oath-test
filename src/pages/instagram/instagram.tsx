import axios from "axios";
import { useState } from "react";
import { Link } from "react-router";

const OAUTH2_LOGIN_END_POINT = "https://www.instagram.com/oauth/authorize";
const CLIENT_ID = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
const REDIRECT_BASE_URL = import.meta.env.VITE_APP_BASE_URL;
const STATE = import.meta.env.VITE_STATE;
const INSTAGRAM_API_BASE_URL = "https://graph.instagram.com/v21.0";
const VIDEO_URL =
  "https://s3.ap-northeast-2.amazonaws.com/dev.honeydevelop.com/assets/test.mp4";

export function Instagram() {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("instagram_access_token")
  );
  const [userData, setUserData] = useState<{
    id: string;
    username: string;
  } | null>(null);
  const [videoUploadCompleted, setVideoUploadCompleted] = useState(false);

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

  const handleGetUserName = async () => {
    try {
      const res = await axios({
        method: "get",
        url: `${INSTAGRAM_API_BASE_URL}/me`,
        params: {
          fields: "id,username",
          access_token: accessToken,
        },
      });
      setUserData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadVideo = async () => {
    try {
      const containerInitRes = await axios({
        method: "post",
        url: "/instagram-media-init",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        data: {
          media_type: "VIDEO",
          video_url: VIDEO_URL,
        },
      });
      const containerId = containerInitRes.data.id;

      const containerPublishRes = await axios({
        method: "post",
        url: "/instagram-media-publish",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        data: {
          creation_id: containerId,
        },
      });
      if (containerPublishRes.data.id) setVideoUploadCompleted(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClickReset = () => {
    localStorage.clear();
    setAccessToken(null);
    setUserData(null);
    setVideoUploadCompleted(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Link to="/">
        <button style={{ width: "5rem", height: "2rem" }}>홈으로</button>
      </Link>
      <div>
        <p>테스트 조건</p>
        <p>
          1. POC여서 클라이언트로만 구성(서버 없음). DB는 로컬스토리지로
          대체해서 적용
        </p>
        <p>
          2. 테스트 프로젝트에서는 기 등록된 사용자만 접근 가능하므로 테스트하실
          인스타그램 계정을 김하늬에게 알려주세요. 프로페셔널 계정이어야 합니다.
          계정 등록 이후 테스트 가능합니다.
        </p>
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <p>step 1.</p>
        <button onClick={handleOauthLogIn}>인스타그램 로그인</button>
        {accessToken && <p>인스타그램 access token 발급 완료</p>}
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <p>step 2.</p>
        <button onClick={handleGetUserName}>
          인스타그램 유저 정보 조회 api 호출
        </button>
        {userData && <p>인스타그램 계정 이름: {userData.username}</p>}
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <p>step 3.</p>
        <button onClick={handleUploadVideo}>
          인스타그램 동영상 업로드 api 호출
        </button>
        {videoUploadCompleted && <p>동영상 업로드 성공</p>}
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <p>reset</p>
        <button onClick={handleClickReset}>다시 하기</button>
      </div>
    </div>
  );
}
