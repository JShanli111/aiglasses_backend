import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', label: 'English' },
  { code: 'zh', name: '中文', label: '中文' },
  { code: 'es', name: 'Spanish', label: 'Español' },
  { code: 'fr', name: 'French', label: 'Français' },
  { code: 'de', name: 'German', label: 'Deutsch' },
  { code: 'ja', name: 'Japanese', label: '日本語' },
  { code: 'ko', name: 'Korean', label: '한국어' }
];

export function Header() {
  const { language, setLanguage } = useLanguage();

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Globe className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-semibold">
            {(() => {
              switch (language) {
                case 'en': return 'AI Glasses Agent';
                case 'zh': return 'AI智能眼镜';
                case 'es': return 'Gafas AI';
                case 'fr': return 'Lunettes IA';
                case 'de': return 'KI-Brille';
                case 'ja': return 'AIグラス';
                case 'ko': return 'AI 안경';
                default: return 'AI Glasses Agent';
              }
            })()}
          </h1>
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'en' | 'zh' | 'es' | 'fr' | 'de' | 'ja' | 'ko')}
          className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
