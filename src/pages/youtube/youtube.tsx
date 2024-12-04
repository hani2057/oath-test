import axios from "axios";
import { useState } from "react";
import { Link } from "react-router";
import qs from "qs";

type TYouTubeChannel = {
  id: string;
  kind: string;
  snippet: {
    title: string;
  };
};

const OAUTH2_LOGIN_END_POINT = "https://accounts.google.com/o/oauth2/v2/auth";
const CLIENT_ID = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_YOUTUBE_CLIENT_SECRET;
const REDIRECT_BASE_URL = import.meta.env.VITE_APP_BASE_URL;
const SCOPE = [
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/youtube.upload",
].join(" ");
const STATE = import.meta.env.VITE_STATE;
const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const OAUTH2_REFRESH_END_POINT = "https://oauth2.googleapis.com/token";

export function Youtube() {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("youtube_access_token")
  );
  const [data, setData] = useState<{ items: TYouTubeChannel[] } | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

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
        Authorization: `Bearer ${localStorage.getItem("youtube_access_token")}`,
      },
    });
    console.log("채널 정보 조회 res", res);
    setData(res.data);
  };

  const handleUploadVideo = async () => {
    const fileInput = document.getElementById(
      "youtube-video"
    ) as HTMLInputElement;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      console.error("No file selected");
      return;
    }
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append(
      "metadata",
      new Blob(
        [
          JSON.stringify({
            snippet: {
              categoryId: "22",
              description: "Description of uploaded video.",
              title: "Test video upload.",
            },
            status: {
              privacyStatus: "private",
            },
          }),
        ],
        { type: "application/json;charset=UTF-8" }
      )
    );
    formData.append("file", file, file.name);

    try {
      const sessionRes = await axios({
        method: "post",
        url: "/youtube-upload",
        params: {
          uploadType: "resumable",
          part: "snippet,status",
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "youtube_access_token"
          )}`,
          "Content-Type": "application/json; charset=UTF-8",
          "Content-Length": file.size,
          "x-upload-content-length": file.size,
          "x-upload-content-type": "video/mp4",
        },
        data: formData,
      });
      console.log("동영상 업로드 세션 res", sessionRes);
      const location = sessionRes.headers.location;

      const uploadRes = await axios({
        method: "put",
        url: location,
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "youtube_access_token"
          )}`,
          "Content-Length": file.size,
          "Content-Type": "video/mp4",
        },
        data: file,
      });
      console.log("동영상 업로드 res", uploadRes);
      setVideoId(uploadRes.data.id);

      const uploadStatusCheckRes = await axios({
        method: "put",
        url: location,
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "youtube_access_token"
          )}`,
          "Content-Length": "0",
          "content-range": `bytes */${file.size}`,
        },
      });
      console.log("동영상 업로드 상태 체크 res", uploadStatusCheckRes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearFileInput = () => {
    const fileInput = document.getElementById(
      "youtube-video"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleClickRefreshToken = async () => {
    try {
      const res = await axios({
        method: "post",
        url: OAUTH2_REFRESH_END_POINT,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: qs.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          refresh_token: localStorage.getItem("youtube_refresh_token"),
          grant_type: "refresh_token",
        }),
      });
      if (res.data.access_token) console.log("유튜브 access token 요청 성공");
      localStorage.setItem("youtube_access_token", res.data.access_token);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClickReset = () => {
    localStorage.clear();
    setData(null);
    setAccessToken(null);
    setVideoId(null);
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
        {accessToken && <p>유튜브 access token 발급 완료</p>}
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <p>step 2.</p>
        <button onClick={handleGetYoutubeChannels}>
          유튜브 채널 정보 조회 api 호출
        </button>
        {data && <p>유튜브 채널 정보(채널명): {data.items[0].snippet.title}</p>}
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <p>step 3.</p>
        <p>동영상 업로드 api 호출</p>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <input type="file" id="youtube-video" />
          <div>
            <button onClick={handleUploadVideo}>동영상 업로드</button>
            <button onClick={handleClearFileInput}>파일 초기화</button>
            <button onClick={() => setVideoId(null)}>다시 하기</button>
          </div>
        </div>
        {videoId && <p>동영상 업로드 성공 videoId: {videoId}</p>}
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <p>refresh</p>
        <button onClick={handleClickRefreshToken}>토큰 재발급</button>
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <p>reset</p>
        <button onClick={handleClickReset}>전체 리셋</button>
      </div>
    </div>
  );
}
