from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from .routers import auth, users, restaurant, hotel, payments, media
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="James Livengood API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/media/files", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(restaurant.router, prefix="/restaurant", tags=["restaurant"])
app.include_router(hotel.router, prefix="/hotel", tags=["hotel"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])
app.include_router(media.router, prefix="/media", tags=["media"])


@app.get("/")
def root():
    return {"message": "James Livengood API — visit /docs for the interactive API explorer"}
