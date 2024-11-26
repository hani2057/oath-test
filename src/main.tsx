import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import { Youtube } from "./pages/youtube/youtube.tsx";
import { Tiktok } from "./pages/tiktok/tiktok.tsx";
import { Instagram } from "./pages/instagram/instagram.tsx";
import { YoutubeRedirect } from "./pages/youtube/youtubeRedirect.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
        <Route path="youtube">
          <Route index element={<Youtube />} />
          <Route path="redirect" element={<YoutubeRedirect />} />
        </Route>
        <Route path="tiktok" element={<Tiktok />} />
        <Route path="instagram" element={<Instagram />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
