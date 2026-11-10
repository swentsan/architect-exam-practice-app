/* 新增科目可在 LEARNING_SUBJECTS 追加入口；主題設定集中於 subject-catalog.js。 */
window.LEARNING_SUBJECTS = [
  {
    "id": "architect-exam",
    "title": "建築師考古題",
    "english": "EXAM PRACTICE",
    "description": "從歷年試題開始練習，依年份選擇科目，逐題作答、判分與回顧錯題。",
    "meta": [
      "100–114 年",
      "四科練習"
    ],
    "href": "exam.html",
    "action": "進入考古題",
    "icon": "plan",
    "secondary": []
  },
  {
    "id": "construction",
    "title": "構造專題",
    "english": "BUILDING CONSTRUCTION",
    "description": "沿著材料、工法、性能與管理，按施工主題研讀考題，搭配題目與答案講義。",
    "meta": [
      "15 個主題",
      "1,200 題"
    ],
    "href": "construction-topics.html",
    "action": "進入構造專題",
    "icon": "section",
    "secondary": [
      {
        "text": "題目與答案講義",
        "href": "construction-handouts.html"
      }
    ]
  },
  {
    "id": "structure",
    "title": "建築結構專題",
    "english": "STRUCTURAL ENGINEERING",
    "description": "從材料力學、結構分析到耐震設計，依主題練習歷年試題。",
    "meta": [
      "15 個主題",
      "600 題"
    ],
    "href": "subject-topics.html?subject=structure",
    "action": "進入結構專題",
    "icon": "section",
    "secondary": [
      {
        "text": "題目與答案講義",
        "href": "subject-handouts.html?subject=structure"
      }
    ]
  },
  {
    "id": "law",
    "title": "營建法規與實務專題",
    "english": "BUILDING LAW AND PRACTICE",
    "description": "從建築管理、土地使用到採購實務，依考試主題整理歷年法規題。",
    "meta": [
      "19 個主題",
      "1,200 題"
    ],
    "href": "subject-topics.html?subject=law",
    "action": "進入法規專題",
    "icon": "plan",
    "secondary": [
      {
        "text": "題目與答案講義",
        "href": "subject-handouts.html?subject=law"
      }
    ]
  },
  {
    "id": "environment",
    "title": "建築環境控制專題",
    "english": "BUILDING ENVIRONMENTAL CONTROL",
    "description": "從熱光音環境到設備與節能，依主題串聯建築環控的歷年考題。",
    "meta": [
      "15 個主題",
      "600 題"
    ],
    "href": "subject-topics.html?subject=environment",
    "action": "進入環控專題",
    "icon": "section",
    "secondary": [
      {
        "text": "題目與答案講義",
        "href": "subject-handouts.html?subject=environment"
      }
    ]
  }
];
