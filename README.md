# AI Glasses Agent
# AI智能眼镜项目

A web-based platform for AI-powered smart glasses applications, featuring real-time translation, health tracking, and navigation assistance.
基于网络的AI智能眼镜应用平台，提供实时翻译、健康追踪和导航辅助功能。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](#english) | [中文](#chinese)

website: www.aiglasses.fun  
![Home Image](img/home.png)

<a name="english"></a>
## Overview
AI Glasses Agent is an innovative open-source project that combines cutting-edge AI technology with smart glasses hardware to create practical, everyday applications. Our platform provides a suite of AI-powered features designed to enhance accessibility, education, and health monitoring.

### Quick Start
```bash
# Clone the repository
git clone https://github.com/yourusername/ai-glasses-agent.git
cd ai-glasses-agent

# Frontend setup
cd frontend/ai-glasses-frontend
npm install
npm run dev

# Backend setup
cd backend/ai-glasses-agent-backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Features

### 1. Educational Translation Assistant
- Real-time translation of objects and text through smart glasses
- Point-and-translate functionality for seamless learning experience
- Support for multiple languages

### 2. Health & Calorie Tracking
- Automatic food recognition and calorie tracking
- Personal database for meal history
- Nutritional information display

### 3. Navigation Assistant for Visually Impaired
- Real-time environment description
- Obstacle detection and warning system
- Voice-based navigation guidance

## Project Structure
```
ai-glasses-agent/
├── frontend/          # React-based web interface
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   └── context/      # React context providers
│   └── public/
└── backend/           # FastAPI backend server
    ├── app/
    │   ├── models.py     # Data models
    │   └── database.py   # Database operations
    └── tests/
```

## Technology Stack
- Frontend: React with TypeScript, Tailwind CSS
- Backend: FastAPI (Python)
- Database: In-memory database for prototype
- Languages: Multi-language support (EN, ZH, ES, FR, DE, JA, KO)

## Contributing
We welcome contributions from developers, designers, and AI enthusiasts! Please read our [Contributing Guide](CONTRIBUTING.md) for guidelines on how to proceed.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Commercial Applications
- Educational institutions for language learning programs
- Healthcare facilities for dietary monitoring
- Assistive technology providers for vision assistance solutions
- Smart glasses manufacturers for feature integration

## Community
- Report issues and feature requests on GitHub
- Join our discussions for ideas and feedback
- Follow our development progress

---

<a name="chinese"></a>
# 中文文档

## 概述
AI智能眼镜是一个创新的开源项目，将尖端AI技术与智能眼镜硬件相结合，创造实用的日常应用。我们的平台提供一系列AI驱动的功能，旨在提升无障碍性、教育和健康监测。

### 快速开始
```bash
# 克隆仓库
git clone https://github.com/yourusername/ai-glasses-agent.git
cd ai-glasses-agent

# 前端设置
cd frontend/ai-glasses-frontend
npm install
npm run dev

# 后端设置
cd backend/ai-glasses-agent-backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 功能特点
### 1. 教育翻译助手
- 通过智能眼镜实时翻译物体和文本
- 指点即译功能，实现无缝学习体验
- 支持多种语言

### 2. 健康和卡路里追踪
- 自动食物识别和卡路里追踪
- 个人餐饮历史数据库
- 营养信息显示

### 3. 视障人士导航助手
- 实时环境描述
- 障碍物检测和警告系统
- 基于语音的导航指引

## 项目结构
```
ai-glasses-agent/
├── frontend/          # React前端界面
│   ├── src/
│   │   ├── components/    # 可复用UI组件
│   │   ├── pages/        # 页面组件
│   │   └── context/      # React上下文提供者
│   └── public/
└── backend/           # FastAPI后端服务器
    ├── app/
    │   ├── models.py     # 数据模型
    │   └── database.py   # 数据库操作
    └── tests/
```

## 技术栈
- 前端：React with TypeScript, Tailwind CSS
- 后端：FastAPI (Python)
- 数据库：原型阶段使用内存数据库
- 语言：多语言支持（英语、中文、西班牙语、法语、德语、日语、韩语）

## 参与贡献
我们欢迎开发者、设计师和AI爱好者的贡献！请阅读我们的[贡献指南](CONTRIBUTING.md)了解如何参与。

## 许可证
本项目采用MIT许可证 - 查看[LICENSE](LICENSE)文件了解详情。

## 商业应用
- 教育机构的语言学习项目
- 医疗机构的饮食监测
- 视觉辅助技术提供商的解决方案
- 智能眼镜制造商的功能集成

## 社区
- 在GitHub上报告问题和功能请求
- 加入我们的讨论，分享想法和反馈
- 关注我们的开发进展
