import React, { useState } from 'react'
import { Camera, Languages } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
]

export function TranslationPage() {
  const { language } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [targetLanguage, setTargetLanguage] = useState('en')

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

  const handleTranslate = async () => {
    if (!selectedImage) {
      handleError('Please select an image first')
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: selectedImage,
          source_language: 'auto',
          target_language: targetLanguage,
        }),
      })

      const data = await response.json()
      setTranslatedText(data.translated_text)
    } catch (error) {
      console.error('Translation error:', error)
      setTranslatedText(language === 'zh' ? '错误：翻译失败，请重试。' : 'Error: Failed to translate. Please try again.')
    }
  }

  const handleError = (message: string) => {
    if (language === 'zh') {
      const zhMessages: { [key: string]: string } = {
        'Please select an image first': '请先选择图片'
      }
      setTranslatedText(`错误：${zhMessages[message] || message}`)
    } else {
      setTranslatedText(`Error: ${message}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Languages className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'zh' ? 'AI翻译助手' : 'AI Translation Assistant'}
          </h1>
          <p className="text-xl text-gray-600">
            {language === 'zh' 
              ? '将相机对准任何文字或物体即可获得实时翻译'
              : 'Point your camera at any text or object to get instant translations'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-8">
            <div className="mb-6">
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'zh' ? '选择目标语言' : 'Select Target Language'}
              </label>
              <select
                id="language"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-12">
              {selectedImage ? (
                <img src={selectedImage} alt="Selected" className="max-w-full h-auto rounded-lg" />
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
                  onClick={handleTranslate}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {language === 'zh' ? '翻译' : 'Translate'}
                </button>
              </div>
            )}

            {translatedText && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">
                  {language === 'zh' ? '翻译结果：' : 'Translation Result:'}
                </h3>
                <p className="text-gray-700">{translatedText}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
