import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
// 保留 react-lottie 导入（未使用，注释化）
import Lottie from "react-lottie";
// 保留 lottie-web 导入（使用中）
import lottie from "lottie-web";
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
    "Logs": null,
  });

  const animationState = useRef({
    currentItem: null,
    pausedFrame: null,
    totalFrames: {
      "Select Image": selectImageAnimation.op - 1,
      "History": historyAnimation.op - 1,
      "Details": detailsAnimation.op - 1,
      "Logs": logsAnimation.op - 1,
    },
  });

  // 在组件挂载时加载动画（使用 lottie-web）
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.animation) {
        const container = document.getElementById(`lottie-${item.name}`);
        if (container) {
          lottieRefs.current[item.name] = lottie.loadAnimation({
            container,
            animationData: item.animation,
            loop: false,
            autoplay: false,
          });

          // 监听动画完成事件，重置播放状态
          lottieRefs.current[item.name].addEventListener("complete", () => {
            setIsLottiePlaying((prev) => ({ ...prev, [item.name]: false }));
            console.log(`动画 ${item.name} 播放完成，状态重置为未播放`);
          });
        }
      }
    });

    // 组件卸载时清理动画实例
    return () => {
      Object.values(lottieRefs.current).forEach((anim) => {
        if (anim) anim.destroy();
      });
    };
  }, []);

  // 主题切换逻辑
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

  // 点击菜单项时触发的函数，确保倍速播放且动画不被打断
  const handleItemMouseDown = (itemName) => {
    const anim = lottieRefs.current[itemName];
    if (!anim) {
      console.error(`动画实例 ${itemName} 不存在`);
      return;
    }

    // 如果动画正在播放，忽略此次点击
    if (isLottiePlaying[itemName]) {
      console.log(`动画 ${itemName} 正在播放，忽略此次点击`);
      return;
    }

    console.log(`触发 ${itemName} 动画播放`);
    anim.setSpeed(1.75); // 设置播放速度为 1.75 倍
    anim.goToAndStop(0); // 重置到第一帧
    anim.playSegments([0, anim.totalFrames - 1], true); // 从头播放到结束

    // 更新播放状态
    setIsLottiePlaying((prev) => ({ ...prev, [itemName]: true }));
  };

  // 恢复原有的鼠标按下和松开逻辑，注释化以便后续恢复
  /*
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
  */

  // 恢复 Lottie 动画的配置选项（未使用，注释化）
  /*
  const lottieOptions = (itemName) => ({
    animationData: menuItems.find((i) => i.name === itemName).animation,
    loop: false,
    autoplay: false,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
      progressiveLoad: true,
    },
  });
  */

  // 恢复动画完成后的回调（未使用，注释化）
  /*
  const handleAnimationComplete = (itemName) => {
    const anim = lottieRefs.current[itemName];
    if (anim) {
      anim.anim.setSpeed(1); // 可选：重置速度为 1 倍，视需求可删除
      console.log(`动画 ${itemName} 播放完成，速度重置为: ${anim.anim.animationSpeed || '未知'}`);
    }
    // 更新播放状态为未播放
    setIsLottiePlaying((prev) => ({ ...prev, [itemName]: false }));
    animationState.current.currentItem = null;
  };
  */

  return (
    <aside className={`sidebar ${isDark ? "dark-mode" : "light-mode"}`}>
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
              // 原有的 mouseUp 和 mouseLeave 事件，注释化以便后续恢复
              /*
              onMouseUp={() => item.animation && handleItemMouseUp(item.name)}
              onMouseLeave={() => item.animation && handleItemMouseUp(item.name)}
              */
            >
              {item.animation && (
                <div
                  id={`lottie-${item.name}`}
                  className={`lottie-container ${isDark ? "dark-lottie" : "light-lottie"}`}
                  style={{ width: 24, height: 24 }}
                />
              )}
              {/* 恢复使用 react-lottie's Lottie 组件，避免引用未定义变量 */}
              {/*{item.animation && (*/}
              {/*  <div className={`lottie-container ${isDark ? "dark-lottie" : "light-lottie"}`}>*/}
              {/*    <Lottie*/}
              {/*      ref={(ref) => (lottieRefs.current[item.name] = ref)}*/}
              {/*      options={{ animationData: item.animation, loop: false, autoplay: false }} // 静态值*/}
              {/*      height={24}*/}
              {/*      width={24}*/}
              {/*      isPaused={!isLottiePlaying[item.name]}*/}
              {/*      eventListeners={[{*/}
              {/*        eventName: "complete",*/}
              {/*        callback: () => {} // 空回调避免引用未定义变量*/}
              {/*      }]}*/}
              {/*    />*/}
              {/*  </div>*/}
              {/*)}*/}
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