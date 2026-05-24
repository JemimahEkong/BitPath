from pydantic import BaseModel, Field


class LessonChatRequest(BaseModel):
    lesson_id: str
    message: str = Field(min_length=1, max_length=1000)
    stage_number: int = Field(default=1, ge=1)


class LessonChatResponse(BaseModel):
    ai_response: str | None
    used_interactions: int
    remaining_interactions: int
    max_interactions: int
    warning: str | None
    must_take_quiz: bool