from app import create_app, db
from app.models import User, Opportunity

DEMO_OPPORTUNITIES = [
    {"title": "Frontend Developer Intern", "organization": "Tech Club", "type": "Internship",
     "location": "On Campus", "deadline": "Oct 20, 2026", "payment": "Certificate + Stipend",
     "skills": ["React", "JavaScript", "CSS"],
     "description": "DEMO DATA: Improve the club's student technology portal with a campus development team."},
    {"title": "Event Volunteer", "organization": "Cultural Committee", "type": "Volunteer",
     "location": "VIT Pune", "deadline": "Oct 15, 2026", "payment": "Certificate",
     "skills": ["Communication", "Teamwork", "Event Management"],
     "description": "DEMO DATA: Help coordinate a college cultural event and support event-day operations."},
    {"title": "Research Assistant", "organization": "Computer Engineering Department", "type": "Research",
     "location": "Department Lab", "deadline": "Oct 25, 2026", "payment": "Certificate + Project Credit",
     "skills": ["Python", "Research", "Machine Learning"],
     "description": "DEMO DATA: Assist faculty with data collection and basic machine-learning analysis."},
    {"title": "Graphic Designer", "organization": "Photography Club", "type": "Part-time",
     "location": "Hybrid", "deadline": "Oct 18, 2026", "payment": "Certificate",
     "skills": ["Figma", "Canva", "Photoshop"],
     "description": "DEMO DATA: Design posters, social media creatives and promotional material."},
    {"title": "Backend API Developer", "organization": "Coding Club", "type": "Project",
     "location": "Hybrid", "deadline": "Oct 30, 2026", "payment": "Certificate + Project Credit",
     "skills": ["Python", "Flask", "SQL"],
     "description": "DEMO DATA: Create simple REST APIs for an internal campus project."},
    {"title": "Social Media Coordinator", "organization": "Entrepreneurship Cell", "type": "Volunteer",
     "location": "On Campus", "deadline": "Nov 2, 2026", "payment": "Certificate",
     "skills": ["Content", "Social Media", "Communication"],
     "description": "DEMO DATA: Plan social media content for workshops, competitions and campus events."},
]

app = create_app()
with app.app_context():
    owner = User.query.filter_by(email="demo.faculty@campusworks.local").first()
    if not owner:
        owner = User(name="Demo Faculty", email="demo.faculty@campusworks.local", role="faculty")
        owner.set_password("DemoPassword123!")
        db.session.add(owner)
        db.session.flush()
    created = 0
    for row in DEMO_OPPORTUNITIES:
        if not Opportunity.query.filter_by(title=row["title"], organization=row["organization"]).first():
            db.session.add(Opportunity(**row, owner_id=owner.id))
            created += 1
    db.session.commit()
    print(f"Seed complete. Added {created} demo opportunities.")
    print("Demo faculty account: demo.faculty@campusworks.local / DemoPassword123!")
    print("Local development only: change credentials before any shared deployment.")
