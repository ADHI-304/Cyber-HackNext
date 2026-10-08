"""
AuthBuddy SQLite Database Storage Engine
Provides persistent disk storage for users, OTP verification codes, rate limits, recovery sessions, and telemetry logs.
"""

import sqlite3
import json
import time
import os
from datetime import datetime
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "authbuddy.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        name TEXT,
        email_verified INTEGER DEFAULT 0,
        phone_number TEXT,
        phone_verified INTEGER DEFAULT 0,
        accessibility_profile TEXT DEFAULT '{}',
        trusted_contacts_json TEXT DEFAULT '[]'
    )
    """)

    cursor.execute("PRAGMA table_info(users)")
    cols = [r['name'] for r in cursor.fetchall()]
    if 'trusted_contacts_json' not in cols:
        cursor.execute("ALTER TABLE users ADD COLUMN trusted_contacts_json TEXT DEFAULT '[]'")
    if 'phone_number' not in cols:
        cursor.execute("ALTER TABLE users ADD COLUMN phone_number TEXT")
    if 'phone_verified' not in cols:
        cursor.execute("ALTER TABLE users ADD COLUMN phone_verified INTEGER DEFAULT 0")

    # 2. Email OTPs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS email_otps (
        otp_key TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        purpose TEXT NOT NULL,
        otp_hash TEXT NOT NULL,
        expires_at REAL NOT NULL,
        created_at REAL NOT NULL,
        attempts INTEGER DEFAULT 0,
        used INTEGER DEFAULT 0
    )
    """)

    # 3. Active 2FA OTPs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS active_otps (
        username TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        expires_at REAL NOT NULL
    )
    """)

    # 4. Failed Attempts & Rate Limits Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS failed_attempts (
        username TEXT PRIMARY KEY,
        attempts INTEGER DEFAULT 0,
        last_attempt_timestamp REAL DEFAULT 0
    )
    """)

    # 5. Recovery Sessions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recovery_sessions (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        contacts_json TEXT NOT NULL,
        approvals INTEGER DEFAULT 0,
        required_approvals INTEGER DEFAULT 2,
        delay_seconds INTEGER DEFAULT 60,
        completed INTEGER DEFAULT 0,
        created_at REAL NOT NULL
    )
    """)

    # 6. Telemetry Events Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS telemetry_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        step TEXT DEFAULT 'General',
        timestamp TEXT NOT NULL,
        metadata_json TEXT DEFAULT '{}'
    )
    """)

    conn.commit()
    conn.close()

def db_clear_all_tables():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users")
    cursor.execute("DELETE FROM email_otps")
    cursor.execute("DELETE FROM active_otps")
    cursor.execute("DELETE FROM failed_attempts")
    cursor.execute("DELETE FROM recovery_sessions")
    cursor.execute("DELETE FROM telemetry_events")
    conn.commit()
    conn.close()

# Initialize DB tables immediately on module load
init_db()

# --- DATABASE CRUD OPERATIONS ---

