"use client";

import { deleteMemberAction } from "@/lib/actions/member-actions";

export function DeleteMemberButton({ memberId }: { memberId: string }) {
  return (
    <form action={deleteMemberAction}>
      <input type="hidden" name="id" value={memberId} />
      <button
        type="submit"
        className="text-red-500 hover:underline text-xs"
        onClick={(e) => {
          if (!confirm("この会員を削除しますか？")) {
            e.preventDefault();
          }
        }}
      >
        削除
      </button>
    </form>
  );
}
