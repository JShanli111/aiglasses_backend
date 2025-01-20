import React, { useState } from 'react'
import { Camera } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { api } from '../services/api'

export function NavigationPage() {
  const { language } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedImage) {
      return
    }

    try {
      const response = await api.navigate({
        image_url: selectedImage
      })

      console.log('API Response:', response)
      
      if (response.result && response.result.navigation) {
        setAnalysisResult(response.result.navigation.result)
      } else {
        throw new Error('未收到有效的导航结果')
      }
    } catch (error) {
      console.error('Navigation error:', error)
      if (error instanceof Error) {
        setAnalysisResult(`错误: ${error.message}`)
      } else {
        setAnalysisResult('导航分析过程中发生错误')
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          {language === 'zh' ? '导航辅助' : 'Navigation Assistance'}
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="space-y-6">
            <div className="flex justify-center">
              {selectedImage ? (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="max-w-full h-auto rounded-lg"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {language === 'zh' ? '上传图片或拍照' : 'Upload an image or take a photo'}
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

            {selectedImage && (
              <div className="flex justify-center">
                <button
                  onClick={handleAnalyze}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {language === 'zh' ? '分析' : 'Analyze'}
                </button>
              </div>
            )}

            {analysisResult && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">
                  {language === 'zh' ? '分析结果：' : 'Analysis Result:'}
                </h3>
                <p className="text-gray-700 text-lg">{analysisResult}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
