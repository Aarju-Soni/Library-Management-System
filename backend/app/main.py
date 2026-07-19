import os
from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models import Base
from app.routers.books import router as books_router
from app.routers.members import router as members_router
from app.routers.borrow import router as borrow_router


load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI()
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Library Management System",
    }


app.include_router(books_router)
app.include_router(members_router)
app.include_router(borrow_router)