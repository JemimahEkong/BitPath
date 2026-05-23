from fastapi import FastAPI

app = FastAPI(title="BitPath API")


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "bitpath-backend",
    }