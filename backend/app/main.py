from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import auth, ai_interaction, quiz, ai

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(ai_interaction.router)
app.include_router(quiz.router)
app.include_router(ai.router)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "bitpath-backend",
        "environment": settings.app_env,
    }