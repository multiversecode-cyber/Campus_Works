
from sqlalchemy import inspect, text
from app import create_app, db

app = create_app()

with app.app_context():
    columns = {
        column["name"]
        for column in inspect(db.engine).get_columns("opportunity")
    }

    additions = {
        "contact_name": "VARCHAR(120) NOT NULL DEFAULT ''",
        "contact_email": "VARCHAR(255) NOT NULL DEFAULT ''",
        "contact_phone": "VARCHAR(40) NOT NULL DEFAULT ''",
    }

    with db.engine.begin() as connection:
        for name, definition in additions.items():
            if name not in columns:
                connection.execute(
                    text(
                        f"ALTER TABLE opportunity ADD COLUMN {name} {definition}"
                    )
                )
                print(f"Added column: {name}")
            else:
                print(f"Column already exists: {name}")

    print("Contact fields migration complete.")
