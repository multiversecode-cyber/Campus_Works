from functools import wraps
from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from sqlalchemy import or_
from . import db
from .models import User, Opportunity, Application, Notification

api = Blueprint("api", __name__)
APPLICATION_STATUSES = {"Applied", "Under Review", "Shortlisted", "Selected", "Rejected", "Completed"}

def error(message, status=400):
    return jsonify({"error": message}), status

def current_user():
    identity = get_jwt_identity()
    return db.session.get(User, int(identity)) if identity else None

def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            user = current_user()
            if not user:
                return error("Account not found.", 401)
            if user.role not in roles:
                return error("You do not have permission to do this.", 403)
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def body():
    return request.get_json(silent=True) or {}

@api.post("/auth/register")
def register():
    data = body()
    name, email = str(data.get("name", "")).strip(), str(data.get("email", "")).strip().lower()
    password, role = str(data.get("password", "")), str(data.get("role", "student")).lower()
    if not name or not email or not password:
        return error("Name, email and password are required.")
    if len(password) < 8:
        return error("Password must be at least 8 characters.")
    if role not in {"student", "faculty", "club"}:
        return error("Choose student, faculty or club role.")
    if User.query.filter_by(email=email).first():
        return error("An account with this email already exists.", 409)
    user = User(name=name, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"accessToken": create_access_token(identity=str(user.id)),
                    "user": user.to_dict()}), 201

@api.post("/auth/login")
def login():
    data = body()
    user = User.query.filter_by(email=str(data.get("email", "")).strip().lower()).first()
    if not user or not user.check_password(str(data.get("password", ""))):
        return error("Invalid email or password.", 401)
    return jsonify({"accessToken": create_access_token(identity=str(user.id)),
                    "user": user.to_dict()})

@api.get("/auth/me")
@jwt_required()
def me():
    user = current_user()
    return jsonify({"user": user.to_dict()}) if user else error("Account not found.", 404)

@api.patch("/users/me")
@role_required("student", "faculty", "club")
def update_profile():
    user, data = current_user(), body()
    for key in ("name", "course", "year", "bio"):
        if key in data:
            setattr(user, key, str(data[key]).strip())
    if "skills" in data:
        if not isinstance(data["skills"], list):
            return error("skills must be a list.")
        user.skills = [str(s).strip() for s in data["skills"] if str(s).strip()]
    db.session.commit()
    return jsonify({"user": user.to_dict()})

@api.get("/opportunities")
def list_opportunities():
    query = Opportunity.query.filter_by(status="published")
    search, kind, location = (request.args.get(k, "").strip() for k in ("search", "type", "location"))
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Opportunity.title.ilike(like),
                                 Opportunity.organization.ilike(like),
                                 Opportunity.description.ilike(like)))
    if kind and kind.lower() != "all":
        query = query.filter_by(type=kind)
    if location and location.lower() != "all":
        query = query.filter_by(location=location)
    return jsonify({"opportunities": [o.to_dict() for o in query.order_by(Opportunity.created_at.desc()).all()]})

@api.get("/opportunities/<int:oid>")
def get_opportunity(oid):
    item = db.session.get(Opportunity, oid)
    if not item or item.status != "published":
        return error("Opportunity not found.", 404)
    return jsonify({"opportunity": item.to_dict()})


@api.post("/opportunities")
@role_required("faculty", "club")
def create_opportunity():
    user, data = current_user(), body()

    required = (
        "title",
        "organization",
        "type",
        "location",
        "deadline",
        "description",
        "contactName",
        "contactEmail"
    )

    missing = [f for f in required if not str(data.get(f, "")).strip()]
    if missing:
        return error("Required fields missing: " + ", ".join(missing))

    skills = data.get("skills", [])
    if not isinstance(skills, list):
        return error("skills must be a list.")

    item = Opportunity(
        title=str(data["title"]).strip(),
        organization=str(data["organization"]).strip(),
        type=str(data["type"]).strip(),
        location=str(data["location"]).strip(),
        deadline=str(data["deadline"]).strip(),
        payment=str(data.get("payment", "")).strip(),
        skills=[str(s).strip() for s in skills if str(s).strip()],
        description=str(data["description"]).strip(),
        contact_name=str(data.get("contactName", "")).strip(),
        contact_email=str(data.get("contactEmail", "")).strip(),
        contact_phone=str(data.get("contactPhone", "")).strip(),
        owner_id=user.id
    )

    db.session.add(item)
    db.session.commit()

    return jsonify({"opportunity": item.to_dict()}), 201


