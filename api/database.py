from typing import AsyncGenerator, Annotated, Any
from fastapi import Depends
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio.engine import create_async_engine
from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession, AsyncEngine
from redis.asyncio.client import Redis
import json

from os import environ
from dotenv import load_dotenv

load_dotenv()


# Base class for all databases to create with one command
class Base(DeclarativeBase):
    pass


class PostgresDB:
    def __init__(self, url: str | None = environ.get("URL_DATABASE_POSTGRES")) -> None:
        if url is None:
            raise ValueError("URL of database not found")

        self.engine: AsyncEngine = create_async_engine(url=url)
        self.session: async_sessionmaker[AsyncSession] = async_sessionmaker(
            bind=self.engine, expire_on_commit=False
        )

    def get_engine(self) -> AsyncEngine:
        return self.engine

    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        async with self.session() as ses:
            yield ses

    async def create_all_tables(self) -> None:
        async with self.get_engine().begin() as conn:
            await conn.run_sync(Base.metadata.create_all)


pg = PostgresDB()
sessionDep = Annotated[AsyncSession, Depends(pg.get_session)]


class RedisDB:

    def __init__(self) -> None:
        self.redis = Redis(host="redis", port=6379)

    def is_redis_connected(self) -> bool:
        if self.redis is None:
            print("Error: Redis not connected")
            return False
        return True

    async def set_cache(self, key: str, value: Any, exp: int | None) -> None:
        if not self.is_redis_connected():
            return
        try:
            await self.redis.set(key, json.dumps(value), exp)
        except Exception as e:
            print(f"Error while saving data to redis: {key} - {value} ({exp}s)", e)

    async def get_cache(self, key: str) -> Any | None:
        if not self.is_redis_connected():
            return
        try:
            data = await self.redis.get(key)
            return json.loads(data) if data else None
        except:
            print(f"Error while getting data from redis: {key}")
            return None


rd = RedisDB()
