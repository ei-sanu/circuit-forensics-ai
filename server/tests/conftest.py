import pytest
import asyncio
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

import app.core.database as db_mod
from app.models.base import Base
from app.core.security import hash_password
from app.core.jwt import create_access_token
from app.core.permissions import Role
from app.utils.biometric_crypto import BiometricCryptoUtil
from app.models import (
    User, Case, Entity, Relationship, Alert, BiometricCredential, AuthChallenge,
    Transaction, Communication, Document, FIR, AuditLog
)

# Configure test SQLite in-memory engine
test_db_url = "sqlite+aiosqlite:///:memory:"
test_engine = create_async_engine(test_db_url, echo=False)
test_session_maker = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

db_mod.db_manager.engine = test_engine
db_mod.db_manager.session_maker = test_session_maker
db_mod.get_session_maker = lambda: test_session_maker

from app.main import app

@pytest.fixture(scope="session", autouse=True)
def init_test_db():
    async def _setup():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        seed_pwd = hash_password("demo123")
        now = datetime.now(timezone.utc)

        async with test_session_maker() as session:
            # Seed users
            users = [
                User(user_id="usr-inv-01", email="investigator@circuit.gov", password_hash=seed_pwd, name="Lead Investigator", role="investigator", is_active=True, status="approved"),
                User(user_id="usr-ana-01", email="analyst@circuit.gov", password_hash=seed_pwd, name="Senior Analyst", role="analyst", is_active=True, status="approved"),
                User(user_id="usr-adm-01", email="admin@circuit.gov", password_hash=seed_pwd, name="System Administrator", role="admin", is_active=True, status="approved"),
                User(user_id="usr-hr-01", email="hr@circuit.gov", password_hash=seed_pwd, name="HR Manager", role="hr", is_active=True, status="approved"),
                User(user_id="usr-pol-01", email="police@circuit.gov", password_hash=seed_pwd, name="Inspector Vikram", role="police_station", is_active=True, status="approved"),
            ]
            session.add_all(users)

            # Seed cases
            cases = [
                Case(case_number="CR-2026-00124", title="Operation Nightfall", summary="Multi-jurisdiction syndicate", status="active", priority="critical", assigned_investigators=["Vikram Rao"], tags=["hawala"], entity_ids=["P-0001", "P-0002"]),
                Case(case_number="CR-2026-00842", title="Operation Goldcrest", summary="Dubai corridor", status="active", priority="critical", assigned_investigators=["Maya Sen"], tags=["bullion"], entity_ids=["P-0004", "P-0005"]),
            ]
            session.add_all(cases)

            # Seed entities
            entities = [
                Entity(entity_id="P-0001", type="person", name="Vikram Rathore", risk_flag=True, influence_score=92.5, cases=["CR-2026-00124"], aliases=["Vicky"]),
                Entity(entity_id="P-0002", type="person", name="Sunil Verma", risk_flag=True, influence_score=84.2, cases=["CR-2026-00124"], aliases=["SV"]),
            ]
            session.add_all(entities)

            # Seed relationships
            rels = [
                Relationship(source_id="P-0001", target_id="P-0002", rel_type="associated_with", weight=8.0, confidence=0.95, case_id="CR-2026-00124")
            ]
            session.add_all(rels)

            # Seed alerts
            alerts = [
                Alert(alert_id="ALT-2026-001", detector_name="Hawala Layering", severity="critical", title="Rapid Mule Dispersal", explanation="Suspicious flow", confidence=0.98, status="open", case_id="CR-2026-00124")
            ]
            session.add_all(alerts)

            # Seed biometrics
            norm_vec = [0.1] * 128
            enc = BiometricCryptoUtil.encrypt_template(norm_vec)
            bio = BiometricCredential(
                user_id="usr-inv-01",
                user_email="investigator@circuit.gov",
                template_encrypted=enc,
                algorithm="AES-256-GCM",
                model_version="circuit-facenet-v1",
                quality_score=96.5,
                status="active"
            )
            session.add(bio)

            await session.commit()

    asyncio.run(_setup())

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def admin_token():
    payload = {
        "sub": "usr-adm-01",
        "email": "admin@circuit.gov",
        "role": Role.ADMIN.value,
        "name": "System Administrator",
    }
    return create_access_token(payload)

@pytest.fixture
def investigator_token():
    payload = {
        "sub": "usr-inv-01",
        "email": "investigator@circuit.gov",
        "role": Role.INVESTIGATOR.value,
        "name": "Lead Investigator",
    }
    return create_access_token(payload)

@pytest.fixture
def analyst_token():
    payload = {
        "sub": "usr-ana-01",
        "email": "analyst@circuit.gov",
        "role": Role.ANALYST.value,
        "name": "Senior Analyst",
    }
    return create_access_token(payload)

@pytest.fixture
def hr_token():
    payload = {
        "sub": "usr-hr-01",
        "email": "hr@circuit.gov",
        "role": Role.HR.value,
        "name": "HR Manager",
    }
    return create_access_token(payload)
