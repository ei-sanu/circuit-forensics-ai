import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession, AsyncEngine
from app.core.config import settings
from app.models.base import Base
import app.models  # Ensure all models are registered with Base

logger = logging.getLogger("CIRCUIT.Database")

class DatabaseManager:
    engine: AsyncEngine = None
    session_maker: async_sessionmaker[AsyncSession] = None

db_manager = DatabaseManager()

def get_engine_url() -> tuple[str, dict]:
    url = settings.database_url.strip()
    # Ensure postgresql+asyncpg driver prefix
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    connect_args = {}

    # Supabase / PgBouncer / Remote host detection
    is_remote = not any(local_host in url for local_host in ("localhost", "127.0.0.1", "postgres:", "@postgres/"))
    is_supabase = "supabase.co" in url or "supabase.com" in url

    # Remove query string parameters that asyncpg handles via connect_args
    if "?" in url:
        base_url, query = url.split("?", 1)
        # Parse query params
        params = dict(param.split("=", 1) for param in query.split("&") if "=" in param)
        if "sslmode" in params:
            if params["sslmode"] in ("require", "verify-ca", "verify-full"):
                connect_args["ssl"] = "require"
        url = base_url

    # For remote/Supabase connections, ensure SSL and disable prepared statement caching for PgBouncer/Supavisor
    if is_remote or is_supabase:
        if "ssl" not in connect_args:
            connect_args["ssl"] = "require"
        connect_args["statement_cache_size"] = 0
        connect_args["prepared_statement_cache_size"] = 0

    return url, connect_args

async def connect_to_database():
    """Connect to PostgreSQL (Supabase / local) and create all tables."""
    db_url, connect_args = get_engine_url()
    try:
        masked_url = db_url.split('@')[-1] if '@' in db_url else db_url
        logger.info(f"Connecting to PostgreSQL Database at {masked_url}...")
        db_manager.engine = create_async_engine(
            db_url,
            echo=False,
            pool_pre_ping=True,
            pool_recycle=600,
            pool_size=15,
            max_overflow=25,
            pool_timeout=15,
            connect_args=connect_args,
        )
        db_manager.session_maker = async_sessionmaker(
            db_manager.engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )

        async with db_manager.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Successfully connected to PostgreSQL Database & verified tables.")
    except Exception as e:
        logger.warning(f"PostgreSQL connection notice ({e}). Initializing fallback SQLite engine...")
        fallback_url = "sqlite+aiosqlite:///./circuit.db"
        db_manager.engine = create_async_engine(
            fallback_url,
            echo=False,
        )
        db_manager.session_maker = async_sessionmaker(
            db_manager.engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
        async with db_manager.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Fallback Database initialized & tables created.")

async def close_database_connection():
    """Close Database connection engine."""
    if db_manager.engine:
        logger.info("Disposing Database engine pool...")
        await db_manager.engine.dispose()
        logger.info("Database connection closed.")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for obtaining async database sessions."""
    if db_manager.session_maker is None:
        await connect_to_database()
    async with db_manager.session_maker() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

def get_session_maker() -> async_sessionmaker[AsyncSession]:
    """Return active session maker."""
    if db_manager.session_maker is None:
        db_url, connect_args = get_engine_url()
        try:
            db_manager.engine = create_async_engine(db_url, echo=False, pool_pre_ping=True, pool_recycle=300, connect_args=connect_args)
            db_manager.session_maker = async_sessionmaker(
                db_manager.engine,
                class_=AsyncSession,
                expire_on_commit=False,
            )
        except Exception:
            db_manager.engine = create_async_engine("sqlite+aiosqlite:///./circuit.db", echo=False)
            db_manager.session_maker = async_sessionmaker(
                db_manager.engine,
                class_=AsyncSession,
                expire_on_commit=False,
            )
    return db_manager.session_maker
