"""
NESTOR AI — Property Valuation Intelligence Platform
FastAPI Backend — Phase 1: Foundation
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os

from app.routers import health, meta, valuation, market

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nestor")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("NESTOR AI backend starting up...")
    yield
    logger.info("NESTOR AI backend shutting down.")

app = FastAPI(
    title="NESTOR AI",
    description="Property Valuation Intelligence Platform — Backend API",
    version="0.1.0",
    lifespan=lifespan,
)

# Standard local development origins
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

# Allow environment variable override if provided
env_origins = os.getenv("CORS_ORIGINS")
if env_origins:
    ALLOWED_ORIGINS = [origin.strip() for origin in env_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(meta.router, prefix="/api/meta")
app.include_router(valuation.router, prefix="/api")
app.include_router(market.router, prefix="/api/market")
