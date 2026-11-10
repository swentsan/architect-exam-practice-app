# 建築師學習入口

網站首頁為 index.html，考古題四科練習位於 exam.html。

新增科目時，編輯 portal-subjects.js 的 LEARNING_SUBJECTS 陣列，依既有格式追加項目，提供科目名稱、簡介、相對路徑及選用的講義連結。首頁會自動增加卡片並更新專區數量。新增科目的 href 須指向已建立的 HTML 檔案；不要將尚未完成的科目放入陣列。

所有頁面維持同層相對路徑，可在 GitHub Pages 或 NAS 離線使用。首頁不載入大型題庫，進入個別科目後才載入。
