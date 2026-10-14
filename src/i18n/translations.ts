export const translations = {
  zh: {
    appName: '倒数日',

    emptyTitle: '还没有倒数日',
    emptySubtitle: '点击 + 添加你的第一个倒数日',

    daysLeft: '还剩 {n} 天',
    daysAgo: '{n} 天前',
    daysSince: '已经 {n} 天',
    daysUntil: '还有 {n} 天',
    todayBang: '🎉 今天到了！',

    typeCountdown: '倒数日',
    typeCountup: '计日',

    milestoneAt: '🎉 第 {value} 天里程碑！',
    milestoneApproaching: '⏳ 再 {days} 天到达 {value} 天',

    fieldTitle: '标题',
    titlePlaceholder: '例如：暑假旅行',
    titleRequired: '请输入标题',
    fieldDate: '日期',
    fieldType: '类型',
    fieldColor: '颜色',
    previewPlaceholderTitle: '事件标题',
    addEvent: '添加倒数日',
    saveChanges: '保存修改',
    deleteEvent: '删除此倒数日',

    cancel: '取消',
    delete: '删除',
    deleteConfirmTitle: '删除此倒数日？',
    deleteConfirmMessage: '"{title}" 将被永久删除。',

    newEventTitle: '新建倒数日',
    editEventTitle: '编辑倒数日',
    eventNotFound: '未找到该事件',
    detailTitle: '详情',

    past: '已过去',
    remaining: '还有',
    todayIsText: '就是今天！',
    dayUnit: '天',
    unitWeek: '周',
    unitMonth: '个月',
    unitYear: '年',
    approxPrefix: '约 ',
    preciseToSecond: '精确到秒',
    convertWeeks: '换算成周',
    convertMonths: '换算成月',
    convertYears: '换算成年',
    pinnedBadge: '📌 已置顶',

    settingsTitle: '设置',
    language: '语言',
    languageChinese: '中文',
    languageEnglish: 'English',
  },
  en: {
    appName: 'Countdown Day',

    emptyTitle: 'No events yet',
    emptySubtitle: 'Tap + to add your first countdown',

    daysLeft: '{n} days left',
    daysAgo: '{n} days ago',
    daysSince: '{n} days since',
    daysUntil: '{n} days until',
    todayBang: '🎉 Today!',

    typeCountdown: 'Countdown',
    typeCountup: 'Count up',

    milestoneAt: '🎉 Day {value} milestone!',
    milestoneApproaching: '⏳ {days} days to day {value}',

    fieldTitle: 'Title',
    titlePlaceholder: 'e.g. Summer vacation',
    titleRequired: 'Title is required',
    fieldDate: 'Date',
    fieldType: 'Type',
    fieldColor: 'Color',
    previewPlaceholderTitle: 'Event title',
    addEvent: 'Add event',
    saveChanges: 'Save changes',
    deleteEvent: 'Delete event',

    cancel: 'Cancel',
    delete: 'Delete',
    deleteConfirmTitle: 'Delete event?',
    deleteConfirmMessage: '"{title}" will be permanently removed.',

    newEventTitle: 'New Event',
    editEventTitle: 'Edit Event',
    eventNotFound: 'Event not found.',
    detailTitle: 'Detail',

    past: 'Past',
    remaining: 'Remaining',
    todayIsText: "It's today!",
    dayUnit: 'd',
    unitWeek: 'wk',
    unitMonth: 'mo',
    unitYear: 'yr',
    approxPrefix: '~',
    preciseToSecond: 'Precise countdown',
    convertWeeks: 'In weeks',
    convertMonths: 'In months',
    convertYears: 'In years',
    pinnedBadge: '📌 Pinned',

    settingsTitle: 'Settings',
    language: 'Language',
    languageChinese: '中文',
    languageEnglish: 'English',
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations['zh'];
