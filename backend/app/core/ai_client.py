import requests
import base64
import json
import re
from typing import Dict, List, Any
from .config import settings

class AIClient:
    def __init__(self):
        self.base_url = settings.EXTERNAL_AI_URL
        self.headers = {
            "Authorization": f"Bearer {settings.AI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # 定义提示词模板
        self.prompts = {
            'translate': """
请分析这张图片中的文字内容，并按以下JSON格式返回结果：
{
    "original_text": "原文",
    "translated_text": "中文翻译",
    "source_language": "源语言代码"
}
""",
            'calories': """
请分析这张食物图片，识别食物类型和估算卡路里，并按以下JSON格式返回结果：
{
    "total_calories": 总卡路里数值,
    "food_items": [
        {
            "food_name": "食物名称",
            "calories": 卡路里数值,
            "confidence": 置信度(0-1)
        }
    ]
}
""",
            'navigation': """
请分析这张图片中的障碍物，评估安全状况，并按以下JSON格式返回结果：
{
    "obstacles": [
        {
            "type": "障碍物类型",
            "distance": 估计距离(米),
            "position": {"x": 横向位置, "y": 纵向位置}
        }
    ],
    "warning_level": "safe/caution/danger",
    "safe_path": {
        "direction": "left/right/forward",
        "angle": 建议转向角度,
        "confidence": 建议可信度(0-1)
    }
}
"""
        }
    
    def analyze_image(self, image_data: bytes, analysis_type: str) -> dict:
        """调用智谱AI服务分析图片"""
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        payload = {
            "model": "glm-4v-plus",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": self.prompts[analysis_type]
                        },
                        {
                            "type": "image",
                            "image_url": f"data:image/jpeg;base64,{image_base64}"
                        }
                    ]
                }
            ]
        }
        
        try:
            response = requests.post(
                self.base_url,
                json=payload,
                headers=self.headers
            )
            response.raise_for_status()
            result = response.json()
            
            if 'data' in result and 'choices' in result['data']:
                ai_response = result['data']['choices'][0]['message']['content']
                return self._parse_ai_response(ai_response, analysis_type)
            
            raise Exception("Invalid response format from AI service")
            
        except Exception as e:
            print(f"AI服务调用失败: {str(e)}")
            raise
            
    def _parse_ai_response(self, ai_response: str, analysis_type: str) -> dict:
        """解析AI响应为标准格式"""
        try:
            # 尝试从响应中提取JSON
            json_match = re.search(r'{[\s\S]*}', ai_response)
            if json_match:
                json_str = json_match.group(0)
                parsed_response = json.loads(json_str)
            else:
                # 如果没有找到JSON，使用原始响应
                parsed_response = {"raw_response": ai_response}

            # 根据分析类型处理响应
            if analysis_type == 'translate':
                return {
                    'original_text': parsed_response.get('original_text', ''),
                    'translated_text': parsed_response.get('translated_text', ai_response),
                    'source_language': parsed_response.get('source_language', 'auto'),
                    'target_language': 'zh'
                }
                
            elif analysis_type == 'calories':
                return {
                    'total_calories': float(parsed_response.get('total_calories', 0)),
                    'food_items': parsed_response.get('food_items', []),
                    'confidence_score': parsed_response.get('confidence', 0.9)
                }
                
            elif analysis_type == 'navigation':
                return {
                    'obstacles': parsed_response.get('obstacles', []),
                    'safe_path': parsed_response.get('safe_path', {
                        'direction': 'forward',
                        'angle': 0,
                        'confidence': 1.0
                    }),
                    'distance': parsed_response.get('distance', 0),
                    'warning_level': parsed_response.get('warning_level', 'safe')
                }
                
        except json.JSONDecodeError as e:
            print(f"JSON解析失败: {str(e)}")
            # 返回基本响应
            return self._get_default_response(analysis_type, ai_response)
            
        except Exception as e:
            print(f"响应解析失败: {str(e)}")
            raise
            
    def _get_default_response(self, analysis_type: str, raw_response: str) -> dict:
        """生成默认响应格式"""
        if analysis_type == 'translate':
            return {
                'original_text': '',
                'translated_text': raw_response,
                'source_language': 'auto',
                'target_language': 'zh'
            }
        elif analysis_type == 'calories':
            return {
                'total_calories': 0,
                'food_items': [],
                'confidence_score': 0.5
            }
        else:  # navigation
            return {
                'obstacles': [],
                'safe_path': {
                    'direction': 'forward',
                    'angle': 0,
                    'confidence': 0.5
                },
                'distance': 0,
                'warning_level': 'safe'
            } 