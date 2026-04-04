"use client";

import { rsvpAction } from "@/lib/actions/event-actions";

export function RsvpButtons({
  eventId,
  currentStatus,
}: {
  eventId: string;
  currentStatus?: string;
}) {
  const buttons = [
    { status: "attending", label: "参加する", color: "bg-green-600 hover:bg-green-700" },
    { status: "maybe", label: "未定", color: "bg-yellow-500 hover:bg-yellow-600" },
    { status: "cancel", label: "キャンセル", color: "bg-gray-400 hover:bg-gray-500" },
  ];

  return (
    <div className="flex gap-2">
      {buttons.map((btn) => {
        const isActive = currentStatus === btn.status;
        const show =
          btn.status === "cancel" ? !!currentStatus : !isActive;

        if (!show) return null;

        return (
          <form key={btn.status} action={rsvpAction}>
            <input type="hidden" name="eventId" value={eventId} />
            <input type="hidden" name="status" value={btn.status} />
            <button
              type="submit"
              className={`${
                isActive ? "ring-2 ring-offset-2" : ""
              } ${btn.color} text-white px-4 py-2 rounded-lg text-sm transition`}
            >
              {btn.label}
            </button>
          </form>
        );
      })}
      {currentStatus && (
        <span className="flex items-center text-sm text-gray-500 ml-2">
          現在: {currentStatus === "attending" ? "参加" : "未定"}
        </span>
      )}
    </div>
  );
}
