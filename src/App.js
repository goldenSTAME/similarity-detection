// src/App.js (modifications only)
import React, {useEffect, useState} from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation} from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import SelectImageWindow from "./components/SelectImageWindow/SelectImageWindow";
import DetailWindow from "./components/DetailWindow/DetailWindow";
import HistoryWindow from "./components/HistoryWindow/HistoryWindow"; // Add import
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

  return (
      <Router>
        <AppContent
            activeWindow={activeWindow}
            setActiveWindow={setActiveWindow}
            isDark={isDark}
            toggleTheme={toggleTheme}
        />
      </Router>
  );
}

// 新增 AppContent 组件处理路由和位置更新
function AppContent({ activeWindow, setActiveWindow, isDark, toggleTheme }) {
  const location = useLocation(); // useLocation() 被放在这里，确保在 Router 组件内

  // 路由变化时更新 activeWindow
  useEffect(() => {
    // 根据当前 URL 更新 activeWindow
    if (location.pathname === "/select-image") {
      setActiveWindow("Select Image");
    } else if (location.pathname === "/history") {
      setActiveWindow("History");
    } else if (location.pathname.startsWith("/detail")) {
      setActiveWindow("Details");
    }
  }, [location]); // 每次路由变化时更新 activeWindow

  return (
      <div className={`app-container ${isDark ? "dark" : "light"}`}>
        <Sidebar
            isDark={isDark}
            toggleTheme={toggleTheme}
            activeWindow={activeWindow}
            setActiveWindow={setActiveWindow}
        />
        <main className="main-content">
          <Routes>
            <Route path="" element={<SelectImageWindow />} />
            <Route path="/select-image" element={<SelectImageWindow />} />
            <Route path="/history" element={<HistoryWindow />} />
            <Route path="/details/:imageId?" element={<DetailWindow />} />
          </Routes>
        </main>
      </div>
  );
}

//   const location = useLocation(); // 用于监听路由变化
//
//   // 路由变化时更新 activeWindow
//   useEffect(() => {
//     // 根据当前 URL 更新 activeWindow
//     if (location.pathname === "/select-image") {
//       setActiveWindow("Select Image");
//     } else if (location.pathname === "/history") {
//       setActiveWindow("History");
//     } else if (location.pathname.startsWith("/detail")) {
//       setActiveWindow("Details");
//     }
//   }, [location]); // 每次路由变化时更新 activeWindow
//
//   // const renderWindowContent = () => {
//   //   switch (activeWindow) {
//   //     case "Select Image":
//   //       return <SelectImageWindow />;
//   //     case "History":
//   //       return <HistoryWindow />;
//   //     case "Details":
//   //       return <DetailWindow />;
//   //     // 其他窗口例如 History、Details 等可在此处添加对应组件
//   //     default:
//   //       return <div>默认窗口内容(该串语句用于测试github action是否正常使用）</div>;
//   //   }
//   // };
//
//   return (
//       <Router>
//         <div className={`app-container ${isDark ? "dark" : "light"}`}>
//           <Sidebar
//             isDark={isDark}
//             toggleTheme={toggleTheme}
//             activeWindow={activeWindow}
//             setActiveWindow={setActiveWindow}
//           />
//           <main className="main-content">
//             {/*{renderWindowContent()}*/}
//             <Routes>
//               <Route path="/select-image" element={<SelectImageWindow />} />
//               <Route path="/history" element={<HistoryWindow />} />
//               <Route path="/detail/:imageId" element={<DetailWindow />} />
//             </Routes>
//           </main>
//         </div>
//       </Router>
//   );
// }
export default App;