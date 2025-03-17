from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from apps.calculator.route import router as calculator_router
from constants import SERVER_URL, PORT, ENV

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(lifespan=lifespan)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173", "*"],  # Allow all origins including Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check route
@app.get("/")
async def root():
    return {"message": "Server is running"}

# Include router with correct prefix
app.include_router(calculator_router, prefix="/calculate", tags=["calculate"])

# Run server with proper environment check
if __name__ == "__main__":
    try:
        uvicorn.run(
            "main:app",
            host=SERVER_URL if SERVER_URL else "127.0.0.1",  # Default to localhost
            port=int(PORT) if PORT else 8000,  # Default to port 8000
            reload=(ENV.lower() == "dev" if ENV else False)
        )
    except Exception as e:
        print(f"Error starting server: {e}")
