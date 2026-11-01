
from app import create_app, db
from app.models import User, Opportunity, Application

DEMO_EMAIL = "demo.faculty@campusworks.local"

DEMO_TITLES = [
    "Frontend Developer Intern",
    "Event Volunteer",
    "Research Assistant",
    "Graphic Designer",
    "Backend API Developer",
    "Social Media Coordinator",
]

app = create_app()

with app.app_context():
    demo_user = User.query.filter_by(email=DEMO_EMAIL).first()

    demo_opportunities = Opportunity.query.filter(
        Opportunity.title.in_(DEMO_TITLES)
    ).all()

    opportunity_ids = [item.id for item in demo_opportunities]

    # Remove applications linked to the demo opportunities first.
    if opportunity_ids:
        Application.query.filter(
            Application.opportunity_id.in_(opportunity_ids)
        ).delete(synchronize_session=False)

    # Remove only the six named demo opportunities.
    for opportunity in demo_opportunities:
        db.session.delete(opportunity)

    # Remove the demo account only if it owns no remaining opportunities.
    if demo_user:
        remaining = Opportunity.query.filter_by(
            owner_id=demo_user.id
        ).count()

        if remaining == 0:
            db.session.delete(demo_user)

    db.session.commit()

    print(f"Removed {len(demo_opportunities)} demo opportunities.")
    print("Demo cleanup complete.")
