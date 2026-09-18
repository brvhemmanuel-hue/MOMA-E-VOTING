type AlertType = "success" | "error" | "info" | "warning";

const styles: Record<AlertType, string> = {
  success: "alert-success",
  error: "alert-error",
  info: "alert-info",
  warning: "alert-warning",
};

export function AlertBox({ type, message }: { type: AlertType; message: string }) {
  if (!message) return null;
  return <div className={styles[type]}>{message}</div>;
}