@api.patch("/opportunities/<int:oid>")
@jwt_required()
def update_opportunity(oid):
    user = current_user()
    item = db.session.get(Opportunity, oid)
    data = body()

    if not item:
        return error("Opportunity not found.", 404)

    # Only the owner or an admin can edit this opportunity.
    if user.role != "admin" and item.owner_id != user.id:
        return error("You cannot edit this opportunity.", 403)

    # Update standard opportunity fields.
    editable_fields = {
        "title",
        "organization",
        "type",
        "location",
        "deadline",
        "payment",
        "description",
        "status",
    }

    for key in editable_fields:
        if key in data:
            value = str(data[key]).strip()

            if key in {"title", "organization", "type", "location", "description"} and not value:
                return error(f"{key} cannot be empty.")

            setattr(item, key, value)

    # Update recruiter contact details from the frontend.
    contact_fields = {
        "contactName": "contact_name",
        "contactEmail": "contact_email",
        "contactPhone": "contact_phone",
    }

    for api_key, model_key in contact_fields.items():
        if api_key in data:
            setattr(item, model_key, str(data[api_key]).strip())

    # Update required skills.
    if "skills" in data:
        if not isinstance(data["skills"], list):
            return error("skills must be a list.")

        item.skills = [
            str(skill).strip()
            for skill in data["skills"]
            if str(skill).strip()
        ]

    db.session.commit()

    return jsonify({"opportunity": item.to_dict()}), 200


@api.delete("/opportunities/<int:oid>")
@jwt_required()
def delete_opportunity(oid):
    user, item = current_user(), db.session.get(Opportunity, oid)
    if not item:
        return error("Opportunity not found.", 404)
    if user.role != "admin" and item.owner_id != user.id:
        return error("You cannot delete this opportunity.", 403)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Opportunity deleted."})

@api.post("/opportunities/<int:oid>/apply")
@role_required("student")
def apply(oid):
    user, item = current_user(), db.session.get(Opportunity, oid)
    if not item or item.status != "published":
        return error("Opportunity not found.", 404)
    if Application.query.filter_by(opportunity_id=item.id, student_id=user.id).first():
        return error("You have already applied to this opportunity.", 409)
    application = Application(opportunity_id=item.id, student_id=user.id,
                              message=str(body().get("message", "")).strip())
    db.session.add(application)
    db.session.flush()
    db.session.add(Notification(user_id=item.owner_id, message=f"New application for {item.title}."))
    db.session.commit()
    return jsonify({"application": application.to_dict()}), 201

@api.get("/applications/me")
@role_required("student")
def my_applications():
    rows = Application.query.filter_by(student_id=current_user().id).order_by(Application.created_at.desc()).all()
    return jsonify({"applications": [a.to_dict() for a in rows]})

@api.get("/opportunities/<int:oid>/applications")
@role_required("faculty", "club", "admin")
def opportunity_applications(oid):
    user, item = current_user(), db.session.get(Opportunity, oid)
    if not item:
        return error("Opportunity not found.", 404)
    if user.role != "admin" and item.owner_id != user.id:
        return error("You cannot view these applicants.", 403)
    rows = Application.query.filter_by(opportunity_id=oid).order_by(Application.created_at.desc()).all()
    return jsonify({"applications": [a.to_dict(include_student=True) for a in rows]})

