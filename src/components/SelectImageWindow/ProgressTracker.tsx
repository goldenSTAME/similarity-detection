import React from 'react';
import { motion } from 'framer-motion';
import './ProgressTracker.css';

// Define loading states
export enum LoadingState {
  IDLE = 'idle',
  CONVERTING = 'converting',
  EXTRACTING = 'extracting',
  SEARCHING = 'searching',
  FETCHING = 'fetching',
  CANCELLED = 'cancelled',
  ERROR = 'error'
}

interface ProgressTrackerProps {
  currentState: LoadingState;
  progressMessage: string;
  isLoading: boolean;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentState,
  progressMessage,
  isLoading
}) => {
  // Define all the steps in order
  const steps = [
    { key: LoadingState.CONVERTING, label: "Converting Image" },
    { key: LoadingState.EXTRACTING, label: "Extracting Features" },
    { key: LoadingState.SEARCHING, label: "Finding Similar Images" },
    { key: LoadingState.FETCHING, label: "Loading Results" }
  ];

  // Find the current step index
  const currentStepIndex = steps.findIndex(step => step.key === currentState);

  // Don't render if not loading
  if (!isLoading && currentState !== LoadingState.ERROR && currentState !== LoadingState.CANCELLED) {
    return null;
  }

  return (
    <motion.div
      className="progress-tracker"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="progress-steps">
        {steps.map((step, index) => {
          // Determine the status of this step
          let status = "pending";
          if (index < currentStepIndex) status = "completed";
          if (index === currentStepIndex) status = "active";

          // Special states
          if (currentState === LoadingState.ERROR) status = index <= currentStepIndex ? "error" : "pending";
          if (currentState === LoadingState.CANCELLED) status = index <= currentStepIndex ? "cancelled" : "pending";

          return (
            <div key={step.key} className="step-container">
              <div className={`step-indicator ${status}`}>
                {status === "completed" ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="checkmark"
                  >
                    ✓
                  </motion.div>
                ) : status === "error" ? (
                  <motion.div className="error-icon">!</motion.div>
                ) : status === "cancelled" ? (
                  <motion.div className="cancelled-icon">×</motion.div>
                ) : (
                  <div className="step-number">{index + 1}</div>
                )}
              </div>
              <div className={`step-label ${status}`}>{step.label}</div>

              {index < steps.length - 1 && (
                <div className={`step-connector ${status === "completed" ? "completed" : ""}`}>
                  {status === "active" && (
                    <motion.div
                      className="progress-animation"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="progress-message">
        {currentState === LoadingState.ERROR ? (
          <div className="error-message">Error: {progressMessage || "Processing failed"}</div>
        ) : currentState === LoadingState.CANCELLED ? (
          <div className="cancelled-message">Cancelled: Search was stopped</div>
        ) : (
          <div className="status-message">{progressMessage}</div>
        )}
      </div>
    </motion.div>
  );
};

export default ProgressTracker;