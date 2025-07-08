// components/Toast.tsx
import React, { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error";
  duration?: number;
};

const Toast: React.FC<ToastProps> = ({ message, type = "success", duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div
    
      style={{
        
        position: "fixed",
        top: 20,
        right: 20,
        padding: "12px 20px",
        background: type === "success" ? "#00c851" : "#ff4444",
        color: "#fff",
        borderRadius: "6px",
        fontWeight: "bold",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        zIndex: 9999,
      }}
    >
      {message}
    </div>
  );
};

export default Toast;
