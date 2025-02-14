import React from "react";
import { motion } from "framer-motion";
import "./Sidebar.css";

function Sidebar({ isDark, toggleTheme, activeWindow, setActiveWindow }) {
  const handleLightClick = () => {
    if (isDark) toggleTheme();
  };

  const handleDarkClick = () => {
    if (!isDark) toggleTheme();
  };

  // 图标动画（旋转、缩放）
  const iconVariants = {
    initial: { rotate: 0, scale: 1 },
    active: { rotate: 15, scale: 1.1 },
  };

  // 滑块动画（平移、旋转、缩放）
const sliderAnimation = {
  x: isDark ? 90 : 0,
  rotate: 0,
  scale: 1
};

  const menuItems = [
    { name: "Select Image", icon: null },
    { name: "History", icon: "history" },
    { name: "Details", icon: null },
    { name: "Logs", icon: null },
    { name: "Setting", icon: null },
    { name: "Support", icon: null },
  ];

  return (
    <aside className={`sidebar ${isDark ? "dark-mode" : "light-mode"}`}>
      {/* 头部区域 */}
      <div className="sidebar-header">
        <div className="logo-placeholder"></div>
      </div>

      {/* 菜单区域 */}
      <nav className="sidebar-menu">
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li
              key={item.name}
              className={`menu-item ${activeWindow === item.name ? "active" : ""}`}
              onClick={() => setActiveWindow(item.name)}
            >
              {item.icon && (
                <span className="material-symbols-outlined icon-history">
                  {item.icon}
                </span>
              )}
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* 底部主题切换区域 */}
      <div className="sidebar-footer">
        <div className="segment-control-outer">
          <div className="segment-control">
            {/* 滑块 */}
            <motion.div
                className="slider"
                initial={false}
                animate={sliderAnimation}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 20
                }}
            />

            {/* Light 按钮 */}
            <motion.button
                className={`segment-button ${!isDark ? "active" : ""}`}
                onClick={handleLightClick}
            >
              <motion.span
                  className="button-text"
                  animate={{scale: !isDark ? 1.05 : 1}}
                  transition={{duration: 0.3}}
              >
                <motion.svg
                    key="light"
                    className="icon-svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    animate={!isDark ? "active" : "initial"}
                    variants={iconVariants}
                    transition={{duration: 0.3}}
                >
                  <circle cx="12" cy="12" r="6"/>
                  <motion.g
                      animate={!isDark ? "active" : "initial"}
                      variants={{
                        initial: {opacity: 0},
                        active: {opacity: 1},
                      }}
                      transition={{duration: 0.3}}
                  >
                    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2"/>
                    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2"/>
                    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2"/>
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
                  animate={{scale: isDark ? 1.05 : 1}}
                  transition={{duration: 0.3}}
              >
                <motion.svg
                    key="dark"
                    className="icon-svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    animate={isDark ? "active" : "initial"}
                    variants={iconVariants}
                    transition={{duration: 0.3}}
                >
                  <defs>
                    <mask id="moonMask" maskUnits="userSpaceOnUse">
                      <rect x="0" y="0" width="24" height="24" fill="white"/>
                      <motion.circle
                          className="mask-circle"
                          initial={{cx: 10, cy: 0, r: 0}}
                          animate={
                            isDark
                                ? {cx: 17, cy: 7, r: 6}
                                : {cx: 13, cy: 5, r: 0}
                          }
                          transition={{duration: 0.3}}
                          fill="black"
                      />
                    </mask>
                  </defs>
                  <motion.circle
                      cx="12"
                      cy="12"
                      fill="currentColor"
                      mask="url(#moonMask)"
                      initial={{r: 6}}
                      animate={isDark ? {r: 9} : {r: 6}}
                      transition={{duration: 0.3}}
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