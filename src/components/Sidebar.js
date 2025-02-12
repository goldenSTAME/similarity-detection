// import React, { useEffect } from "react";
import { motion } from "framer-motion";
// import confetti from "canvas-confetti";
import "./Sidebar.css";

function Sidebar({ isDark, toggleTheme }) {
  // 当 isDark 改变时触发粒子动画
  // useEffect(() => {
  //   confetti({
  //     particleCount: 25,         // 粒子数量
  //     spread: 70,                // 扩散角度
  //     origin: { x: 0.5, y: 0.5 }, // 爆炸中心位置（可根据 slider 的位置调整）
  //     colors: ["#ffcc00", "#ffffff", "#ff6666"], // 自定义粒子颜色
  //     scalar: 1,                 // 调整粒子整体大小
  //   });
  // }, [isDark]);

  const handleLightClick = () => {
    if (isDark) toggleTheme();
  };

  const handleDarkClick = () => {
    if (!isDark) toggleTheme();
  };

  // 图标的动画：旋转和缩放
  const iconVariants = {
    initial: { rotate: 0, scale: 1 },
    active: { rotate: 15, scale: 1.1 },
  };

  // 滑块的动画效果：平移、旋转、缩放
  const sliderAnimation = {
    x: isDark ? [0, 95, 90] : [90, -5, 0],
    rotate: isDark ? [0, 10, 0] : [0, -10, 0],
    scale: [1, 1.05, 1],
  };

  return (
    <aside className={`sidebar ${isDark ? "dark-mode" : "light-mode"}`}>
      {/* 头部区域 */}
      <div className="sidebar-header">
        <div className="logo-placeholder"></div>
      </div>

      {/* 菜单区域 */}
      <nav className="sidebar-menu">
        <ul className="menu-list">
          <li className="menu-item active">Select Image</li>
          <li className="menu-item">History</li>
          <li className="menu-item">Details</li>
          <li className="menu-item">Logs</li>
          <li className="menu-item">Setting</li>
          <li className="menu-item">Support</li>
        </ul>
      </nav>

      {/* 底部主题切换区域 */}
      <div className="sidebar-footer">
        <div className="segment-control-outer">
          <div className="segment-control">
            {/* 滑块 */}
            <motion.div
              className="slider"
              animate={sliderAnimation}
              transition={{
                x: { type: "spring", stiffness: 150, damping: 20 },
                rotate: { type: "spring", stiffness: 150, damping: 20 },
                scale: { duration: 0.3 },
              }}
            />

            {/* Light 按钮 */}
            <motion.button
              className={`segment-button ${!isDark ? "active" : ""}`}
              onClick={handleLightClick}
            >
              <motion.span
                className="button-text"
                animate={{ scale: !isDark ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.svg
                  key="light"
                  className="icon-svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  animate={!isDark ? "active" : "initial"}
                  variants={iconVariants}
                  transition={{ duration: 0.3 }}
                >
                  {/* 太阳的中心圆 */}
                  <circle cx="12" cy="12" r="6" />
                  {/* 太阳的辐射线 */}
                  <motion.g
                    animate={!isDark ? "active" : "initial"}
                    variants={{
                      initial: { opacity: 0 },
                      active: { opacity: 1 },
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" />
                    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" />
                    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" />
                    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" />
                  </motion.g>
                </motion.svg>
                Light
              </motion.span>
            </motion.button>

            {/* Dark 按钮 */}
            <motion.button
              className={`segment-button ${isDark ? "active" : ""}`}
              onClick={handleDarkClick}
            >
              <motion.span
                className="button-text"
                animate={{ scale: isDark ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.svg
                  key="dark"
                  className="icon-svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  animate={isDark ? "active" : "initial"}
                  variants={iconVariants}
                  transition={{ duration: 0.3 }}
                >
                  <defs>
                    <mask id="moonMask" maskUnits="userSpaceOnUse">
                      <rect x="0" y="0" width="24" height="24" fill="white" />
                      <motion.circle
                        className="mask-circle"
                        initial={{ cx: 10, cy: 0, r: 0 }}
                        animate={isDark ? { cx: 17, cy: 7, r: 6 } : { cx: 13, cy: 5, r: 0 }}
                        transition={{ duration: 0.3 }}
                        fill="black"
                      />
                    </mask>
                  </defs>
                  <motion.circle
                    cx="12"
                    cy="12"
                    fill="currentColor"
                    mask="url(#moonMask)"
                    initial={{ r: 6 }}
                    animate={isDark ? { r: 9 } : { r: 6 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.svg>
                Dark
              </motion.span>
            </motion.button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;