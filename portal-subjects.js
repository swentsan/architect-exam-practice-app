/* 新增科目：在陣列追加一筆。id 不重複，href 指向科目的入口頁；
   secondary 可留空。新增檔案後維持所有路徑為相對路徑，供 GitHub Pages 與 NAS 離線使用。 */
window.LEARNING_SUBJECTS = [
  {
    id: "architect-exam",
    title: "建築師考古題",
    english: "EXAM PRACTICE",
    description: "從歷年試題開始練習，依年份選擇科目，逐題作答、判分與回顧錯題。",
    meta: ["100–114 年", "四科練習"],
    href: "exam.html",
    action: "進入考古題",
    icon: "plan",
    secondary: []
  },
  {
    id: "construction",
    title: "構造專題",
    english: "BUILDING CONSTRUCTION",
    description: "沿著材料、工法、性能與管理，按施工主題研讀考題，搭配題目與答案講義。",
    meta: ["15 個主題", "1,200 題"],
    href: "construction-topics.html",
    action: "進入構造專題",
    icon: "section",
    secondary: [{text: "題目與答案講義", href: "construction-handouts.html"}]
  }
];
