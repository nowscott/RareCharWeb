// About页面内容配置
export const aboutConfig = {
  // 页面标题和描述
  pageTitle: '关于',
  pageDescription: '了解复制符应用详情',
  
  // Hero区域
  hero: {
    title: '热门分类统计',
    subtitle: '符号和emoji中数量最多的分类',
    displayCount: 4 // 显示前4个分类
  },
  
  // 产品特色
  features: [
    {
      icon: 'search',
      title: '智能搜索',
      description: '支持拼音检索，快速找到所需符号',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600'
    },
    {
      icon: 'document',
      title: '分类管理',
      description: '多种类型符号，井然有序',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600'
    },
    {
      icon: 'copy',
      title: '一键复制',
      description: '点击即可复制到剪贴板',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600'
    }
  ],
  
  // 使用说明
  instructions: [
    '在搜索框输入关键词或拼音',
    '浏览分类或搜索结果',
    '点击符号卡片查看详情',
    '点击复制按钮获取符号'
  ],
  
  // 版本信息标签
  versionLabels: {
    dataVersion: '数据版本',
    symbolData: '符号数据',
    emojiData: '表情数据',
    devStatus: '开发状态',
    devStatusValue: '开发中',
    totalSymbols: '符号总数'
  },
  
  // 其他作品
  projects: [
    {
      name: 'IndWebIndex',
      description: '使用Next.js + Notion API + Tailwind CSS实现的简单部署的个人索引网站',
      englishDescription: 'A simple personal index website deployed using Next.js + Notion API',
      url: 'https://0211120.xyz/',
      tags: ['Next.js', 'Notion API', 'Tailwind CSS'],
      status: 'active',
      icon: 'globe'
    },
    {
      name: 'EverydayTechNews',
      description: '基于Python爬虫+Github Action实现每天早上自动发送科技新闻到邮箱',
      englishDescription: 'Using Python web scraping and Github Action to automatically send tech news to email every morning',
      url: 'https://mailist.nowscott.top/',
      tags: ['Python', 'Github Action', '爬虫'],
      status: 'active',
      icon: 'email'
    }
  ],

  // 联系方式
  contacts: [
    {
      name: '小红书',
      description: '关注我们的最新动态',
      url: 'https://www.xiaohongshu.com/user/profile/5d40f52f000000001101ba6c?xsec_token=YBExHFaolW_sm5IScluGnf76LQ9Y4yHv13pn_qnh3e0y0=&xsec_source=app_share&xhsshare=CopyLink&appuid=5d40f52f000000001101ba6c&apptime=1750673095&share_id=9e7f80f1b072439b9e9d2a2dc46ef1cc',
      bgColor: 'bg-red-500',
      icon: 'xiaohongshu'
    },
    {
      name: 'GitHub',
      description: '查看开源代码',
      url: 'https://github.com/nowscott/rarecharweb',
      bgColor: 'bg-gray-900 dark:bg-white',
      icon: 'github'
    },
    {
      name: '邮箱反馈',
      description: '意见建议与问题反馈',
      url: 'mailto:nowscott@qq.com',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      icon: 'email'
    }
  ],
  
  // 底部版权信息
  footer: {
    copyright: '© 2025 NowScott',
    disclaimer: '⚠️ 部分内容由AI生成，如有错误请联系我们'
  },
  
  // 后门功能配置
  backdoor: {
    clickThreshold: 5, // 点击次数阈值
    resetTimeout: 3000 // 重置计时器时间（毫秒）
  }
};

// SVG图标路径
export const iconPaths = {
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  document: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  copy: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
  email: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  globe: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM11 19.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  xiaohongshu: "M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.125 4.5h2.25c.621 0 1.125.504 1.125 1.125v.75c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125v-.75c0-.621.504-1.125 1.125-1.125zm0 4.5h2.25c.621 0 1.125.504 1.125 1.125v.75c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125v-.75c0-.621.504-1.125 1.125-1.125z"
};