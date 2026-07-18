from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models import Base
from app.routers.books import router as books_router
from app.routers.members import router as members_router
from app.routers.borrow import router as borrow_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Library Management System",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://library-management-system-vert-pi.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Library Management System API",
    }


# Register routers
app.include_router(books_router)
app.include_router(members_router)
app.include_router(borrow_router)