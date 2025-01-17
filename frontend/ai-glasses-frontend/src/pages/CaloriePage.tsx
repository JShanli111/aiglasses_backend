import React, { useState } from 'react'
import { Camera, Utensils, Calendar } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface FoodItem {
  name: string
  calories: number
  timestamp: string
  image_url: string
}

export function CaloriePage() {
  const { language } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        handleFoodDetection(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFoodDetection = async (imageData: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/food/track/user123`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
        }),
      })

      const data = await response.json()
      if (data.food_item) {
        setFoodItems(prev => [...prev, data.food_item])
      }
    } catch (error) {
      console.error('Food detection error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const calorieData = foodItems.map(item => ({
    name: new Date(item.timestamp).toLocaleDateString(),
    calories: item.calories,
  }))

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Utensils className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'zh' ? '卡路里追踪助手' : 'Calorie Tracking Assistant'}
          </h1>
          <p className="text-xl text-gray-600">
            {language === 'zh' 
              ? '使用智能食物识别追踪您的餐点和卡路里'
              : 'Track your meals and calories with smart food recognition'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-8">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-12">
              {selectedImage ? (
                <div className="text-center">
                  <img src={selectedImage} alt="Selected food" className="max-w-full h-auto rounded-lg mb-4" />
                  {isProcessing && (
                    <p className="text-gray-600">
                      {language === 'zh' ? '正在处理您的食物图片...' : 'Processing your food image...'}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {language === 'zh' ? '拍摄您的食物照片' : 'Take a photo of your food'}
                  </p>
                  <label className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {language === 'zh' ? '选择图片' : 'Choose Image'}
                  </label>
                </div>
              )}
            </div>

            {foodItems.length > 0 && (
              <>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {language === 'zh' ? '最近餐点' : 'Recent Meals'}
                  </h3>
                  <div className="space-y-4">
                    {foodItems.slice(-3).reverse().map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(item.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-blue-600">{item.calories} kcal</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {language === 'zh' ? '卡路里趋势' : 'Calorie Trend'}
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={calorieData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="calories" stroke="#3B82F6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
