// Looisbos チケット取り置きフォーム — Google Apps Script
//
// セットアップ手順:
//   1. Google スプレッドシートを新規作成し、そのIDをSPREADSHEET_IDに貼り付ける
//      （URLの https://docs.google.com/spreadsheets/d/【ここ】/edit の部分）
//   2. スプレッドシートの1行目にヘッダーを手動で入力しておく（任意）
//      → 受付日時 / 名前 / 枚数 / メールアドレス
//   3. このスクリプトをデプロイ:
//      [デプロイ] → [新しいデプロイ] → 種類: ウェブアプリ
//      → 実行ユーザー: 自分 / アクセスできるユーザー: 全員 → デプロイ
//   4. 発行されたWebアプリURLをtoritori.htmlのSCRIPT_URLに貼り付ける
//
// ※ メール送信には MailApp の権限が必要です（初回デプロイ時に Google が権限確認を求めます）

const SPREADSHEET_ID  = 'YOUR_SPREADSHEET_ID';
const NOTIFY_EMAIL    = 'rooibossanova@gmail.com';

const EVENT_NAME      = 'Siesta Bis';
const EVENT_DATE      = '2026年7月25日（土）OPEN 18:30 / START 19:00';
const EVENT_CHARGE    = '¥3,000（adv/door）';

function doPost(e) {
  try {
    const name    = e.parameter.name    || '';
    const tickets = Number(e.parameter.tickets) || 1;
    const email   = e.parameter.email   || '';
    const now     = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');

    // スプレッドシートに記録
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['受付日時', '名前', '枚数', 'メールアドレス']);
    }
    sheet.appendRow([now, name, tickets, email]);

    // 予約者への確認メール
    MailApp.sendEmail({
      to: email,
      subject: `【Looisbos / ${EVENT_NAME}】チケット取り置き確認`,
      body: [
        `${name} 様`,
        '',
        `Looisbos ワンマンライブ「${EVENT_NAME}」のチケット取り置きが完了しました。`,
        '',
        '■ ご予約内容',
        '────────────────────',
        `お名前：${name} 様`,
        `枚　数：${tickets}枚`,
        '────────────────────',
        '',
        '■ イベント情報',
        EVENT_NAME,
        `Looisbos`,
        EVENT_DATE,
        `charge ${EVENT_CHARGE}`,
        '',
        '当日は受付にてお名前をお伝えください。',
        'キャンセルの場合はDMにてご連絡ください。',
        '',
        '────────────────────',
        'Looisbos',
      ].join('\n'),
    });

    // 主催者への通知メール
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `【取り置き通知】${name} 様（${tickets}枚）`,
      body: [
        '新しい取り置きが入りました。',
        '',
        `お名前　：${name} 様`,
        `枚　数　：${tickets}枚`,
        `メール　：${email}`,
        `受付日時：${now}`,
      ].join('\n'),
    });

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
