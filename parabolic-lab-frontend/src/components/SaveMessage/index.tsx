import { CheckCircle2, XCircle } from "lucide-react";
import clsx from "clsx";

export interface SaveMessage {
  type: "success" | "error";
  text: string;
}

interface SaveMessageBannerProps {
  message: SaveMessage | null;
}

const SaveMessageBanner = ({ message }: SaveMessageBannerProps) => {
  if (!message) return null;
  return (
    <div
      role="status"
      className={clsx(
        "alert shadow-sm",
        message.type === "success" ? "alert-success" : "alert-error",
      )}
    >
      {message.type === "success" ? (
        <CheckCircle2 size={20} />
      ) : (
        <XCircle size={20} />
      )}
      <span>{message.text}</span>
    </div>
  );
};

export default SaveMessageBanner;
