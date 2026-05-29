from app.core.config import get_settings
from app.core.supabase import get_supabase_client
from app.schemas.ai import LessonChatRequest, LessonChatResponse


class AICompanionService:
    def __init__(self):
        self.settings = get_settings()
        self.supabase = get_supabase_client()

    def handle_lesson_chat(self, user_id: str, payload: LessonChatRequest) -> LessonChatResponse:
        max_interactions = self._stage_limit(payload.stage_number)
        used_interactions = self._count_used_interactions(
            user_id=user_id,
            lesson_id=payload.lesson_id,
            stage_number=payload.stage_number,
        )

        if used_interactions >= max_interactions:
            return LessonChatResponse(
                ai_response=None,
                used_interactions=used_interactions,
                remaining_interactions=0,
                max_interactions=max_interactions,
                warning="Your AI help sessions are complete. It is time to take the quiz.",
                must_take_quiz=True,
            )

        interaction_number = used_interactions + 1
        ai_response = self._build_placeholder_response(payload.message)
        remaining_interactions = max_interactions - interaction_number

        self.supabase.table("ai_interactions").insert(
            {
                "user_id": user_id,
                "lesson_id": payload.lesson_id,
                "stage_number": payload.stage_number,
                "interaction_number": interaction_number,
                "user_message": payload.message,
                "ai_response": ai_response,
            }
        ).execute()

        return LessonChatResponse(
            ai_response=ai_response,
            used_interactions=interaction_number,
            remaining_interactions=remaining_interactions,
            max_interactions=max_interactions,
            warning=self._warning_for_remaining(remaining_interactions),
            must_take_quiz=remaining_interactions == 0,
        )

    def _stage_limit(self, stage_number: int) -> int:
        return self.settings.ai_stage_one_limit + ((stage_number - 1) * self.settings.ai_stage_increment)

    def _count_used_interactions(self, user_id: str, lesson_id: str, stage_number: int) -> int:
        response = (
            self.supabase.table("ai_interactions")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .eq("lesson_id", lesson_id)
            .eq("stage_number", stage_number)
            .execute()
        )

        return response.count or 0

    def _warning_for_remaining(self, remaining_interactions: int) -> str | None:
        if 0 < remaining_interactions <= self.settings.ai_warning_threshold:
            return f"You have {remaining_interactions} AI interaction(s) left before the quiz."

        return None

    def _build_placeholder_response(self, message: str) -> str:
        return (
            "I hear your question. For the MVP, I am tracking this interaction so your quiz can "
            "come from what you asked about. Together AI will replace this placeholder response next. "
            f"Your question was: {message}"
        )