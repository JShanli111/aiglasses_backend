import sys
import os
import asyncio
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.append(str(Path(__file__).parent.parent))

from app.core.ai_client import AIClient

async def test_translation():
    client = AIClient()
    # 测试英文文本图片
    with open("tests/test_images/english_text.jpg", "rb") as f:
        image_data = f.read()
    
    result = client.analyze_image(image_data, 'translate')
    print("\n=== 翻译测试结果 ===")
    print(f"原文: {result.get('original_text', '')}")
    print(f"翻译: {result.get('translated_text', '')}")
    print(f"源语言: {result.get('source_language', '')}")

async def test_calories():
    client = AIClient()
    # 测试食物图片
    with open("tests/test_images/food.jpg", "rb") as f:
        image_data = f.read()
    
    result = client.analyze_image(image_data, 'calories')
    print("\n=== 卡路里分析测试结果 ===")
    print(f"总卡路里: {result.get('total_calories', 0)}")
    print("食物项目:")
    for item in result.get('food_items', []):
        print(f"- {item['food_name']}: {item['calories']}卡路里 (置信度: {item['confidence']})")

async def test_navigation():
    client = AIClient()
    # 测试场景图片
    with open("tests/test_images/scene.jpg", "rb") as f:
        image_data = f.read()
    
    result = client.analyze_image(image_data, 'navigation')
    print("\n=== 导航测试结果 ===")
    print(f"警告级别: {result.get('warning_level', '')}")
    print("检测到的障碍物:")
    for obstacle in result.get('obstacles', []):
        print(f"- 类型: {obstacle['type']}, 距离: {obstacle['distance']}米")
    safe_path = result.get('safe_path', {})
    print(f"建议路径: {safe_path.get('direction', '')} (角度: {safe_path.get('angle', 0)}°)")

async def main():
    # 创建测试目录
    os.makedirs("tests/test_images", exist_ok=True)
    
    print("开始AI功能测试...")
    
    try:
        await test_translation()
        await test_calories()
        await test_navigation()
    except Exception as e:
        print(f"测试过程中出现错误: {str(e)}")
    
    print("\n测试完成!")

if __name__ == "__main__":
    asyncio.run(main()) 