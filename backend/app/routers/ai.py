from fastapi import APIRouter, Depends

from app.core.security import CurrentUser, get_current_user
from app.schemas.ai import LessonChatRequest, LessonChatResponse
from app.services.ai_service import AICompanionService

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/lesson-chat", response_model=LessonChatResponse)
def lesson_chat(
    payload: LessonChatRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    service = AICompanionService()
    return service.handle_lesson_chat(current_user.user_id, payload)