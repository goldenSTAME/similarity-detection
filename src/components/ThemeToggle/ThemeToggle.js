import React from "react";
import { motion } from "framer-motion";
import "./ThemeToggle.css";

function ThemeToggle({ isDark, toggleTheme }) {
  const iconVariants = {
    initial: { rotate: 0, scale: 1 },
    active: { rotate: 15, scale: 1.1 },
  };

  const sliderAnimation = {
    x: isDark ? 100 : 0,
  };

  const handleThemeClick = (isDarkTarget) => {
    if (isDark !== isDarkTarget) toggleTheme();
  };

  return (
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
  );
}

export default ThemeToggle;
