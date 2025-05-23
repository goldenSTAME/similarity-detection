// src/components/Sidebar/Sidebar.js
import React, { useState, useEffect, useRef } from "react";
import lottie from "lottie-web";
import selectImageAnimation from "../../animations/selectImage.json";
import historyAnimation from "../../animations/history.json";
import detailsAnimation from "../../animations/details.json";
import logsAnimation from "../../animations/logs.json";
// 导入主题切换按钮组件
import ThemeToggle from "../ThemeToggle/ThemeToggle";

// 导入 logo 的 APNG 文件（支持 alpha 的动画，需浏览器支持 APNG）
import logoApng from "../../assets/images/logo.apng";
// 导入带有 alpha 的 fallback 图片（默认显示这张 PNG）
import fallbackImage from "../../assets/images/logo_fallback.png";

// 保留原有 CSS 引入
import "./Sidebar.css";

// 引入 react-router-dom 的 useNavigate 钩子
import { useNavigate } from "react-router-dom";

const menuItems = [
  { name: "Select Image", animation: selectImageAnimation, framePause: 22, path: "/select-image" },
  { name: "History", animation: historyAnimation, framePause: 23, path: "/history" },
  { name: "Details", animation: detailsAnimation, framePause: 23, path: "/details" },
  { name: "Administrator", animation: logsAnimation, framePause: 20, adminOnly: true, path: "/admin" },
  { name: "Support", animation: null, path: "/support" }, // Moved after Administrator
  { name: "Settings", animation: null, path: "/settings" },
];

