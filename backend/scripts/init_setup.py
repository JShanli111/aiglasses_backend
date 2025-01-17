import os
import json

def create_directories():
    """创建必要的目录"""
    directories = [
        "uploads",
        "app/calorie_analysis",
        "app/navigation",
        "app/image_translation",
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"创建目录: {directory}")

def create_food_calories_db():
    """创建食物卡路里数据库文件"""
    food_calories = {
        "pizza": 266,
        "hamburger": 250,
        "sushi": 150,
        "salad": 100,
        "pasta": 200,
        "rice": 130,
        "chicken": 165,
        "fish": 140,
        "steak": 250,
        "sandwich": 200,
        "soup": 100,
        "noodles": 190,
        "bread": 265,
        "cake": 300,
        "ice cream": 250,
        "fruit": 60,
        "vegetables": 40,
        "eggs": 155,
        "milk": 50,
        "coffee": 2
    }
    
    file_path = "app/calorie_analysis/food_calories.json"
    with open(file_path, "w") as f:
        json.dump(food_calories, f, indent=4)
    print(f"创建食物卡路里数据库: {file_path}")

def main():
    """运行所有初始化步骤"""
    print("开始初始化项目...")
    create_directories()
    create_food_calories_db()
    print("初始化完成!")

if __name__ == "__main__":
    main() 