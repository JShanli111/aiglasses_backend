import zhipuai
from app.core.config import settings
from typing import Dict, Any, Optional, Union
import logging
import base64
import aiohttp
import io
from PIL import Image
import asyncio

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.client = zhipuai.ZhipuAI(api_key=settings.AI_API_KEY)

    async def analyze_image(self, image_input: Union[str, bytes], analysis_type: str, input_type: str = 'file') -> Dict[str, Any]:
        """
        分析图片，支持本地文件路径或URL
        :param image_input: 可以是本地文件路径、URL或字节数据
        :param analysis_type: 分析类型（translate/calorie/navigate）
        :param input_type: 输入类型（'file'/'url'/'bytes'）
        """
        try:
            # 根据输入类型获取图片数据
            if input_type == 'file':
                # 处理本地文件
                with open(image_input, "rb") as image_file:
                    image_data = image_file.read()
                    logger.info(f"成功读取本地文件: {image_input}")
            elif input_type == 'url':
                # 处理URL（Messenger图片）
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.facebook.com/',
                    'Connection': 'keep-alive'
                }
                
                # 增加超时时间，设置重试次数
                timeout = aiohttp.ClientTimeout(total=60, connect=30)
                max_retries = 3
                retry_count = 0
                
                while retry_count < max_retries:
                    try:
                        async with aiohttp.ClientSession(timeout=timeout) as session:
                            async with session.get(image_input, headers=headers, allow_redirects=True, ssl=False) as response:
                                if response.status != 200:
                                    logger.error(f"图片下载失败: HTTP {response.status}")
                                    raise ValueError(f"图片下载失败: HTTP {response.status}")
                                image_data = await response.read()
                                logger.info(f"成功下载图片，大小: {len(image_data)} bytes")
                                break  # 成功下载后跳出循环
                                
                    except asyncio.TimeoutError:
                        retry_count += 1
                        if retry_count == max_retries:
                            logger.error(f"下载超时（已重试{max_retries}次）: {image_input}")
                            raise ValueError(f"下载超时（已重试{max_retries}次）: {image_input}")
                        logger.warning(f"下载超时，正在进行第{retry_count}次重试...")
                        await asyncio.sleep(1)  # 重试前等待1秒
                        
                    except Exception as e:
                        logger.error(f"下载失败: {str(e)}")
                        raise ValueError(f"下载失败: {str(e)}")
            elif input_type == 'bytes':
                image_data = image_input
            else:
                raise ValueError(f"不支持的输入类型: {input_type}")

            # 统一处理图片格式
            try:
                # 将图片数据转换为PIL Image对象
                image = Image.open(io.BytesIO(image_data))
                # 转换为RGB模式（去除透明通道）
                if image.mode in ('RGBA', 'LA') or (image.mode == 'P' and 'transparency' in image.info):
                    image = image.convert('RGB')
                
                # 将处理后的图片保存为JPEG格式
                buffer = io.BytesIO()
                image.save(buffer, format='JPEG')
                image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
                logger.info("图片格式转换成功")
            except Exception as e:
                logger.error(f"图片格式转换失败: {str(e)}")
                raise ValueError(f"图片格式转换失败: {str(e)}")

            # 根据不同的分析类型构建不同的提示信息
            prompts = {
                'translate': [
                    {
                        "role": "system",
                        "content": "你是一个专业的图像文字翻译助手。"
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "请识别这张图片中的文字内容，并翻译成中文。"
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                }
                            }
                        ]
                    }
                ],
                'calorie': [
                    {
                        "role": "system",
                        "content": "你是一个专业的食物卡路里分析助手。"
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "请分析这张图片中的食物，列出每种食物的卡路里含量，并计算总卡路里。"
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                }
                            }
                        ]
                    }
                ],
                'navigate': [
                    {
                        "role": "system",
                        "content": "你是一个专业的导航助手。"
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "请分析这张图片中的环境，识别可能的障碍物，并提供导航建议。"
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                }
                            }
                        ]
                    }
                ]
            }

            # 获取对应的提示信息
            prompt = prompts.get(analysis_type)
            if not prompt:
                raise ValueError(f"不支持的分析类型: {analysis_type}")

            # 调用智谱 AI 的多模态模型
            response = self.client.chat.completions.create(
                model="glm-4v",
                messages=prompt,
                temperature=0.7,
                max_tokens=1000
            )

            # 处理响应
            if response and hasattr(response, 'choices') and response.choices:
                result = response.choices[0].message.content
                logger.info(f"AI分析完成: {analysis_type}")
                return {
                    'type': f'{analysis_type}_analysis',
                    'result': result,
                    'confidence': 0.9
                }
            else:
                logger.error(f"AI API Response Error: {response}")
                return None

        except Exception as e:
            logger.error(f"AI Service Error: {str(e)}")
            return None 