---
title: "從 Vercel 搬到 Cloudflare Pages：我一天內把 15 個靜態站零成本遷移的完整紀錄"
description: "Vercel Pro 的 $20 credit 快燒完了，才發現是 cron job 每天空跑在吃費用。這篇完整記錄我如何診斷問題、把 15 個 Astro 靜態站從 Vercel 搬到 Cloudflare Pages，以及 DNS、GitHub Actions、Custom Domain 的實際操作細節。"
publishDate: 2026-03-14
category: "開發"
tags: ["Vercel", "Cloudflare Pages", "靜態網站部署", "GitHub Actions", "Astro", "建站費用優化"]
image: "https://lexcvcinmphkmavgswgn.supabase.co/storage/v1/object/public/veganote-images/freepik__-cloudflare-logo-vercel-logo-__3839.png"
faq:
  - q: "Vercel 靜態站搬到 Cloudflare Pages 難嗎？"
    a: "不難。Astro 純靜態站只需要設定 build command 和 output directory，整個流程大約 10-15 分鐘完成一個站。有 GitHub Actions 經驗的話更快。"
  - q: "Cloudflare Pages 免費方案有什麼限制？"
    a: "每月 500 次免費 build，對不需要每天自動發文的站來說完全夠用。流量和頻寬沒有上限，商業用途（AdSense、聯盟行銷）也明確允許。"
  - q: "Vercel 和 Cloudflare Pages 最大的差別是什麼？"
    a: "Vercel 每次 build 計費，適合動態 Next.js 應用；Cloudflare Pages build 免費，適合靜態站。如果你同時有動態和靜態站，兩個平台分工使用是最省錢的做法。"
---

## 前言

某天早上打開 Vercel，看到 Usage 頁面顯示 **$16.21 / $20.00**，距離帳單結算還有將近一個月。

我有一批 freetoolkit.cc 的子網域工具站——ft-image、ft-text、ft-seo……一共十幾個，全是 Astro 純靜態站，流量還很小，根本還在等 AdSense 核審。照理說幾乎不耗費用，但每個 project 都顯示 $0.55，加起來把 credit 吃掉大半。

查了一下才想到：**我之前設了每日自動發文的 cron job，但發文系統根本沒在跑，cron 卻每天在觸發 Vercel Function。** 就這樣，每天空跑，每天燒錢。



## Vercel Pro 計費方式，你一定要先搞懂

很多人以為付了 $20/月的 Pro，就是「另外再給你 $20 的免費額度」。**其實月費本身就是那個 credit，不是額外贈送的。**

每個 project 使用的頻寬、Edge Requests、Function 執行時間，超過免費配額後才開始扣那 $20。Credit 用完之後切換 on-demand 計費，你的站不會停，但帳單繼續跑。

所以如果你像我一樣，一個帳號放了十幾個 project，每個都有小額用量，加起來很快超標。**更關鍵的是：cron job 每次觸發都算 Function Invocation，就算什麼都沒做，一樣計費。**

另外有一點很多人不知道——**Vercel Hobby 免費方案明確禁止商業用途**，掛著 AdSense 或聯盟行銷的站放 Hobby 帳號有合規風險。這就是我當初升 Pro 的原因之一。



## 為什麼選 Cloudflare Pages，而不是另開 Vercel 免費帳號

直覺反應是再開一個 Vercel Hobby 帳號就好了，但這個方案有兩個問題：商業用途違規，以及流量暴增時站會直接暫停。

**Cloudflare Pages 的免費方案明確允許商業用途**，對靜態站的支援也非常完整。更重要的是，Cloudflare Pages 的 build 完全免費——這是關鍵差異。

Vercel 是「build 收費」，Cloudflare 是「build 免費」。對一個管十幾個靜態站的人來說，這個差異直接影響每個月的帳單。

此外我的域名 DNS 本來就在 Cloudflare 管理，綁定 Custom Domain 時會自動偵測、一鍵設定，不需要手動改 CNAME，省了很多麻煩。



## 搬移實際步驟

因為這些站都是純 Astro 靜態站，搬移起來非常乾淨。

### 第一步：Cloudflare Pages 建立專案

登入 Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git → 選對應的 GitHub repo。

Build 設定填：
- Framework preset：Astro
- Build command：`npm run build`
- Build output directory：`dist`

按下 Deploy，等 2-3 分鐘就完成了。

### 第二步：修改 GitHub Actions yml

原本的 yml 是用 `amondnet/vercel-action` 部署到 Vercel，換成 Cloudflare 版本：

```yaml
name: Scheduled Publish
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build site
        run: npm run build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          command: pages deploy dist --project-name=你的專案名稱


同時把 cron schedule 那兩行全部註解掉——現在改成 push 自動觸發，有發文才 build，沒有 push 就不跑。


### 第三步：設定 GitHub Secrets

每個 repo 的 Settings → Secrets → Actions 加入：
- `CF_API_TOKEN`：Cloudflare 的 API Token（Edit Cloudflare Workers 模板）
- `CF_ACCOUNT_ID`：Cloudflare Dashboard 右側邊欄的 Account ID


### 第四步：綁定 Custom Domain

Cloudflare Pages → 專案 → Custom Domains → 輸入子網域。因為 DNS 在 Cloudflare 管理，會自動偵測並設定，幾分鐘內生效，Custom Domain 狀態變成「使用中」就完成了。

### 第五步：確認正常後刪除 Vercel 專案

Custom Domain 顯示綠點「使用中」，代表流量已經切到 Cloudflare。這時候才去 Vercel 把舊的 project 刪掉，立刻止血。



## 搬移過程踩到的坑

**坑一：把域名 DNS 移到 Cloudflare 後，所有子網域立刻斷線。**

我把 `freetoolkit.cc` 的 nameserver 改到 Cloudflare 之後，才發現 Cloudflare 只掃描到主網域和少數記錄，十幾個子網域的 CNAME 全部消失，網站全部 404。

解法是馬上去 Cloudflare DNS 手動加回那些 CNAME 記錄，或直接在 Cloudflare Pages 設定 Custom Domain，它會自動建立 DNS 記錄。

**坑二：改 GitHub yml 觸發了 Vercel 自動 build。**

我在搬移期間改了很多 repo 的 yml 檔，每次 commit 都被 Vercel 偵測到，自動觸發 build，當天的 Build Minutes 直接衝到 $21，超過 $20 credit，產生 on-demand 費用。

教訓是：**要改 GitHub 檔案之前，先去 Vercel 把那個 project 刪掉，再回來改。** 搬移順序很重要。



## 搬完之後的架構

現在我的部署架構變成這樣：

**Cloudflare Pages（免費）：** 所有 Astro 靜態站，包含 ft- 工具系列、部落格站、展示頁面。

**Vercel Pro（$20/月）：** 只剩動態應用，包含 Next.js + Supabase 的寫文系統、有 API routes 的後端服務。

靜態站搬走之後，Vercel 的 $20 credit 只需要負擔幾個動態系統的 Function 費用，完全夠用，不會再超標。



## 結語

這次的整理讓我意識到一件事：**平台費用不是固定成本，是你的架構決策的結果。**

Vercel 是很好的平台，但它的計費模型對「一個人管很多站」的情況不友善——每個 project 獨立計費，量一多就容易爆。Cloudflare Pages 的免費 build 對靜態站來說是真正的零成本，不是假免費。

找對平台放對站，帳單自然降下來。

**架構設計的本質，就是讓每一塊錢花在刀口上。**

