import aiohttp
import logging
from typing import Optional, Dict, Any, Union
import asyncio
from aiohttp import ClientTimeout
from urllib.parse import urlparse, parse_qs, urlencode
import json
import zhipuai
import base64
from PIL import Image
import io
import aiofiles
import os
from pathlib import Path
import hashlib
import time
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.timeout = ClientTimeout(total=10)
        self.max_retries = 3
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.facebook.com/'
        }
        # 使用你的实际智谱AI API密钥
        api_key = "6e9c652664525edefee7a17c53d840f1.p9n24a9t3dTcgEvX"  # 这个key是有效的，可以继续使用
        self.client = zhipuai.ZhipuAI(api_key=api_key)

    async def _download_image(self, url: str) -> Optional[bytes]:
        # 配置代理
        proxies = {
            'http': 'http://127.0.0.1:7890',  # 本地 Clash 代理
            'https': 'http://127.0.0.1:7890'
        }
        
        # 更新请求头
        headers = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.facebook.com/',
            'Connection': 'keep-alive'
        }
        
        try:
            # 创建 TCP 连接器
            connector = aiohttp.TCPConnector(
                ssl=False,
                force_close=True,
                limit=1,
                ttl_dns_cache=300
            )
            
            # 设置较短的超时时间
            timeout = ClientTimeout(total=10, connect=5)
            
            # 尝试使用代理下载
            async with aiohttp.ClientSession(
                headers=headers,
                timeout=timeout,
                connector=connector
            ) as session:
                try:
                    # 先尝试直接下载
                    async with session.get(url) as response:
                        if response.status == 200:
                            return await response.read()
                except:
                    # 直接下载失败，尝试使用代理
                    async with session.get(url, proxy=proxies['https']) as response:
                        if response.status == 200:
                            return await response.read()
                    
            return None
                    
        except Exception as e:
            logger.error(f"下载错误: {str(e)}")
            return None

    async def _try_download(self, url: str) -> Optional[bytes]:
        """尝试下载单个URL的图片"""
        self.timeout = ClientTimeout(total=10, connect=5)
        
        for attempt in range(self.max_retries):
            try:
                connector = aiohttp.TCPConnector(ssl=False, force_close=True, limit=1)
                async with aiohttp.ClientSession(headers=self.headers, 
                                              timeout=self.timeout,
                                              connector=connector) as session:
                    async with session.get(url) as response:
                        if response.status == 200:
                            logger.info(f"Successfully downloaded image from {url}")
                            return await response.read()
                        else:
                            logger.error(f"Download failed with status {response.status}, URL: {url}")
                            if attempt < self.max_retries - 1:
                                await asyncio.sleep(1)
                                continue
                            return None
                            
            except asyncio.TimeoutError:
                if attempt < self.max_retries - 1:
                    wait_time = min((attempt + 1) * 2, 5)
                    logger.warning(f"Download timeout, retrying {attempt + 1} in {wait_time} seconds...")
                    await asyncio.sleep(wait_time)
                else:
                    logger.error(f"Download timeout after {self.max_retries} retries: {url}")
                    return None
                    
            except Exception as e:
                logger.error(f"Download error for {url}: {str(e)}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(1)
                    continue
                return None

    def _encode_image(self, image_data: bytes) -> str:
        return base64.b64encode(image_data).decode('utf-8')

    async def analyze_image(self, image_source: str, analysis_type: str, input_type: str = 'path') -> Optional[Dict[str, Any]]:
        try:
            # 获取图片数据
            image_data = None
            
            if input_type == 'url':
                image_data = await self._download_image(image_source)
                if not image_data:
                    logger.error(f"Failed to download image from URL: {image_source}")
                    return None
            else:
                try:
                    with open(image_source, 'rb') as f:
                        image_data = f.read()
                except Exception as e:
                    logger.error(f"Failed to read local file {image_source}: {str(e)}")
                    return None

            # 转换图片为base64
            try:
                image_base64 = self._encode_image(image_data)
                logger.info("Successfully encoded image to base64")
            except Exception as e:
                logger.error(f"Failed to encode image: {str(e)}")
                return None

            # 准备提示信息
            prompts = {
                "translate": "请将图片中的英文翻译为中文。",
                "calorie": "请分析这张食物图片的卡路里含量。",
                "navigate": "请分析这张场景图片并提供导航建议。"
            }

            try:
                # API调用
                logger.info(f"Calling API for {analysis_type} analysis")
                response = self.client.chat.completions.create(
                    model="glm-4v-plus",
                    messages=[{
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompts.get(analysis_type, "请分析这张图片。")
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                }
                            }
                        ]
                    }]
                )
                
                if response and hasattr(response, 'choices'):
                    result = response.choices[0].message.content
                    logger.info(f"Successfully got API response for {analysis_type}")
                    return {
                        'type': f'{analysis_type}_analysis',
                        'result': result,
                        'confidence': 0.9
                    }
                else:
                    logger.error(f"Invalid API response format: {response}")
                    return None
                    
            except Exception as e:
                logger.error(f"API call failed: {str(e)}")
                return None

        except Exception as e:
            logger.error(f"General error in analyze_image: {str(e)}")
            return None

    async def analyze_image_with_zhipuai(self, image_input: Union[str, bytes], analysis_type: str, input_type: str = 'file') -> Dict[str, Any]:
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
                image_data = await self._download_image(image_input)
                if not image_data:
                    raise ValueError(f"无法下载图片: {image_input}")
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

            # 修改提示词
            prompts = {
                'translate': [
                    {
                        "role": "system",
                        "content": (
                            "你是一个智能物品识别翻译助手。请按照以下规则：\n"
                            "1. 识别图片中手指指向的物品\n"
                            "2. 提供该物品的英文单词\n"
                            "3. 如果可能，提供音标和例句\n"
                            "4. 返回格式：\n"
                            "   物品：[中文名称]\n"
                            "   英文：[English Word]\n"
                            "   音标：[Phonetic]\n"
                            "   例句：[Example Sentence]\n"
                            "5. 如果看到多个手指指向的物品，请分别列出\n"
                            "6. 如果没有看到手指，请提示用户'请用手指指向要翻译的物品'"
                        )
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "请识别图片中手指指向的物品，并提供其英文翻译。"
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

            # 修改这里：使用 glm-4v-plus 模型
            response = self.client.chat.completions.create(
                model="glm-4v-plus",  # 改为 glm-4v-plus
                messages=prompt,
                temperature=0.7,
                max_tokens=1000
            )

            if response and hasattr(response, 'choices'):
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

    # 清理临时文件的方法
    async def _cleanup_temp_images(self):
        temp_dir = Path("temp_images")
        if temp_dir.exists():
            for file in temp_dir.glob("*.jpg"):
                try:
                    # 删除超过1小时的文件
                    if (time.time() - file.stat().st_mtime) > 3600:
                        os.remove(file)
                except Exception as e:
                    logger.error(f"清理临时文件失败: {str(e)}") 