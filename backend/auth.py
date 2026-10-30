"""
Authentication and User Management Module for TruthLens.
Provides secure password hashing (PBKDF2-HMAC-SHA256), SQLite storage,
and session management with zero external dependencies.
"""

import os
import sqlite3
import hashlib
import secrets
from datetime import datetime
from typing import Optional, Tuple, Dict, Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "users.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def hash_password(password: str, salt: Optional[str] = None) -> str:
    """Hashes a password with salt using PBKDF2-HMAC-SHA256."""
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations=100000
    ).hex()
    return f"{salt}${hashed}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verifies a plain password against a stored salt$hash string."""
    try:
        salt, _ = stored_hash.split("$", 1)
        return hash_password(password, salt) == stored_hash
    except Exception:
        return False


def init_auth_db():
    """Initializes users and sessions tables in SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)
    conn.commit()

    # Pre-seed default demo account if not exists
    cursor.execute("SELECT id FROM users WHERE email = 'prashant@truthlens.ai'")
    if not cursor.fetchone():
        demo_pass_hash = hash_password("password123")
        cursor.execute(
            "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            ("Prashant Gupta", "prashant@truthlens.ai", demo_pass_hash, datetime.utcnow().isoformat())
        )
        conn.commit()

    conn.close()


def register_user(name: str, email: str, password: str) -> Tuple[bool, Any]:
    """Registers a new user and creates an active session token."""
    name = name.strip()
    email = email.strip().lower()
    if not name or len(name) < 2:
        return False, "Full name must be at least 2 characters long."
    if "@" not in email or "." not in email:
        return False, "Please enter a valid email address."
    if len(password) < 6:
        return False, "Password must be at least 6 characters long."

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if email is already registered
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return False, "An account with this email already exists. Please sign in."

    pwd_hash = hash_password(password)
    now_str = datetime.utcnow().isoformat()
    try:
        cursor.execute(
            "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (name, email, pwd_hash, now_str)
        )
        user_id = cursor.lastrowid

        # Generate session token
        token = secrets.token_hex(24)
        cursor.execute(
            "INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)",
            (token, user_id, now_str)
        )
        conn.commit()

        user_info = {
            "id": user_id,
            "name": name,
            "email": email,
            "token": token
        }
        conn.close()
        return True, user_info
    except Exception as e:
        conn.close()
        return False, f"Registration failed: {str(e)}"


def login_user(email: str, password: str) -> Tuple[bool, Any]:
    """Authenticates a user by email and password, returning session info and token."""
    email = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, email, password_hash FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False, "Invalid email or password."

    if not verify_password(password, row["password_hash"]):
        conn.close()
        return False, "Invalid email or password."

    user_id = row["id"]
    name = row["name"]

    # Create new session token
    token = secrets.token_hex(24)
    now_str = datetime.utcnow().isoformat()
    cursor.execute(
        "INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)",
        (token, user_id, now_str)
    )
    conn.commit()
    conn.close()

    return True, {
        "id": user_id,
        "name": name,
        "email": email,
        "token": token
    }


def get_user_by_token(token: str) -> Optional[Dict[str, Any]]:
    """Retrieves user profile associated with a session token."""
    if not token:
        return None
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.id, u.name, u.email, u.created_at
        FROM users u
        JOIN sessions s ON u.id = s.user_id
        WHERE s.token = ?
    """, (token,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "id": row["id"],
            "name": row["name"],
            "email": row["email"],
            "created_at": row["created_at"]
        }
    return None


def logout_user(token: str) -> bool:
    """Removes the session token from active sessions."""
    if not token:
        return True
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()
    return True


# Initialize database upon import
init_auth_db()
