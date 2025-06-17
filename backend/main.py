from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import calculator

app = FastAPI(
    title="Black-Scholes API",
    description="Black-Scholes Options Pricing Calculator API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(calculator.router, prefix="/api", tags=["calculator"])

@app.get("/")
async def root():
    return {"message": "Black-Scholes API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    