import React from 'react'
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"

interface ApplicationCardProps {
  title: string
  description: string
  icon: React.ReactNode
  route: string
}

export function ApplicationCard({ title, description, icon, route }: ApplicationCardProps) {
  const { language } = useLanguage();
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="flex items-center justify-center w-16 h-16 mb-6 bg-blue-50 rounded-xl">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="mt-auto p-6 pt-0">
        <Link to={route} className="inline-flex w-full items-center justify-center px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
          {language === 'zh' ? '立即体验' : 'Try Now'} <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
