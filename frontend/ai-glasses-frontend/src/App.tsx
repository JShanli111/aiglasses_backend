import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Glasses, Brain, Heart, Info, ArrowRight } from 'lucide-react'
import { ApplicationCard } from './components/ApplicationCard'
import { Header } from './components/Header'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useLanguage } from './context/LanguageContext'
import { TranslationPage } from './pages/TranslationPage'
import { CaloriePage } from './pages/CaloriePage'
import { NavigationPage } from './pages/NavigationPage'
import AboutPage from './pages/AboutPage'
import { api } from './services/api'
import { useEffect } from 'react'

function App() {
  const { language } = useLanguage();

  const getFeatureDetails = (route: string) => {
    const details = {
      '/translate': {
        zh: '使用先进的AI技术，实时识别和翻译文本。支持多种语言，让学习和交流变得更加便捷。适用于旅行、学习和商务场景。',
        en: 'Utilize advanced AI to recognize and translate text in real-time. Support for multiple languages makes learning and communication effortless. Perfect for travel, education, and business.'
      },
      '/health': {
        zh: '智能识别食物，自动计算卡路里。追踪饮食习惯，生成个性化健康报告。支持多种食物类型和营养数据库。',
        en: 'Smart food recognition with automatic calorie calculation. Track eating habits and generate personalized health reports. Supports various food types and nutrition databases.'
      },
      '/navigation': {
        zh: '为视障人士提供实时环境描述和导航指引。智能识别障碍物，提供清晰的语音提示。确保安全和独立的出行体验。',
        en: 'Provide real-time environment description and navigation guidance for the visually impaired. Smart obstacle detection with clear voice prompts. Ensure safe and independent mobility.'
      },
      '/about': {
        zh: '了解我们的技术创新和使命愿景。探索AI眼镜如何改变生活，参与开源社区建设。',
        en: 'Learn about our technological innovations and mission. Explore how AI glasses transform lives and join our open-source community.'
      }
    };
    return details[route as keyof typeof details];
  };

  const getApplications = () => {
    switch (language) {
      case 'zh':
        return [
          {
            title: "教育翻译助手",
            description: "指向物体即可获得实时翻译",
            icon: <Glasses className="w-8 h-8 text-primary" />,
            route: "/translate"
          },
          {
            title: "健康追踪",
            description: "通过智能食物识别追踪卡路里",
            icon: <Heart className="w-8 h-8 text-primary" />,
            route: "/health"
          },
          {
            title: "导航助手",
            description: "为视障人士提供实时导航辅助",
            icon: <Brain className="w-8 h-8 text-primary" />,
            route: "/navigation"
          },
          {
            title: "关于项目",
            description: "了解更多关于AI智能眼镜项目",
            icon: <Info className="w-8 h-8 text-primary" />,
            route: "/about"
          }
        ];
      default:
        return [
          {
            title: "Educational Translation",
            description: "Point at objects to get instant translations in your preferred language",
            icon: <Glasses className="w-8 h-8 text-primary" />,
            route: "/translate"
          },
          {
            title: "Health Tracking",
            description: "Track your meals and calories with smart food recognition",
            icon: <Heart className="w-8 h-8 text-primary" />,
            route: "/health"
          },
          {
            title: "Navigation Assistant",
            description: "Real-time navigation assistance for the visually impaired",
            icon: <Brain className="w-8 h-8 text-primary" />,
            route: "/navigation"
          },
          {
            title: "About Project",
            description: "Learn more about the AI Glasses Agent project",
            icon: <Info className="w-8 h-8 text-primary" />,
            route: "/about"
          }
        ];
    }
  }

  const applications = getApplications();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const result = await api.healthCheck();
        console.log('API Health:', result);
      } catch (error) {
        console.error('API Error:', error);
      }
    };
    
    checkHealth();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={
            <div className="flex flex-col">
              <section className="relative flex items-center justify-center min-h-[70vh] bg-gradient-to-r from-blue-100 via-white to-blue-50">
                <div className="text-center max-w-4xl px-6">
                  <h1 className="text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                    {language === 'zh' ? '欢迎使用AI智能眼镜' : 'Welcome to AI Glasses Agent'}
                  </h1>
                  <p className="text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
                    {language === 'zh' 
                      ? '智能应用，改变生活方式。探索AI驱动的视觉辅助新世界。' 
                      : 'Intelligent applications that transform your world. Explore the future of AI-powered visual assistance.'}
                  </p>
                  <div className="flex justify-center gap-4">
                    <a href="#features" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      {language === 'zh' ? '立即开始' : 'Get Started'}
                    </a>
                    <a href="/about" className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      {language === 'zh' ? '了解更多' : 'Learn More'}
                    </a>
                  </div>
                </div>
              </section>
              <main id="features" className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
                    {language === 'zh' ? 'AI智能眼镜应用' : 'AI Glasses Applications'}
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    {language === 'zh' 
                      ? '探索我们的AI智能眼镜应用套件' 
                      : 'Explore our suite of AI-powered smart glasses applications'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {applications.map((app) => (
                    <HoverCard key={app.route}>
                      <HoverCardTrigger asChild>
                        <div className="transform transition-all duration-200 hover:scale-105">
                          <ApplicationCard {...app} />
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 p-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              {app.icon}
                            </div>
                            <h4 className="text-lg font-semibold">{app.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            {language === 'zh' ? getFeatureDetails(app.route).zh : getFeatureDetails(app.route).en}
                          </p>
                          <div className="pt-2">
                            <Link
                              to={app.route}
                              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              {language === 'zh' ? '了解更多' : 'Learn More'}
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </div>
                <section className="bg-gradient-to-b from-white to-blue-50 py-16">
                  <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                      <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
                        {language === 'zh' ? '如何使用' : 'How It Works'}
                      </h2>
                      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {language === 'zh'
                          ? '探索AI智能眼镜如何改变您的日常生活体验'
                          : 'Discover how AI Glasses transform your daily experiences'}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                          <Glasses className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          {language === 'zh' ? '佩戴智能眼镜' : 'Wear Smart Glasses'}
                        </h3>
                        <p className="text-gray-600">
                          {language === 'zh'
                            ? '轻松佩戴智能眼镜，启动应用程序，即刻开启智能生活'
                            : 'Simply put on the smart glasses and launch the app to begin your enhanced experience'}
                        </p>
                      </div>
                      <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                          <Brain className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          {language === 'zh' ? 'AI实时处理' : 'Real-time AI Processing'}
                        </h3>
                        <p className="text-gray-600">
                          {language === 'zh'
                            ? 'AI技术实时处理视觉信息，提供即时反馈和智能建议'
                            : 'AI processes visual information in real-time, providing instant feedback and smart suggestions'}
                        </p>
                      </div>
                      <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                          <Heart className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          {language === 'zh' ? '享受智能生活' : 'Enjoy Smart Living'}
                        </h3>
                        <p className="text-gray-600">
                          {language === 'zh'
                            ? '获得实时翻译、健康追踪和导航辅助，提升生活品质'
                            : 'Get real-time translations, health tracking, and navigation assistance to enhance your lifestyle'}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </main>
            </div>
          } />
          <Route path="/translate" element={<TranslationPage />} />
          <Route path="/health" element={<CaloriePage />} />
          <Route path="/navigation" element={<NavigationPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
