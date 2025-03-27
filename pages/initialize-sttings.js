// pages/initialize-settings.js
import { useEffect } from "react";
import { initializeGlobalSettings } from "../scripts/initializeSettings";

export default function InitSettingsPage() {
  useEffect(() => {
    initializeGlobalSettings();
  }, []);

  return <div>초기 설정 실행됨. 콘솔을 확인하세요.</div>;
}