# 客户信息管理系统

一个基于 Vue3 + Pinia + Element Plus 构建的现代化客户信息管理系统。

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **状态管理**: Pinia
- **UI 组件库**: Element Plus
- **构建工具**: Vite
- **样式预处理器**: SCSS
- **开发语言**: JavaScript

## 功能特点

- ✅ 全屏响应式设计，适配多设备
- ✅ 现代化界面风格，简洁美观
- ✅ 丰富的交互效果和动画
- ✅ 完整的状态管理
- ✅ 模块化组件设计
- ✅ 智能表单提交防重复机制
- ✅ 完善的错误处理和用户反馈
- ✅ API性能监控和日志记录

## 新增功能

### 表单提交优化
- **防重复提交**: 提交过程中禁用按钮，防止用户重复点击
- **等待动画**: 提交时显示加载动画和状态提示
- **自动清理**: 提交成功后自动关闭弹窗并清空表单内容
- **错误处理**: 提交失败时保持弹窗打开，允许用户修改后重试

### API响应处理
- **统一错误处理**: 根据HTTP状态码和业务错误码显示相应错误信息
- **性能监控**: 开发环境下输出API响应时间信息
- **数据格式标准化**: 确保API响应数据格式的一致性

## 项目结构

```
kehuxinxi-web/
├── src/
│   ├── main.js          # 应用入口
│   ├── App.vue          # 根组件
│   ├── api/
│   │   ├── request.js   # API请求配置和拦截器
│   │   └── leads.js     # 线索相关API
│   ├── components/
│   │   └── LeadForm.vue # 线索表单组件
│   ├── views/
│   │   └── CustomerView.vue # 客户管理页面
│   └── style.scss       # 全局样式
├── index.html           # HTML 模板
├── vite.config.js       # Vite 配置
├── package.json         # 项目依赖
├── api-doc.txt         # API文档
└── README.md           # 项目说明
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run serve
```

## 开发规范

### 组件开发
- 使用 Vue 3 Composition API
- 组件命名采用 PascalCase
- 样式使用 SCSS 编写

### 状态管理
- 使用 Pinia 进行状态管理
- Store 文件放在 `src/stores/` 目录下

### 样式规范
- 使用 CSS 变量定义主题色彩
- 响应式设计优先
- 动画效果流畅自然

### API调用规范
- 统一使用 `src/api/` 目录下的API函数
- 错误处理通过响应拦截器统一处理
- 开发环境下输出性能监控信息

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 许可证

MIT License 