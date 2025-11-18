import React from "react";
import { CheckCircle, Info, AlertCircle } from "lucide-react";

const MessageAlert = ({ message }) => {
  if (!message || !message.text) return null;

  const styles = {
    success: "bg-green-50 text-green-800 border-green-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
    error: "bg-red-50 text-red-800 border-red-200",
  };

  const Icon =
    message.type === "success"
      ? CheckCircle
      : message.type === "info"
        ? Info
        : AlertCircle;

  return (
    <div
      className={`mb-6 p-4 rounded-lg flex items-center gap-3 border ${styles[message.type]}`}
    >
      <Icon size={20} />
      <div className="text-sm text-gray-800">{message.text}</div>
    </div>
  );
};

export default MessageAlert;
