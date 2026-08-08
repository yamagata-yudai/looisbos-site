// Looisbos チケット取り置きフォーム — Google Apps Script（複数イベント対応）
//
// セットアップ手順（すべて rooibossanova@gmail.com で作業してください）:
//   1. 記録先スプレッドシート「Looisbos チケット取り置き管理」から
//      [拡張機能] → [Apps Script] を開き、このコードを貼り付ける
//   2. デプロイ:
//      [デプロイ] → [新しいデプロイ] → 種類: ウェブアプリ
//      → 実行ユーザー: 自分 / アクセスできるユーザー: 全員 → デプロイ
//   3. 発行されたWebアプリURLを toritori.html の SCRIPT_URL に貼り付ける
//
// イベントを追加するときは toritori.html の EVENTS に1件足すだけ。
// このスクリプトの再デプロイは不要（イベントごとのタブは自動生成されます）。
//
// ※ メール送信には MailApp の権限が必要です（初回デプロイ時に Google が権限確認を求めます）

// https://docs.google.com/spreadsheets/d/1HLSDeWqhHk7W1pLmMOlaYZfeWvisT94w91N3yZgDMcY/edit
const SPREADSHEET_ID = '1HLSDeWqhHk7W1pLmMOlaYZfeWvisT94w91N3yZgDMcY';
const NOTIFY_EMAIL   = 'rooibossanova@gmail.com';

const HEADERS     = ['受付日時', '名前', '枚数', 'メールアドレス'];
const MAX_TICKETS = 10;

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};

    const eventId = String(p.eventId || '').trim();
    if (!/^[a-z0-9_-]{1,40}$/.test(eventId)) {
      throw new Error('不正なイベントIDです');
    }

    const name  = sanitize(p.name, 60);
    const email = sanitize(p.email, 120);
    if (!name) throw new Error('お名前が入力されていません');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      throw new Error('メールアドレスの形式が不正です');
    }

    const tickets = Math.min(Math.max(parseInt(p.tickets, 10) || 1, 1), MAX_TICKETS);

    const eventName   = sanitize(p.eventName, 80) || eventId;
    const eventDate   = sanitize(p.eventDate, 80);
    const eventVenue  = sanitize(p.eventVenue, 80);
    const eventCharge = sanitize(p.eventCharge, 40);

    const now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');

    // 同時送信で行がずれないようにロックを取る
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      getEventSheet(eventId).appendRow([now, name, tickets, email]);
    } finally {
      lock.releaseLock();
    }

    sendConfirmationMail({ name, email, tickets, eventName, eventDate, eventVenue, eventCharge });
    sendNotifyMail({ name, email, tickets, eventName, now });

    return json({ result: 'success' });
  } catch (err) {
    return json({ result: 'error', message: err.toString() });
  }
}

// イベントIDのタブを取得。無ければヘッダー付きで新規作成する
function getEventSheet(eventId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(eventId);

  if (!sheet) {
    sheet = ss.insertSheet(eventId);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 160);
    sheet.setColumnWidth(4, 220);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sendConfirmationMail(d) {
  const lines = [
    `${d.name} 様`,
    '',
    `Looisbos「${d.eventName}」のチケット取り置きが完了しました。`,
    '',
    '■ ご予約内容',
    '────────────────────',
    `お名前：${d.name} 様`,
    `枚　数：${d.tickets}枚`,
    '────────────────────',
    '',
    '■ イベント情報',
    d.eventName,
  ];

  if (d.eventDate)   lines.push(d.eventDate);
  if (d.eventVenue)  lines.push(d.eventVenue);
  if (d.eventCharge) lines.push(`charge ${d.eventCharge}`);

  lines.push(
    '',
    '当日は受付にてお名前をお伝えください。',
    'キャンセルの場合はDMにてご連絡ください。',
    '',
    '────────────────────',
    'Looisbos'
  );

  MailApp.sendEmail({
    to: d.email,
    subject: `【Looisbos / ${d.eventName}】チケット取り置き確認`,
    body: lines.join('\n'),
  });
}

function sendNotifyMail(d) {
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: `【取り置き通知】${d.eventName} — ${d.name} 様（${d.tickets}枚）`,
    body: [
      '新しい取り置きが入りました。',
      '',
      `イベント：${d.eventName}`,
      `お名前　：${d.name} 様`,
      `枚　数　：${d.tickets}枚`,
      `メール　：${d.email}`,
      `受付日時：${d.now}`,
    ].join('\n'),
  });
}

// 改行を潰してヘッダーインジェクションを防ぎ、長さを制限する
function sanitize(value, maxLength) {
  return String(value || '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
