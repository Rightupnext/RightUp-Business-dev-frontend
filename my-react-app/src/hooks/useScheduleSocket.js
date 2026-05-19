import { useEffect } from "react";
import socket from "../socket/socket";

const useScheduleSocket = ({
  userId,
  onCreated,
  onUpdated,
  onDeleted,
}) => {

  useEffect(() => {

    if (!userId) return;

    // JOIN ONLY ONCE
    socket.emit("join", userId);

    console.log("👤 Joined Room:", userId);

    // =====================
    // HANDLERS
    // =====================

    const handleCreated = (data) => {
      console.log("📌 Schedule Created", data);
      onCreated?.(data);
    };

    const handleUpdated = (data) => {
      console.log("✏️ Schedule Updated", data);
      onUpdated?.(data);
    };

    const handleDeleted = (data) => {
      console.log("🗑️ Schedule Deleted", data);
      onDeleted?.(data);
    };

    // REMOVE OLD LISTENERS
    socket.off("scheduleCreated", handleCreated);
    socket.off("scheduleUpdated", handleUpdated);
    socket.off("scheduleDeleted", handleDeleted);

    // ADD LISTENERS
    socket.on("scheduleCreated", handleCreated);
    socket.on("scheduleUpdated", handleUpdated);
    socket.on("scheduleDeleted", handleDeleted);

    return () => {
      socket.off("scheduleCreated", handleCreated);
      socket.off("scheduleUpdated", handleUpdated);
      socket.off("scheduleDeleted", handleDeleted);
    };

  }, [userId]);

};

export default useScheduleSocket;