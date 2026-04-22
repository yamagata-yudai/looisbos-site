# Looisbos Official Website — Claude Setup

## プロジェクト概要

Looisbos（バンド）の公式ポートレートサイト。Windows XP風レトロデザイン。
HTML / CSS / Vanilla JavaScript のみで構築。GitHub Pages で本番運用中。

- **本番URL:** https://looisbos.com
- **リポジトリ:** GitHub Pages (main ブランチへの push で自動デプロイ)

## ファイル構成

```
index.html          # メインページ（全コンテンツ）
assets/
  css/style.css     # デザイン全般
  js/
    script.js       # インタラクション（ドラッグ、ナビ等）
    screensaver.js  # スクリーンセーバー
    audio_manager.js
  images/           # 画像・ジャケ写・フライヤー等
CNAME               # looisbos.com
README.md           # 編集ガイド（日本語）
```

## 開発フロー

1. **計画・実装:** このワークスペースで作業（worktree）
2. **ローカル確認:** `python3 -m http.server 8000` → http://localhost:8000
3. **本番デプロイ:** `git push origin main` → GitHub Pages が自動反映（数分）

## 主なコンテンツ構成（index.html）

| セクション | コメントタグ | 概要 |
|---|---|---|
| BIOS起動アニメ | `<!-- BIOS/Startup Sequence Overlay -->` | 約19行目 |
| ディスコグラフィ | `<!-- Discography Window (Winamp Style) -->` | 約92行目 |
| ニュース | `<!-- News Window -->` | 約220行目 |
| バイオグラフィ | `<!-- Biography Window -->` | 約257行目 |
| コンタクト | `<!-- Contact Window -->` | 約318行目 |

## デザイン方針

- Windows XP / Winamp 風 レトロUI
- シングルページ構成（index.html 一本）
- フレームワーク・ビルドツール不使用
- 音源配信リンクは `https://friendship.lnk.to/` を使用

## 注意事項

- **コメント追加不要** — コードは自己説明的に書く
- **依存関係追加禁止** — Vanilla JS のみ、npm/bundler 不使用
- **デプロイ前に必ずローカル確認** — `python3 -m http.server 8000`
- **画像追加時は最適化済みであること** — 表示速度に直結する
- **git push は確認を取ってから** — main への push が即本番反映
