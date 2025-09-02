import os
import logging
import asyncio
from aiogram import Bot, Dispatcher, types, Router, F
from aiogram.enums import ContentType
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application
from aiogram.filters import Command
from aiohttp import web
from ultralytics import YOLO


from matplotlib import pyplot as plt
import cv2
import numpy as np
import tempfile

TOKEN = os.getenv("TELEGRAM_API_TOKEN")
if not TOKEN:
    raise ValueError("TELEGRAM_API_TOKEN not set")

ENV = os.getenv("BOT_ENV", "development")
WEBHOOK_PATH = "/webhook/bot"
WEBHOOK_URL = os.getenv("WEBHOOK_URL")  # только для production

# Логирование (полезно в докере)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создание объектов бота и диспетчера
bot = Bot(token=TOKEN)
dp = Dispatcher(storage=MemoryStorage())
router = Router()
model = YOLO("yolo_model.pt")

COLORS = {
    "tomato_ripe": (77, 77, 255),        # BGR для красного (#ff4d4d)
    "tomato_semi_ripe": (0, 215, 255),   # BGR для жёлтого (#ffd700)
    "tomato_green": (50, 205, 50),       # BGR для зелёного (#32cd32)
}

LABELS = {
    "tomato_ripe": "Спелые",
    "tomato_semi_ripe": "Полуспелые",
    "tomato_green": "Зелёные"
}

# Обработчик фотографий
@router.message(F.content_type == ContentType.PHOTO)
async def handle_photo(msg: types.Message):
    photo = msg.photo[-1]
    file = await bot.get_file(photo.file_id)
    temp_dir = tempfile.gettempdir()
    path = os.path.join(temp_dir, f"{photo.file_unique_id}.jpg")
    await bot.download_file(file.file_path, path)

    # Запуск модели
    results = model(path)
    result = results[0]

    # Чтение исходного изображения
    img = cv2.imread(path)

    # Подсчёт статистики
    summary = {"total": 0, "tomato_ripe": 0, "tomato_semi_ripe": 0, "tomato_green": 0}

    for det in result.boxes.data.tolist():
        x1, y1, x2, y2, conf, cls = det
        class_name = result.names[int(cls)]
        if class_name not in COLORS:
            continue  # если не интересующий нас класс

        color = COLORS[class_name]
        cv2.rectangle(img, (int(x1), int(y1)), (int(x2), int(y2)), color, 3)

        summary["total"] += 1
        summary[class_name] += 1

    # Сохранение изображения
    result_path = os.path.join(temp_dir, f"result_{photo.file_unique_id}.jpg")
    cv2.imwrite(result_path, img)

    # Построим диаграмму
    pie_path = os.path.join(temp_dir, f"pie_{photo.file_unique_id}.png")
    labels = []
    values = []
    colors = []

    for key in ["tomato_ripe", "tomato_semi_ripe", "tomato_green"]:
        if summary[key] > 0:
            labels.append(LABELS[key])
            values.append(summary[key])
            colors.append('#%02x%02x%02x' % COLORS[key][::-1])  # BGR -> RGB hex

    if values:
        fig, ax = plt.subplots()
        wedges, texts, autotexts = ax.pie(
            values, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90
        )
        ax.axis('equal')
        plt.tight_layout()
        plt.savefig(pie_path)
        plt.close()
    else:
        pie_path = None

    # Отправка пользователю
    await msg.answer_photo(types.FSInputFile(result_path), caption="🧠 Анализ завершён!")

    stat_text = (
        f"📊 Статистика:\n"
        f"Всего: {summary['total']}\n"
        f"Спелые 🔴: {summary['tomato_ripe']}\n"
        f"Полуспелые 🟡: {summary['tomato_semi_ripe']}\n"
        f"Зелёные 🟢: {summary['tomato_green']}"
    )
    await msg.answer(stat_text)

    if pie_path:
        await msg.answer_photo(types.FSInputFile(pie_path), caption="📈 Диаграмма распределения")

# Обработчик команды /start
@router.message(Command("start"))
async def welcome(msg: types.Message):
    await msg.answer("Привет! Отправь фото, и YOLO его проанализирует.")

# Подключаем маршруты
dp.include_router(router)

# Установка вебхука в production
async def on_startup():
    if ENV == "production" and WEBHOOK_URL:
        await bot.set_webhook(WEBHOOK_URL)
        logger.info(f"Webhook set to {WEBHOOK_URL}")

# Основной запуск приложения
async def main():
    if ENV == "production":
        app = web.Application()
        setup_application(app, dp, bot=bot)
        SimpleRequestHandler(dispatcher=dp, bot=bot).register(app, path=WEBHOOK_PATH)
        await on_startup()
        runner = web.AppRunner(app)
        await runner.setup()
        site = web.TCPSite(runner, "0.0.0.0", 8000)
        await site.start()

        logger.info("Bot is running via webhook...")

        # Бесконечное ожидание (ждет до остановки контейнера)
        await asyncio.Event().wait()

    else:
        await bot.delete_webhook(drop_pending_updates=True)
        logger.info("Starting polling in development mode")
        await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())