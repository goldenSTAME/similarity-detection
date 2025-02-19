import React, { useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import SelectImageWindow from "./components/SelectImageWindow/SelectImageWindow";
import "./App.css";

function App() {
const [activeWindow, setActiveWindow] = useState("Select Image");
  const [isDark, setIsDark] = useState(() => {
    // 读取 localStorage 的保存值
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme !== null) {
      return savedTheme === "dark";
    }
    // 如果没有保存值则读取系统偏好防止出现bug
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newTheme = !prev;
      // 保存主题选择到 localStorage
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };


  const renderWindowContent = () => {
    switch (activeWindow) {
      case "Select Image":
        return <SelectImageWindow />;
      // 其他窗口例如 History、Details 等可在此处添加对应组件
      default:
        return <div>默认窗口内容(该串语句用于测试github action是否正常使用）</div>;
    }
  };

  return (
    <div className={`app-container ${isDark ? "dark" : "light"}`}>
      <Sidebar
        isDark={isDark}
        toggleTheme={toggleTheme}
        activeWindow={activeWindow}
        setActiveWindow={setActiveWindow}
      />
      <main className="main-content">
        {renderWindowContent()}
      </main>
    </div>
  );
}
export default App;