import { toast } from "sonner";

const defaultStyles = {
  success: { style: { background: "#10B981", color: "white" } },
  error: { style: { background: "#EF4444", color: "white" } },
  warning: { style: { background: "#FFB528", color: "black" } },
  info: { style: { background: "#3B82F6", color: "white" } },
};

export const useCustomToast = () => {
  const showToast = (content, type = "default", options = {}) => {
    const toastOptions = {
      ...defaultStyles[type],
      ...options,
    };
    toast[type]
      ? toast[type](content, toastOptions)
      : toast(content, toastOptions);
  };

  return {
    success: (content, options) => showToast(content, "success", options),
    error: (content, options) => showToast(content, "error", options),
    warning: (content, options) => showToast(content, "warning", options),
    info: (content, options) => showToast(content, "info", options),
    custom: (content, options) => showToast(content, "default", options),
  };
};
