import React, { useState } from 'react'
import { Camera, Navigation, AlertTriangle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../components/ui/alert"

interface NavigationAlert {
  alert_type: string
  description: string
  distance?: number
  direction?: string
}

export function NavigationPage() {
  const { language } = useLanguage()
  const [alerts, setAlerts] = useState<NavigationAlert[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        processNavigation(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const processNavigation = async (imageData: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/navigation/alert/user123`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
        }),
      })

      const data = await response.json()
      if (data.alert) {
        setAlerts(prev => [data.alert, ...prev])
        // In a real implementation, we would:
        // 1. Use Web Speech API for voice alerts
        // 2. Handle different types of alerts differently
        speakAlert(data.alert)
      }
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const speakAlert = (alert: NavigationAlert) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(alert.description)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      window.speechSynthesis.speak(utterance)
    } else {
      console.log(`Voice Alert: ${alert.description}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Navigation className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'zh' ? '导航助手' : 'Navigation Assistant'}
          </h1>
          <p className="text-xl text-gray-600">
            {language === 'zh' 
              ? '为视障人士提供实时导航辅助'
              : 'Real-time navigation assistance for visually impaired users'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-8">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-12">
              {selectedImage ? (
                <div className="text-center">
                  <img src={selectedImage} alt="Camera view" className="max-w-full h-auto rounded-lg mb-4" />
                  {isProcessing && (
                    <p className="text-gray-600">
                      {language === 'zh' ? '正在处理环境...' : 'Processing environment...'}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {language === 'zh' ? '启用相机进行实时导航' : 'Enable camera for real-time navigation'}
                  </p>
                  <label className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {language === 'zh' ? '启动相机' : 'Start Camera'}
                  </label>
                </div>
              )}
            </div>

            {alerts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {language === 'zh' ? '最近提醒' : 'Recent Alerts'}
                </h3>
                {alerts.map((alert, index) => (
                  <Alert key={index} variant={alert.alert_type === 'obstacle' ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>
                      {(() => {
                        type AlertType = 'obstacle' | 'warning' | 'landmark';
                        const alertTypes: Record<'zh' | 'en', Record<AlertType, string>> = {
                          zh: { obstacle: '障碍物', warning: '警告', landmark: '地标' },
                          en: { obstacle: 'Obstacle', warning: 'Warning', landmark: 'Landmark' }
                        };
                        const type = language === 'zh' 
                          ? alertTypes.zh[alert.alert_type as AlertType] 
                          : alertTypes.en[alert.alert_type as AlertType] || alert.alert_type;
                        return type.charAt(0).toUpperCase() + type.slice(1);
                      })()}
                    </AlertTitle>
                    <AlertDescription>
                      {(() => {
                        type Description = 'Door ahead' | 'Stairs approaching' | 'Open space ahead' | 'Wall on the right';
                        const descriptions: Record<Description, string> = {
                          'Door ahead': '前方有门',
                          'Stairs approaching': '即将到达楼梯',
                          'Open space ahead': '前方是开放空间',
                          'Wall on the right': '右侧有墙'
                        };
                        const desc = language === 'zh' 
                          ? descriptions[alert.description as Description] || alert.description 
                          : alert.description;
                        const direction = language === 'zh' 
                          ? (alert.direction === 'right' ? '右方' : '前方')
                          : (alert.direction || 'ahead');
                        return `${desc}${alert.distance ? ` (${alert.distance}m ${direction})` : ''}`;
                      })()}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
