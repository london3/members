import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "1025"),
  secure: process.env.SMTP_SECURE === "true",
  ...(process.env.SMTP_USER
    ? {
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
    : {}),
});

const FROM_ADDRESS =
  process.env.MAIL_FROM || "会員管理システム <noreply@example.com>";

export async function sendMail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  await transporter.sendMail({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
  });
}

export function buildEventInviteHtml(params: {
  memberName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventDescription: string;
  attendUrl: string;
  maybeUrl: string;
  declineUrl: string;
}): string {
  const dateStr = new Date(params.eventDate).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h2 style="color: #2563eb;">イベントのご案内</h2>
  <p>${params.memberName} さん</p>
  <p>以下のイベントへのご参加をお待ちしております。</p>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1e40af;">${params.eventTitle}</h3>
    <p style="margin: 4px 0;"><strong>日時:</strong> ${dateStr}</p>
    <p style="margin: 4px 0;"><strong>場所:</strong> ${params.eventLocation}</p>
    <p style="margin-top: 12px; white-space: pre-wrap;">${params.eventDescription}</p>
  </div>

  <p>以下のボタンから出欠をお知らせください：</p>

  <div style="margin: 24px 0; text-align: center;">
    <a href="${params.attendUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; margin: 4px;">参加する</a>
    <a href="${params.maybeUrl}" style="display: inline-block; background: #eab308; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; margin: 4px;">未定</a>
    <a href="${params.declineUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; margin: 4px;">不参加</a>
  </div>

  <p style="font-size: 12px; color: #94a3b8;">このメールは会員管理システムから自動送信されています。</p>
</body>
</html>`;
}

export function buildEventReminderHtml(params: {
  memberName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventDescription: string;
  rsvpStatus: string | null;
  eventUrl: string;
}): string {
  const dateStr = new Date(params.eventDate).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusLabels: Record<string, string> = {
    attending: "参加",
    maybe: "未定",
    declined: "不参加",
  };
  const statusText = params.rsvpStatus
    ? `あなたの回答: <strong>${statusLabels[params.rsvpStatus] || params.rsvpStatus}</strong>`
    : "まだ出欠の回答がありません";

  return `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h2 style="color: #f59e0b;">⏰ イベントリマインド（明日開催）</h2>
  <p>${params.memberName} さん</p>
  <p>明日のイベントのリマインドです。</p>

  <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #92400e;">${params.eventTitle}</h3>
    <p style="margin: 4px 0;"><strong>日時:</strong> ${dateStr}</p>
    <p style="margin: 4px 0;"><strong>場所:</strong> ${params.eventLocation}</p>
    <p style="margin-top: 12px; white-space: pre-wrap;">${params.eventDescription}</p>
  </div>

  <p style="margin: 16px 0;">${statusText}</p>

  <div style="margin: 24px 0; text-align: center;">
    <a href="${params.eventUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none;">イベント詳細を見る</a>
  </div>

  <p style="font-size: 12px; color: #94a3b8;">このメールは会員管理システムから自動送信されています。</p>
</body>
</html>`;
}