# 1. USER OPERATIONS
def db_get_user(username: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(username) = LOWER(?)", (username.strip(),))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    
    keys = row.keys()
    trusted_contacts = json.loads(row['trusted_contacts_json'] or '[]') if 'trusted_contacts_json' in keys else []
    phone_number = row['phone_number'] if 'phone_number' in keys else None
    phone_verified = bool(row['phone_verified']) if 'phone_verified' in keys else False

    return {
        'username': row['username'],
        'password': row['password'],
        'name': row['name'] or row['username'].split('@')[0],
        'emailVerified': bool(row['email_verified']),
        'phoneNumber': phone_number,
        'phoneVerified': phone_verified,
        'accessibilityProfile': json.loads(row['accessibility_profile'] or '{}'),
        'trustedContacts': trusted_contacts
    }

def db_save_user(username: str, data: Dict[str, Any]):
    conn = get_db()
    cursor = conn.cursor()
    user_key = username.strip()
    password = data.get('password', 'Password123!')
    name = data.get('name', user_key.split('@')[0])
    email_verified = 1 if data.get('emailVerified', False) else 0
    phone_number = data.get('phoneNumber', None)
    phone_verified = 1 if data.get('phoneVerified', False) else 0
    acc_profile = json.dumps(data.get('accessibilityProfile', {}))
    trusted_contacts = json.dumps(data.get('trustedContacts', []))

    cursor.execute("""
    INSERT INTO users (username, password, name, email_verified, phone_number, phone_verified, accessibility_profile, trusted_contacts_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(username) DO UPDATE SET
        password = excluded.password,
        name = excluded.name,
        email_verified = excluded.email_verified,
        phone_number = excluded.phone_number,
        phone_verified = excluded.phone_verified,
        accessibility_profile = excluded.accessibility_profile,
        trusted_contacts_json = excluded.trusted_contacts_json
    """, (user_key, password, name, email_verified, phone_number, phone_verified, acc_profile, trusted_contacts))
    conn.commit()
    conn.close()

def db_get_all_users() -> Dict[str, Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    conn.close()
    result = {}
    for r in rows:
        keys = r.keys()
        trusted = json.loads(r['trusted_contacts_json'] or '[]') if 'trusted_contacts_json' in keys else []
        phone_number = r['phone_number'] if 'phone_number' in keys else None
        phone_verified = bool(r['phone_verified']) if 'phone_verified' in keys else False
        result[r['username']] = {
            'username': r['username'],
            'password': r['password'],
            'name': r['name'] or r['username'].split('@')[0],
            'emailVerified': bool(r['email_verified']),
            'phoneNumber': phone_number,
            'phoneVerified': phone_verified,
            'accessibilityProfile': json.loads(r['accessibility_profile'] or '{}'),
            'trustedContacts': trusted
        }
    return result

# 2. EMAIL OTP OPERATIONS
def db_get_email_otp(otp_key: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM email_otps WHERE otp_key = ?", (otp_key,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        'otp_hash': row['otp_hash'],
        'email': row['email'],
        'purpose': row['purpose'],
        'expires_at': row['expires_at'],
        'created_at': row['created_at'],
        'attempts': row['attempts'],
        'used': bool(row['used'])
    }

def db_save_email_otp(otp_key: str, record: Dict[str, Any]):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO email_otps (otp_key, email, purpose, otp_hash, expires_at, created_at, attempts, used)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(otp_key) DO UPDATE SET
        email = excluded.email,
        purpose = excluded.purpose,
        otp_hash = excluded.otp_hash,
        expires_at = excluded.expires_at,
        created_at = excluded.created_at,
        attempts = excluded.attempts,
        used = excluded.used
    """, (
        otp_key,
        record.get('email', ''),
        record.get('purpose', 'EMAIL_VERIFICATION'),
        record.get('otp_hash', ''),
        record.get('expires_at', 0.0),
        record.get('created_at', time.time()),
        record.get('attempts', 0),
        1 if record.get('used', False) else 0
    ))
    conn.commit()
    conn.close()

def db_delete_email_otp(otp_key: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM email_otps WHERE otp_key = ?", (otp_key,))
    conn.commit()
    conn.close()

# 3. ACTIVE 2FA OTP OPERATIONS
def db_get_active_otp(username: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM active_otps WHERE LOWER(username) = LOWER(?)", (username.strip(),))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        'code': row['code'],
        'expiresAt': row['expires_at']
    }

def db_save_active_otp(username: str, code: str, expires_at: float):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO active_otps (username, code, expires_at)
    VALUES (?, ?, ?)
    ON CONFLICT(username) DO UPDATE SET
        code = excluded.code,
        expires_at = excluded.expires_at
    """, (username.strip(), code, expires_at))
    conn.commit()
    conn.close()

def db_delete_active_otp(username: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM active_otps WHERE LOWER(username) = LOWER(?)", (username.strip(),))
    conn.commit()
    conn.close()

# 4. FAILED ATTEMPTS & RATE LIMITS
def db_get_failed_attempts(username: str) -> int:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT attempts FROM failed_attempts WHERE LOWER(username) = LOWER(?)", (username.strip(),))
    row = cursor.fetchone()
    conn.close()
    return row['attempts'] if row else 0

def db_set_failed_attempts(username: str, count: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO failed_attempts (username, attempts, last_attempt_timestamp)
    VALUES (?, ?, ?)
    ON CONFLICT(username) DO UPDATE SET attempts = excluded.attempts
    """, (username.strip(), count, time.time()))
    conn.commit()
    conn.close()

def db_delete_failed_attempts(username: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM failed_attempts WHERE LOWER(username) = LOWER(?)", (username.strip(),))
    conn.commit()
    conn.close()

def db_get_last_attempt(username: str) -> float:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT last_attempt_timestamp FROM failed_attempts WHERE LOWER(username) = LOWER(?)", (username.strip(),))
    row = cursor.fetchone()
    conn.close()
    return row['last_attempt_timestamp'] if row else 0.0

def db_set_last_attempt(username: str, ts: float):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO failed_attempts (username, attempts, last_attempt_timestamp)
    VALUES (?, 0, ?)
    ON CONFLICT(username) DO UPDATE SET last_attempt_timestamp = excluded.last_attempt_timestamp
    """, (username.strip(), ts))
    conn.commit()
    conn.close()

# 5. RECOVERY SESSIONS
def db_get_recovery_session(session_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM recovery_sessions WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        'id': row['id'],
        'username': row['username'],
        'contacts': json.loads(row['contacts_json']),
        'approvals': row['approvals'],
        'requiredApprovals': row['required_approvals'],
        'delaySeconds': row['delay_seconds'],
        'completed': bool(row['completed']),
        'createdAt': row['created_at']
    }

def db_save_recovery_session(session_id: str, session_data: Dict[str, Any]):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO recovery_sessions (id, username, contacts_json, approvals, required_approvals, delay_seconds, completed, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        username = excluded.username,
        contacts_json = excluded.contacts_json,
        approvals = excluded.approvals,
        required_approvals = excluded.required_approvals,
        delay_seconds = excluded.delay_seconds,
        completed = excluded.completed
    """, (
        session_id,
        session_data.get('username', 'user@securebank.com'),
        json.dumps(session_data.get('contacts', [])),
        session_data.get('approvals', 0),
        session_data.get('requiredApprovals', 2),
        session_data.get('delaySeconds', 60),
        1 if session_data.get('completed', False) else 0,
        session_data.get('createdAt', time.time())
    ))
    conn.commit()
    conn.close()

# 6. TELEMETRY LOGS
def db_log_telemetry(event_type: str, step: str = 'General', metadata: Dict[str, Any] = None) -> Dict[str, Any]:
    if metadata is None:
        metadata = {}
    conn = get_db()
    cursor = conn.cursor()
    ts = datetime.now().isoformat()
    meta_json = json.dumps(metadata)
    cursor.execute(
        "INSERT INTO telemetry_events (event_type, step, timestamp, metadata_json) VALUES (?, ?, ?, ?)",
        (event_type, step, ts, meta_json)
    )
    event_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        'id': event_id,
        'type': event_type,
        'step': step,
        'timestamp': ts,
        'metadata': metadata
    }

def db_get_telemetry_events(limit: int = 100) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM telemetry_events ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        result.append({
            'id': r['id'],
            'type': r['event_type'],
            'step': r['step'],
            'timestamp': r['timestamp'],
            'metadata': json.loads(r['metadata_json'] or '{}')
        })
    return result
