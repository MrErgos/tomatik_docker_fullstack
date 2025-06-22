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

# Обработчик фотографий
@router.message(F.content_type == ContentType.PHOTO)
async def handle_photo(msg: types.Message):
    photo = msg.photo[-1]
    file = await bot.get_file(photo.file_id)
    path = f"/tmp/{photo.file_unique_id}.jpg"
    await bot.download_file(file.file_path, path)

    results = model(path)
    result_path = f"/tmp/result_{photo.file_unique_id}.jpg"
    results[0].save(filename=result_path)

    await msg.answer_photo(types.FSInputFile(result_path))

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