@api.patch("/applications/<int:aid>")
@role_required("faculty", "club", "admin")
def update_application(aid):
    user, item = current_user(), db.session.get(Application, aid)
    if not item:
        return error("Application not found.", 404)
    if user.role != "admin" and item.opportunity.owner_id != user.id:
        return error("You cannot update this application.", 403)
    status = str(body().get("status", "")).strip()
    if status not in APPLICATION_STATUSES:
        return error("Invalid application status.")
    item.status = status
    db.session.add(Notification(user_id=item.student_id,
        message=f"Your application for {item.opportunity.title} is now {status}."))
    db.session.commit()
    return jsonify({"application": item.to_dict()})

@api.get("/notifications")
@jwt_required()
def notifications():
    rows = Notification.query.filter_by(user_id=current_user().id).order_by(Notification.created_at.desc()).all()
    return jsonify({"notifications": [n.to_dict() for n in rows]})

@api.patch("/notifications/<int:nid>/read")
@jwt_required()
def mark_notification_read(nid):
    user, item = current_user(), db.session.get(Notification, nid)
    if not item or item.user_id != user.id:
        return error("Notification not found.", 404)
    item.read = True
    db.session.commit()
    return jsonify({"notification": item.to_dict()})


@api.get("/admin/summary")
@role_required("admin")
def admin_summary():
    return jsonify({
        "users": User.query.count(),
        "opportunities": Opportunity.query.count(),
        "applications": Application.query.count(),
        "pendingReviews": 0
    })


@api.get("/admin/users")
@role_required("admin")
def admin_users():
    return jsonify({
        "users": [
            u.to_dict()
            for u in User.query.order_by(User.created_at.desc()).all()
        ]
    })


@api.get("/admin/opportunities")
@role_required("admin")
def admin_opportunities():
    return jsonify({
        "opportunities": [
            o.to_dict()
            for o in Opportunity.query.order_by(Opportunity.created_at.desc()).all()
        ]
    })


@api.get("/admin/reports")
@role_required("admin")
def admin_reports():
    users = User.query.all()
    opportunities = Opportunity.query.all()

    applications = Application.query.order_by(
        Application.created_at.desc()
    ).all()

    user_roles = {}
    for user in users:
        role = user.role or "Unknown"
        user_roles[role] = user_roles.get(role, 0) + 1

    opportunity_statuses = {}
    for opportunity in opportunities:
        status = opportunity.status or "Unknown"
        opportunity_statuses[status] = (
            opportunity_statuses.get(status, 0) + 1
        )

    application_statuses = {}
    for application in applications:
        status = application.status or "Unknown"
        application_statuses[status] = (
            application_statuses.get(status, 0) + 1
        )

    return jsonify({
        "totalUsers": len(users),
        "totalOpportunities": len(opportunities),
        "totalApplications": len(applications),
        "userRoles": user_roles,
        "opportunityStatuses": opportunity_statuses,
        "applicationStatuses": application_statuses,
        "recentApplications": [
            application.to_dict(include_student=True)
            for application in applications[:10]
        ]
    })


@api.delete("/admin/users/<int:uid>")
@role_required("admin")
def delete_admin_user(uid):
    admin = current_user()
    user = db.session.get(User, uid)

    if not user:
        return error("User not found.", 404)

    # Prevent deleting the currently logged-in admin.
    if user.id == admin.id:
        return error("You cannot delete your own admin account.", 403)

    # Protect other admin accounts as well.
    if user.role == "admin":
        return error("Admin accounts cannot be deleted here.", 403)

    # Find opportunities created by this user.
    opportunity_ids = [
        opportunity.id
        for opportunity in Opportunity.query.filter_by(owner_id=uid).all()
    ]

    # Remove applications connected to those opportunities.
    if opportunity_ids:
        Application.query.filter(
            Application.opportunity_id.in_(opportunity_ids)
        ).delete(synchronize_session=False)

    # Remove applications submitted by this user.
    Application.query.filter_by(
        student_id=uid
    ).delete(synchronize_session=False)

    # Remove the user's notifications.
    Notification.query.filter_by(
        user_id=uid
    ).delete(synchronize_session=False)

    # Remove opportunities created by this user.
    Opportunity.query.filter_by(
        owner_id=uid
    ).delete(synchronize_session=False)

    # Finally, delete the user.
    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User and related records deleted successfully."})
