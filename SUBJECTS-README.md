# 三科主題研習及講義

- subject-catalog.js：建築結構、營建法規與實務及建築環境控制的科目代碼與主題關鍵字。
- subject-engine.js：讀取 quiz_data_years_v4.js，進行主題初分，保留特殊給分、隔離試卷說明、提示來源缺漏及附上承上題背景。原題庫檔案不會被改寫。
- subject-topics.html?subject=structure 或 law 或 environment：主題題庫。題目及選項常駐顯示，答案收合。
- subject-handouts.html?subject=structure 或 law 或 environment：講義列印及離線 HTML 下載，可選年份、主題、答案位置。
- 新增科目需更新 subject-catalog.js 及 portal-subjects.js，並先建立題庫資料。

分類是自動初分，review=true 或 other 題目應人工確認。公式符號、圖表及選項有缺漏時不自行補造；法規答案應依原考試年度核對。
