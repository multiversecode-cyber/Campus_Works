
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from . import db


def utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="student")
    course = db.Column(db.String(120), default="")
    year = db.Column(db.String(40), default="")
    skills = db.Column(db.JSON, nullable=False, default=list)
    bio = db.Column(db.Text, default="")
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=utcnow,
        nullable=False
    )

    opportunities = db.relationship(
        "Opportunity",
        back_populates="owner",
        lazy=True
    )

    applications = db.relationship(
        "Application",
        back_populates="student",
        lazy=True
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "course": self.course,
            "year": self.year,
            "skills": self.skills or [],
            "bio": self.bio or ""
        }


class Opportunity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(180), nullable=False)
    organization = db.Column(db.String(180), nullable=False)
    type = db.Column(db.String(60), nullable=False)
    location = db.Column(db.String(120), nullable=False)
    deadline = db.Column(db.String(80), nullable=False)
    payment = db.Column(db.String(120), default="")
    skills = db.Column(db.JSON, nullable=False, default=list)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="published")

    # Recruiter contact details
    contact_name = db.Column(
        db.String(120),
        nullable=False,
        default=""
    )
    contact_email = db.Column(
        db.String(255),
        nullable=False,
        default=""
    )
    contact_phone = db.Column(
        db.String(40),
        nullable=False,
        default=""
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=utcnow,
        nullable=False
    )

    owner_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False
    )

    owner = db.relationship(
        "User",
        back_populates="opportunities"
    )

    applications = db.relationship(
        "Application",
        back_populates="opportunity",
        cascade="all, delete-orphan",
        lazy=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "organization": self.organization,
            "owner": self.owner.name if self.owner else "",
            "type": self.type,
            "location": self.location,
            "deadline": self.deadline,
            "payment": self.payment or "",
            "skills": self.skills or [],
            "description": self.description,
            "status": self.status,
            "posted": (
                self.created_at.isoformat()
                if self.created_at else ""
            ),
            "ownerId": self.owner_id,
            "contactName": self.contact_name or "",
            "contactEmail": self.contact_email or "",
            "contactPhone": self.contact_phone or ""
        }


class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    opportunity_id = db.Column(
        db.Integer,
        db.ForeignKey("opportunity.id"),
        nullable=False
    )

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="Applied"
    )

    message = db.Column(db.Text, default="")

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=utcnow,
        nullable=False
    )

    __table_args__ = (
        db.UniqueConstraint(
            "opportunity_id",
            "student_id",
            name="unique_student_application"
        ),
    )

    opportunity = db.relationship(
        "Opportunity",
        back_populates="applications"
    )

    student = db.relationship(
        "User",
        back_populates="applications"
    )

    def to_dict(self, include_student=False):
        result = {
            "id": self.id,
            "opportunityId": self.opportunity_id,
            "title": self.opportunity.title if self.opportunity else "",
            "organization": (
                self.opportunity.organization
                if self.opportunity else ""
            ),
            "date": (
                self.created_at.isoformat()
                if self.created_at else ""
            ),
            "status": self.status,
            "message": self.message or ""
        }

        if include_student:
            result["student"] = (
                self.student.to_dict() if self.student else None
            )

        return result


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False,
        index=True
    )

    message = db.Column(db.String(500), nullable=False)
    read = db.Column(db.Boolean, default=False, nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=utcnow,
        nullable=False
    )

    user = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "message": self.message,
            "read": self.read,
            "createdAt": (
                self.created_at.isoformat()
                if self.created_at else ""
            )
        }
