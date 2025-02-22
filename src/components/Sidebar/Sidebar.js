import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Lottie from "react-lottie";
import selectImageAnimation from "../animations/selectImage.json";
import historyAnimation from "../animations/history.json";
import detailsAnimation from "../animations/details.json";
import logsAnimation from "../animations/logs.json";
import "./Sidebar.css";

const menuItems = [
  { name: "Select Image", animation: selectImageAnimation, framePause: 22 },
  { name: "History", animation: historyAnimation, framePause: 23 },
  { name: "Details", animation: detailsAnimation, framePause: 23 },
  { name: "Logs", animation: logsAnimation, framePause: 20 },
  { name: "Setting", animation: null },
  { name: "Support", animation: null },
];

function Sidebar({ isDark, toggleTheme, activeWindow, setActiveWindow }) {
  const [isLottiePlaying, setIsLottiePlaying] = useState({
    "Select Image": false,
    "History": false,
    "Details": false,
    "Logs": false,
  });

  const lottieRefs = useRef({
    "Select Image": null,
    "History": null,
    "Details": null,
    "Logs": null
  });

  const animationState = useRef({
    currentItem: null,
    pausedFrame: null,
    totalFrames: {
      "Select Image": selectImageAnimation.op - 1,
      "History": historyAnimation.op - 1,
      "Details": detailsAnimation.op - 1,
      "Logs": logsAnimation.op - 1
    }
  });

  // 主题切换
  const handleThemeClick = (isDarkTarget) => {
    if (isDark !== isDarkTarget) toggleTheme();
  };

  const iconVariants = {
    initial: { rotate: 0, scale: 1 },
    active: { rotate: 15, scale: 1.1 },
  };

  const sliderAnimation = {
    x: isDark ? 90 : 0,
  };

  const handleItemClick = (itemName) => {
    setActiveWindow(itemName);
  };

  const handleItemMouseDown = (itemName) => {
    const anim = lottieRefs.current[itemName];
    if (!anim || isLottiePlaying[itemName]) return;

    animationState.current.currentItem = itemName;
    anim.anim.stop();
    anim.anim.playSegments([0, menuItems.find(i => i.name === itemName).framePause], true);

    setIsLottiePlaying(prev => ({ ...prev, [itemName]: true }));
  };

  const handleItemMouseUp = (itemName) => {
    const state = animationState.current;
    if (!state.currentItem || state.currentItem !== itemName) return;

    const anim = lottieRefs.current[itemName];
    if (!anim?.anim) return;

    const currentFrame = Math.min(
      anim.anim.currentFrame,
      state.totalFrames[itemName]
    );

    anim.anim.setSpeed(1.75);
    anim.anim.playSegments([
      currentFrame,
      state.totalFrames[itemName]
    ], true);
  };

  const handleAnimationComplete = (itemName) => {
    lottieRefs.current[itemName]?.anim.setSpeed(1);
    setIsLottiePlaying(prev => ({ ...prev, [itemName]: false }));
    animationState.current.currentItem = null;
  };

  const lottieOptions = (itemName) => ({
    animationData: menuItems.find(i => i.name === itemName).animation,
    loop: false,
    autoplay: false,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
      progressiveLoad: true
    }
  });

  return (
    <aside className={`sidebar ${isDark ? "dark-mode" : "light-mode"}`}>
      {/* 保持原有DOM结构不变 */}
      <div className="sidebar-header">
        <div className="logo-placeholder"></div>
      </div>

      <nav className="sidebar-menu">
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li
              key={item.name}
              className={`menu-item ${activeWindow === item.name ? "active" : ""}`}
              onClick={() => handleItemClick(item.name)}
              onMouseDown={() => item.animation && handleItemMouseDown(item.name)}
              onMouseUp={() => item.animation && handleItemMouseUp(item.name)}
              onMouseLeave={() => item.animation && handleItemMouseUp(item.name)}
            >
              {item.animation && (
                <div className={`lottie-container ${isDark ? "dark-lottie" : "light-lottie"}`}>
                  <Lottie
                    ref={(ref) => (lottieRefs.current[item.name] = ref)}
                    options={lottieOptions(item.name)}
                    height={24}
                    width={24}
                    isPaused={!isLottiePlaying[item.name]}
                    eventListeners={[{
                      eventName: "complete",
                      callback: () => handleAnimationComplete(item.name)
                    }]}
                  />
                </div>
              )}
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="segment-control-outer">
          <div className="segment-control">
            <motion.div
              className="slider"
              initial={false}
              animate={sliderAnimation}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
            />

            <motion.button
              className={`segment-button ${!isDark ? "active" : ""}`}
              onClick={() => handleThemeClick(false)}
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
                  <circle cx="12" cy="12" r="6" />
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

            <motion.button
              className={`segment-button ${isDark ? "active" : ""}`}
              onClick={() => handleThemeClick(true)}
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
                        animate={
                          isDark
                            ? { cx: 17, cy: 7, r: 6 }
                            : { cx: 13, cy: 5, r: 0 }
                        }
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