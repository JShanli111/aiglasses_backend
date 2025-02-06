import { useLanguage, LanguageType } from '../context/LanguageContext'
import { Github, Globe, Mail } from 'lucide-react'

type ContentType = {
  title: string
  description: string
  overview: {
    title: string
    content: string
  }
  features: {
    title: string
    list: string[]
  }
  technology: {
    title: string
    content: string
  }
  commercial: {
    title: string
    content: string
    list: string[]
  }
  contribute: {
    title: string
    content: string
  }
}

type SupportedLanguage = Extract<LanguageType, 'en' | 'zh'>
type ContentLanguages = Record<SupportedLanguage, ContentType>

export default function AboutPage() {
  const { language } = useLanguage()

  const content: ContentLanguages = {
    en: {
      title: 'About AI Glasses Agent',
      description: 'An open-source project revolutionizing smart glasses applications',
      overview: {
        title: 'Project Overview',
        content: 'AI Glasses Agent is an innovative open-source platform that brings together cutting-edge AI technology and smart glasses hardware to create practical, everyday applications. Our mission is to make AI-powered visual assistance accessible to everyone.',
      },
      features: {
        title: 'Key Features',
        list: [
          'Real-time translation assistance for educational purposes',
          'Smart calorie tracking and health monitoring',
          'Navigation assistance for visually impaired users',
        ],
      },
      technology: {
        title: 'Technology Stack',
        content: 'Built with modern web technologies including React, TypeScript, and FastAPI, our platform ensures high performance, type safety, and scalability. The modular architecture allows for easy integration of new features and AI models.',
      },
      commercial: {
        title: 'Commercial Applications',
        content: 'Our platform is designed for both individual users and enterprise applications. Potential commercial uses include:',
        list: [
          'Educational institutions for language learning programs',
          'Healthcare facilities for dietary monitoring',
          'Assistive technology providers for vision assistance solutions',
        ],
      },
      contribute: {
        title: 'Contribute',
        content: 'We welcome contributions from developers, designers, and AI enthusiasts. Join us in making AI-powered visual assistance more accessible.',
      },
    },
    zh: {
      title: '关于AI智能眼镜',
      description: '革新智能眼镜应用的开源项目',
      overview: {
        title: '项目概述',
        content: 'AI智能眼镜是一个创新的开源平台，将尖端AI技术与智能眼镜硬件相结合，创造实用的日常应用。我们的使命是让AI视觉辅助技术惠及每个人。',
      },
      features: {
        title: '核心功能',
        list: [
          '教育用途的实时翻译辅助',
          '智能卡路里追踪和健康监测',
          '视障人士导航辅助',
        ],
      },
      technology: {
        title: '技术栈',
        content: '使用React、TypeScript和FastAPI等现代网络技术构建，我们的平台确保高性能、类型安全和可扩展性。模块化架构便于集成新功能和AI模型。',
      },
      commercial: {
        title: '商业应用',
        content: '我们的平台同时适用于个人用户和企业应用。潜在的商业用途包括：',
        list: [
          '教育机构的语言学习项目',
          '医疗机构的饮食监测',
          '视觉辅助技术提供商的解决方案',
        ],
      },
      contribute: {
        title: '参与贡献',
        content: '我们欢迎开发者、设计师和AI爱好者的贡献。加入我们，让AI视觉辅助技术更加普及。',
      },
    },
  }

  const currentLang = content[language as SupportedLanguage]

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
            {currentLang.title}
          </h1>
          <p className="text-xl text-gray-600">
            {currentLang.description}
          </p>
        </div>

        <div className="space-y-12">
          {/* Overview Section */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentLang.overview.title}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {currentLang.overview.content}
            </p>
          </section>

          {/* Features Section */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentLang.features.title}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {currentLang.features.list.map((feature: string, index: number) => (
                <li key={index} className="leading-relaxed">{feature}</li>
              ))}
            </ul>
          </section>

          {/* Technology Section */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentLang.technology.title}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {currentLang.technology.content}
            </p>
          </section>

          {/* Commercial Applications Section */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentLang.commercial.title}
            </h2>
            <p className="text-gray-600 mb-4">
              {currentLang.commercial.content}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {currentLang.commercial.list.map((item: string, index: number) => (
                <li key={index} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </section>

          {/* Contribute Section */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentLang.contribute.title}
            </h2>
            <p className="text-gray-600 mb-6">
              {currentLang.contribute.content}
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/yourusername/ai-glasses-agent"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </a>
              <a
                href="https://ai-glasses-agent.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Globe className="w-5 h-5 mr-2" />
                Website
              </a>
              <a
                href="mailto:contact@ai-glasses-agent.com"
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