// 更新函数参数，添加 allowThemeToggleOnly 来控制菜单项的可用性
function Sidebar({
                   isDark,
                   toggleTheme,
                   activeWindow,
                   setActiveWindow,
                   user,
                   onLogout,
                   allowThemeToggleOnly = false
                 }) {
  const [isLottiePlaying, setIsLottiePlaying] = useState({
    "Select Image": false,
    "History": false,
    "Details": false,
    "Administrator": false,
  });

  // 用于检测浏览器是否支持 APNG
  const [apngSupported, setApngSupported] = useState(false);

  // 标记当前是否在播放 APNG（8 秒时长内）
  const [showApng, setShowApng] = useState(false);

  // 8秒播放的定时器引用
  const apngTimerRef = useRef(null);

  const lottieRefs = useRef({
    "Select Image": null,
    "History": null,
    "Details": null,
    "Administrator": null,
  });

  const animationState = useRef({
    currentItem: null,
    pausedFrame: null,
    totalFrames: {
      "Select Image": selectImageAnimation.op - 1,
      "History": historyAnimation.op - 1,
      "Details": detailsAnimation.op - 1,
      "Administrator": logsAnimation.op - 1,
    },
  });

  // 创建 navigate 实例
  const navigate = useNavigate();

  // 检测 APNG 支持情况
  useEffect(() => {
    function checkAPNGSupport(callback) {
      const img = new Image();
      img.onload = function () {
        // 如果加载成功，就认为支持 APNG
        callback(true);
      };
      img.onerror = function () {
        callback(false);
      };
      // 使用一个小尺寸的 APNG data URI（有效的 APNG 数据）
      img.src =
        "data:image/apng;base64,AAACAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAGAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAA//8AAP//AAD//wAA";
    }
    checkAPNGSupport((supported) => {
      setApngSupported(supported);
    });
  }, []);

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

    // 组件卸载时清理动画实例 & 定时器
    return () => {
      Object.values(lottieRefs.current).forEach((anim) => {
        if (anim) anim.destroy();
      });
      // 新增：清理 8 秒定时器
      clearTimeout(apngTimerRef.current);
    };
  }, []);

  // 图标动画变量
  const iconVariants = {
    initial: { rotate: 0, scale: 1 },
    active: { rotate: 15, scale: 1.1 },
  };

  const handleItemClick = (itemName, itemPath) => {
    setActiveWindow(itemName);

    // 只有在未被锁定时才执行导航
    if (!allowThemeToggleOnly && itemPath) {
      navigate(itemPath);
    }
  };

  // 恢复原有的鼠标按下和松开逻辑，使动画效果更完整
  const handleItemMouseDown = (itemName) => {
    // 在锁定模式下，不播放动画
    if (allowThemeToggleOnly) return;

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

  // 添加mouseUp和mouseLeave事件处理函数，增强交互体验
  const handleItemMouseUp = (itemName) => {
    // 可以在这里添加鼠标抬起效果，如果需要
  };

  const handleItemMouseLeave = (itemName) => {
    // 可以在这里添加鼠标离开效果，如果需要
  };

  // 鼠标移入时立即切换APNG并播放8秒，即使鼠标离开也不停止
  const handleMouseEnterLogo = () => {
    if (!apngSupported) return; // 不支持 APNG，就一直显示fallback

    // 如果已经在8秒播放中，就不再重复触发
    if (showApng) {
      console.log("APNG 已在播放中，忽略再次触发");
      return;
    }

    console.log("开始 8 秒 APNG 播放");
    setShowApng(true);

    // 8 秒后自动还原
    apngTimerRef.current = setTimeout(() => {
      console.log("8 秒结束，切回 fallback PNG");
      setShowApng(false);
    }, 8000);
  };

  // 检查菜单项是否应禁用
  const isItemDisabled = (itemName) => {
    return allowThemeToggleOnly && itemName !== "Theme Toggle";
  };

  // 检查菜单项是否应隐藏（管理员专属功能）
  const shouldShowMenuItem = (item) => {
    // 如果不是管理员专属项，或者用户是管理员，则显示
    return !item.adminOnly || (user && user.role === 'admin');
  };

  return (
      <aside className={`sidebar ${isDark ? "dark-mode" : "light-mode"}`}>
        {/* 头部 Logo，使用 APNG 动画或 fallback 图片 */}
        <div className="sidebar-header">
          <div className="logo-container">
            {apngSupported ? (
                showApng ? (
                    <img
                        className="logo-video"
                        src={logoApng}
                        alt="APNG Logo"
                    />
                ) : (
                    <img
                        className="logo-video"
                        src={fallbackImage}
                        alt="Fallback Logo"
                        onMouseEnter={handleMouseEnterLogo}
                    />
                )
            ) : (
                // 不支持 APNG，则一直是 fallback
                <img className="logo-video" src={fallbackImage} alt="Fallback Logo" />
            )}
          </div>
        </div>

        {/* 菜单区域 - 当allowThemeToggleOnly为true时，菜单项被禁用 */}
        <nav className={`sidebar-menu ${allowThemeToggleOnly ? 'menu-disabled' : ''}`}>
          <ul className="menu-list">
            {menuItems.filter(shouldShowMenuItem).map((item, index, filteredItems) => (
                <React.Fragment key={item.name}>
                  <li
                      className={`menu-item ${
                          activeWindow === item.name ? "active" : ""
                      } ${isItemDisabled(item.name) ? "disabled" : ""}`}
                      onClick={() => handleItemClick(item.name, item.path)}
                      onMouseDown={() =>
                          item.animation && handleItemMouseDown(item.name)
                      }
                      onMouseUp={() => item.animation && handleItemMouseUp(item.name)}
                      onMouseLeave={() => item.animation && handleItemMouseLeave(item.name)}
                  >
                    {item.animation && (
                        <div
                            id={`lottie-${item.name}`}
                            className={`lottie-container ${
                                isDark ? "dark-lottie" : "light-lottie"
                            }`}
                            style={{ width: 24, height: 24 }}
                        />
                    )}
                    <span>{item.name}</span>
                  </li>
                  {index === 3 && filteredItems.length > 4 && <div className="menu-divider" />}
                </React.Fragment>
            ))}
          </ul>
        </nav>

        {/* 主题切换按钮 - 独立组件，始终保持可用 */}
        <div className="sidebar-footer">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </div>
      </aside>
  );
}

export default Sidebar;