from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth import router as auth_router
from routes.exams import router as exams_router
from routes.reports import router as reports_router
from routes.violations import router as violations_router

app = FastAPI(title="Exam Proctor AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(exams_router, prefix="/exams", tags=["Exams"])
app.include_router(violations_router, prefix="/violations", tags=["Violations"])
app.include_router(reports_router, prefix="/report", tags=["Reports"])


@app.get("/")
def root():
    return {"status": "Exam Proctor AI is running"}