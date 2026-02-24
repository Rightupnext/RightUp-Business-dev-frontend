/**
 * Helper to calculate live working hours (excluding breaks)
 * @param {Object} group - The task group object containing time fields
 * @returns {string} - Formatted working hours (e.g., "8h 30m")
 */
export const calculateLiveWorkingHours = (group) => {
    if (!group || !group.timeIn) return '0h 0m';

    const toDate = (timeStr) => {
        if (!timeStr) return null;
        const date = new Date();

        if (timeStr.includes(" ")) {
            const [time, modifier] = timeStr.split(" ");
            let [hours, minutes] = time.split(":").map(Number);
            if (modifier === "PM" && hours !== 12) hours += 12;
            if (modifier === "AM" && hours === 12) hours = 0;
            date.setHours(hours, minutes, 0, 0);
        } else {
            const parts = timeStr.split(":");
            const hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);
            const seconds = parts[2] ? parseInt(parts[2], 10) : 0;
            date.setHours(hours, minutes, seconds, 0);
        }
        return date;
    };

    const start = toDate(group.timeIn);
    const end = group.timeOut ? toDate(group.timeOut) : new Date();
    let totalMs = end - start;

    // Subtract completed breaks
    const breaks = [
        { in: group.MGBreakIn, out: group.MGBreakOut },
        { in: group.LunchbreakIn, out: group.LunchbreakOut },
        { in: group.EveBreakIn, out: group.EveBreakOut },
    ];

    breaks.forEach(({ in: breakIn, out: breakOut }) => {
        if (breakIn && breakOut) {
            const breakDuration = toDate(breakOut) - toDate(breakIn);
            totalMs -= breakDuration;
        } else if (breakIn && !breakOut) {
            // Active break - subtract till now
            const breakDuration = new Date() - toDate(breakIn);
            totalMs -= breakDuration;
        }
    });

    if (totalMs <= 0) return '0h 0m';

    const totalMinutes = Math.floor(totalMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
};

/**
 * Format time-only string to IST
 * @param {string} timeString - HH:mm:ss or HH:mm AM/PM
 * @returns {string} - Formatted time
 */
export const formatToISTTime = (timeString) => {
    if (!timeString) return "-";

    // If already in 12-hour format with AM/PM, it might be from toLocaleTimeString
    if (timeString.includes("AM") || timeString.includes("PM")) return timeString;

    const date = new Date(`1970-01-01T${timeString}Z`); // Treat as UTC
    if (isNaN(date)) return timeString;

    return date.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

/**
 * Format full date to IST string
 * @param {string} dateString 
 * @returns {string}
 */
export const formatToISTDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
};
