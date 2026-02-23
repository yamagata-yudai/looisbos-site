# Looisbos 公式ウェブサイト

**Looisbos** のオフィシャルサイトです。Windows XP風のレトロなデザインで、HTML / CSS / Vanilla JavaScript のみで構築されています。

---

## 目次

1. [ファイル構成](#ファイル構成)
2. [ローカルでの起動方法](#ローカルでの起動方法)
3. [各セクションの編集方法](#各セクションの編集方法)
   - [ニュース（最新情報）](#ニュース最新情報)
   - [ディスコグラフィ（音源リスト）](#ディスコグラフィ音源リスト)
   - [バイオグラフィ（メンバー紹介）](#バイオグラフィメンバー紹介)
   - [コンタクト（問い合わせ先）](#コンタクト問い合わせ先)
   - [起動アニメーション（BIOSテキスト）](#起動アニメーションbiosテキスト)
4. [デザインのカスタマイズ](#デザインのカスタマイズ)
5. [GitHubへのデプロイ方法](#githubへのデプロイ方法)

---

## ファイル構成

```
ポートレートサイト/
├─ index.html                  # メインページ（全セクションが入っている）
├─ assets/
│   ├─ css/
│   │   └─ style.css           # デザイン全般のスタイル
│   ├─ js/
│   │   ├─ script.js           # インタラクション（ドラッグ、リンク等）
│   │   └─ screensaver.js      # スクリーンセーバーのアニメーション
│   └─ images/
│       ├─ logo.png            # バンドロゴ
│       ├─ artist.jpg          # ヒーロー画像
│       ├─ ScienceChildren.jpg # Science Children のジャケ写
│       ├─ rooms.jpg           # rooms のジャケ写
│       ├─ vase.jpeg           # vase のジャケ写
│       ├─ chairs.jpg          # chairs のジャケ写
│       └─ flyer_0329.jpg      # ライブフライヤー
└─ README.md
```

> **編集する主なファイルは `index.html` だけです。**

---

## ローカルでの起動方法

ターミナルで以下を実行：

```bash
# サイトのフォルダに移動
cd ~/Desktop/ポートレートサイト

# ローカルサーバーを起動
python3 -m http.server 8000
```

ブラウザで [http://localhost:8000](http://localhost:8000) を開くと確認できます。

> `Ctrl + C` でサーバーを停止できます。

---

## 各セクションの編集方法

`index.html` をテキストエディタ（VSCode など）で開いて編集します。

---

### ニュース（最新情報）

**場所：** `index.html` の `<!-- News Window -->` から始まるブロック（約220行目付近）

```html
<!-- ↓ ここから1件のニュース -->
<article class="news-item">
    <span class="news-date">2026.03.29 (Sun)</span>       <!-- 日付 -->
    <h3 class="news-title">ライブタイトル</h3>             <!-- タイトル -->
    <p class="news-excerpt">
        open:15:00 / start:15:30<br>                       <!-- 時間 -->
        adv:¥3800 / door:¥4300<br><br>                    <!-- 料金 -->

        [ACT]<br>
        Looisbos<br>                                       <!-- 出演者 -->

        <img src="assets/images/flyer_xxxx.jpg"            <!-- フライヤー画像 -->
            style="max-width: 50%;">

        <a href="チケットURL" target="_blank">             <!-- チケットリンク -->
            Ticket Reservation
        </a>
    </p>
</article>
<!-- ↑ ここまで -->
```

**ニュースを追加する場合：** `<article class="news-item">` ～ `</article>` のブロックごとコピーして、日付・タイトル・内容を書き換えます。

**フライヤー画像を変更する場合：** `assets/images/` フォルダに画像ファイルを入れて、`src="assets/images/ファイル名.jpg"` の部分を書き換えます。

---

### ディスコグラフィ（音源リスト）

**場所：** `index.html` の `<!-- Discography Window (Winamp Style) -->` から始まるブロック（約92行目付近）

音源1件分のブロックはこうなっています：

```html
<!-- Release: タイトル -->
<div class="disco-item" style="display: flex; gap: 15px; ...">
    <img src="assets/images/ジャケ写.jpg" alt="タイトル"
        style="width: 100px; height: 100px;">     <!-- ジャケット画像 -->
    <div>
        <h3>タイトル</h3>                          <!-- 音源タイトル -->
        <p>EP / 2024.01.01</p>                    <!-- 種別 & リリース日 -->
        <ul>
            <li>1. 曲名</li>                       <!-- 収録曲 -->
            <li>2. 曲名</li>
        </ul>
        <a href="https://friendship.lnk.to/xxxx" target="_blank"
            style="...">🎵 Listen on Streaming</a> <!-- 配信リンク -->
    </div>
</div>
```

#### 配信リンクの変更

| ボタンテキスト | URL例 |
|---|---|
| Listen on Streaming | `https://friendship.lnk.to/xxxx` (複数サービス対応) |
| Listen on Spotify | `https://open.spotify.com/album/xxxx` |

`href="..."` の部分を書き換えるだけでOKです。

#### 新しい音源を追加する場合

既存の `<div class="disco-item">` ブロックをコピーして一番上に貼り付け、内容を書き換えます。ジャケット画像は `assets/images/` フォルダに入れてください。

---

### バイオグラフィ（メンバー紹介）

**場所：** `<!-- Biography Window -->` から始まるブロック（約257行目付近）

```html
<!-- バンド紹介文 -->
<div class="bio-text">
    <strong>Looisbos</strong><br><br>
    英語の紹介文...<br>
    日本語の紹介文...
</div>

<!-- メンバー1人分 -->
<div class="member">
    <i class="fa-solid fa-drum"></i>   <!-- アイコン（fa-drumなどを変更） -->
    <h3 class="member-name">Gatta</h3> <!-- 名前 -->
    <p class="member-role">Vocal & Drums</p> <!-- 担当 -->
</div>
```

アイコンは [Font Awesome](https://fontawesome.com/icons) のアイコン名を使用。例：`fa-guitar`、`fa-drum`、`fa-microphone` など。

---

### コンタクト（問い合わせ先）

**場所：** `<!-- Contact Window -->` から始まるブロック（約318行目付近）

```html
<!-- 送信先メールアドレスの変更 -->
<div style="...">
    rooibossanova@gmail.com    ← ここに表示されるアドレス
</div>
```

また、同じファイルの `<script>` タグ内にある `sendMail` 関数でも変更が必要です：

```javascript
const mailtoLink = 'mailto:rooibossanova@gmail.com?...'
//                          ↑ ここも同じアドレスに変更
```

> **Send(S) ボタンを押すと：** 件名・本文が自動でセットされた状態でメールアプリが起動します。

---

### 起動アニメーション（BIOSテキスト）

**場所：** `<!-- BIOS/Startup Sequence Overlay -->` から始まるブロック（約19行目）

```html
<!-- BIOSっぽいテキスト -->
<div id="bios-screen" class="bios-screen">
    <p>Antigravity BIOS V4.0...</p>          <!-- テキストを自由に変更OK -->
    <p>Copyright (C) 2026, Looisbos Corporation</p>
    <p>Main Processor : Looisbos 526MHz</p>
    ...
</div>

<!-- XPっぽいローディング画面 -->
<p>Copyright © Looisbos Tea Room Records, Inc. All rights reserved.</p>
```

テキストはすべて自由に変更できます。

---

## デザインのカスタマイズ

`assets/css/style.css` を編集します。

| 変更したいもの | 探すキーワード |
|---|---|
| 背景画像 | `background-image` |
| ウィンドウの色 | `.window` |
| タスクバーの色 | `.header` |
| フォント | `font-family` |
| ボタンの色 | `.btn-submit` |

---

## GitHubへのデプロイ方法

変更をGitHubに反映させるには、ターミナルで以下を実行：

```bash
cd ~/Desktop/ポートレートサイト

# 変更の確認
git status

# 全ファイルをステージング
git add -A

# コミット（変更内容のメモ）
git commit -m "変更内容の説明"

# GitHubに反映
git push origin main
```

GitHubにプッシュすると、数分以内に [https://looisbos.com](https://looisbos.com) に自動で反映されます。

---

> 何か分からないことがあれば気軽に聞いてね 🍵
