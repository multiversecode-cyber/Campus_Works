from getpass import getpass
from app import create_app, db
from app.models import User

app = create_app()

email = "admin@campusworks.com"
name = input("Enter admin display name: ").strip()
password = getpass("Enter admin password: ")
confirm = getpass("Confirm admin password: ")

if not name:
    raise SystemExit("Name cannot be empty.")

if len(password) < 12:
    raise SystemExit("Use a password of at least 12 characters.")

if password != confirm:
    raise SystemExit("Passwords do not match.")

with app.app_context():
    user = User.query.filter_by(email=email).first()

    if user:
        user.name = name
        user.role = "admin"
        user.set_password(password)
        print("Existing account promoted to admin.")
    else:
        user = User(name=name, email=email, role="admin")
        user.set_password(password)
        db.session.add(user)
        print("New admin account created.")

    db.session.commit()
    print("Admin account ready:", email)
