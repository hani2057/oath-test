import axios from "axios";
import { useState } from "react";
import { Link } from "react-router";

type TYouTubeChannel = {
  id: string;
  kind: string;
  snippet: {
    title: string;
  };
};

export function Youtube() {
  const OAUTH2_LOGIN_END_POINT = "https://accounts.google.com/o/oauth2/v2/auth";
  const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
  const REDIRECT_BASE_URL = import.meta.env.VITE_APP_BASE_URL;
  const SCOPE = "https://www.googleapis.com/auth/youtube.force-ssl";
  const STATE = import.meta.env.VITE_STATE;
  const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

  const [data, setData] = useState<{ items: TYouTubeChannel[] } | null>(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );

  const handleOauthLogIn = () => {
    localStorage.clear();

    const paramsObj = {
      client_id: CLIENT_ID,
      redirect_uri: `${REDIRECT_BASE_URL}/youtube/redirect`,
      response_type: "code",
      scope: SCOPE,
      access_type: "offline", // refresh token을 받기 위해 설정
      state: STATE,
      include_granted_scopes: "true",
      prompt: "consent", // 동의 화면을 항상 표시하도록 설정
    };

    const params = new URLSearchParams(paramsObj).toString();

    window.location.href = `${OAUTH2_LOGIN_END_POINT}?${params}`;
  };

  const handleGetYoutubeChannels = async () => {
    const res = await axios({
      method: "GET",
      url: `${YOUTUBE_API_BASE_URL}/channels`,
      params: {
        part: "snippet",
        mine: "true",
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    console.log("res", res);
    setData(res.data);
  };

  const handleClickReset = () => {
    localStorage.clear();
    setData(null);
    setAccessToken(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Link to="/">
        <button style={{ width: "5rem", height: "2rem" }}>홈으로</button>
      </Link>
      <div>
        <p>테스트 조건</p>
        <p>
          1. 동영상 업로드는 크레딧이 너무 많이 소모되어 채널명 조회 api 로
          테스트 구성
        </p>
        <p>
          2. 테스트앱으로는 구글 클라우드 프로젝트당 100건, 유저 1명당
          25회까지만 리프레시 토큰 발급이 제한되어 있어 발급 한도 초과시 새로
          프로젝트 생성해야 함.
        </p>
        <p>(response에서 ‘invalid_grant’ 응답이 오면 김하늬에게 알려주세요.)</p>
        <p>
          3. POC여서 클라이언트로만 구성(서버 없음). DB는 로컬스토리지로
          대체해서 적용
        </p>
        <p>
          4. 테스트 프로젝트에서는 기 등록된 사용자만 접근 가능하므로 테스트하실
          구글 계정을 김하늬에게 알려주세요. 계정 등록 이후 테스트 가능합니다.
        </p>
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <p>step 1.</p>
        <button onClick={handleOauthLogIn}>구글 로그인</button>
        {accessToken && <p>access token 발급 완료</p>}
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <p>step 2.</p>
        <button onClick={handleGetYoutubeChannels}>유튜브 api 호출</button>
        {data && <p>유튜브 채널 정보(채널명): {data.items[0].snippet.title}</p>}
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <p>reset</p>
        <button onClick={handleClickReset}>다시 하기</button>
      </div>
    </div>
  );
}
