from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.users import user_router
from .routes.categories import category_router
from .routes.operations import operation_router
from .database.connection import init_db
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(category_router)
app.include_router(operation_router)

@app.on_event("startup")
async def on_startup():
    await init_db()

if __name__ == '__main__':
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)