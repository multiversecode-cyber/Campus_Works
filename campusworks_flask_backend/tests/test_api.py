
import pytest
from app import create_app, db


@pytest.fixture()
def app():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite://",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
        "SECRET_KEY": "test-secret-key-for-campusworks-tests-2026",
        "JWT_SECRET_KEY": "test-jwt-secret-key-for-campusworks-tests-2026",
    })

    with app.app_context():
        db.drop_all()
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def register(
    client,
    name,
    email,
    password="TestPass123!",
    role="student",
):
    return client.post(
        "/api/auth/register",
        json={
            "name": name,
            "email": email,
            "password": password,
            "role": role,
        },
    )


def login(client, email, password="TestPass123!"):
    return client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )


def auth_headers(response):
    token = response.get_json()["accessToken"]
    return {"Authorization": f"Bearer {token}"}


def create_test_opportunity(client, headers):
    return client.post(
        "/api/opportunities",
        headers=headers,
        json={
            "title": "Automated Test Opportunity",
            "organization": "CampusWorks Test Club",
            "type": "Volunteer",
            "location": "Test Campus",
            "deadline": "2099-12-31",
            "description": (
                "Opportunity created by an automated test."
            ),
            "payment": "Certificate",
            "skills": ["Python", "Testing"],
            "status": "published",
            "contactName": "Test Recruiter",
"contactEmail": "recruiter@example.com",
"contactPhone": "9876543210",
        },
    )


def test_health_endpoint(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"


def test_register_student(client):
    response = register(
        client,
        "Test Student",
        "student@example.com",
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data["user"]["email"] == "student@example.com"
    assert data["user"]["role"] == "student"
    assert "accessToken" in data


def test_duplicate_email_is_rejected(client):
    register(client, "Student One", "duplicate@example.com")

    response = register(
        client,
        "Student Two",
        "duplicate@example.com",
    )

    assert response.status_code == 409


def test_short_password_is_rejected(client):
    response = register(
        client,
        "Test Student",
        "shortpass@example.com",
        password="123",
    )

    assert response.status_code == 400


def test_login_success(client):
    register(client, "Test Student", "login@example.com")

    response = login(client, "login@example.com")

    assert response.status_code == 200
    assert "accessToken" in response.get_json()


def test_wrong_password_is_rejected(client):
    register(client, "Test Student", "wrongpass@example.com")

    response = login(
        client,
        "wrongpass@example.com",
        password="WrongPassword123!",
    )

    assert response.status_code == 401


def test_profile_requires_login(client):
    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_logged_in_user_can_view_profile(client):
    response = register(
        client,
        "Profile Student",
        "profile@example.com",
    )
    headers = auth_headers(response)

    profile = client.get(
        "/api/auth/me",
        headers=headers,
    )

    assert profile.status_code == 200
    assert profile.get_json()["user"]["name"] == "Profile Student"


def test_student_cannot_create_opportunity(client):
    response = register(
        client,
        "Regular Student",
        "regular@example.com",
    )
    headers = auth_headers(response)

    opportunity = create_test_opportunity(client, headers)

    assert opportunity.status_code == 403


def test_faculty_can_create_published_opportunity(client):
    response = register(
        client,
        "Test Faculty",
        "faculty@example.com",
        role="faculty",
    )
    headers = auth_headers(response)

    opportunity = create_test_opportunity(client, headers)

    assert opportunity.status_code == 201
    assert (
        opportunity.get_json()["opportunity"]["title"]
        == "Automated Test Opportunity"
    )


def test_students_can_list_published_opportunities(client):
    response = register(
        client,
        "Test Faculty",
        "listing-faculty@example.com",
        role="faculty",
    )
    headers = auth_headers(response)
    create_test_opportunity(client, headers)

    response = client.get("/api/opportunities")

    assert response.status_code == 200
    titles = [
        item["title"]
        for item in response.get_json()["opportunities"]
    ]
    assert "Automated Test Opportunity" in titles


def test_student_can_apply_and_duplicate_application_is_rejected(client):
    faculty = register(
        client,
        "Test Faculty",
        "apply-faculty@example.com",
        role="faculty",
    )
    faculty_headers = auth_headers(faculty)

    created = create_test_opportunity(
        client,
        faculty_headers,
    )
    opportunity_id = created.get_json()["opportunity"]["id"]

    student = register(
        client,
        "Applying Student",
        "applicant@example.com",
    )
    student_headers = auth_headers(student)

    url = f"/api/opportunities/{opportunity_id}/apply"

    first_response = client.post(
        url,
        headers=student_headers,
        json={},
    )
    second_response = client.post(
        url,
        headers=student_headers,
        json={},
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_student_can_view_own_applications(client):
    faculty = register(
        client,
        "Test Faculty",
        "applications-faculty@example.com",
        role="faculty",
    )
    faculty_headers = auth_headers(faculty)

    created = create_test_opportunity(
        client,
        faculty_headers,
    )
    opportunity_id = created.get_json()["opportunity"]["id"]

    student = register(
        client,
        "Applications Student",
        "applications-student@example.com",
    )
    student_headers = auth_headers(student)

    client.post(
        f"/api/opportunities/{opportunity_id}/apply",
        headers=student_headers,
        json={},
    )

    response = client.get(
        "/api/applications/me",
        headers=student_headers,
    )

    assert response.status_code == 200
    assert len(response.get_json()["applications"]) == 1
