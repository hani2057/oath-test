import { NavLink } from "react-router";

export function App() {
  return (
    <>
      <h1>Oauth 연동 테스트</h1>
      <p>아래 링크에서 각각 테스트해보실 수 있습니다.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <NavLink to="/youtube">유튜브 테스트</NavLink>
        <NavLink to="/tiktok">틱톡 테스트</NavLink>
        <NavLink to="/instagram">인스타그램 테스트</NavLink>
      </div>
    </>
  );
}
