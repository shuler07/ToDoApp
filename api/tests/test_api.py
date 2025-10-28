import pytest
from fastapi.testclient import TestClient

from main import app
from schemas.userschema import UserSchema, UserCredsSchema

tester = TestClient(app=app)


@pytest.fixture
def user_schema():
    user = UserSchema(
        username="testuser", email="levelediters@gmail.com", password="testpassword"
    )
    yield user.model_dump()


@pytest.fixture
def user_creds_schema():
    user_creds = UserCredsSchema(
        email="levelediters@gmail.com", password="testpassword"
    )
    yield user_creds.model_dump()


def test_register(user_schema) -> None:
    response = tester.post(url="/auth/register", json=user_schema)

    assert response.status_code == 200
    assert response.json() == {"isRegistered": False, "error": "exists"}


def test_login(user_creds_schema) -> None:
    response = tester.post(url="/auth/login", json=user_creds_schema)

    assert response.status_code == 200
    assert response.json() == {
        "isLoggedIn": True,
        "username": "testuser",
        "email": "levelediters@gmail.com",
    }
