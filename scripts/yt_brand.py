#!/usr/bin/env python3
"""Update CoreLifecycle channel branding (title, description, keywords) via the API."""
import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN = os.path.join(ROOT, "secrets", "token.json")
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"]

TITLE = "CoreLifecycle"
DESCRIPTION = (
    "Cinematic breakdowns of every level of power, money, and ambition.\n\n"
    "From the first rung to the people who quietly shape the system — the architecture "
    "beneath success, told one level at a time.\n\n"
    "New stories regularly. Subscribe to climb."
)
KEYWORDS = "\"every level\" finance power ambition careers money success business cinematic wealth hierarchy"

yt = build("youtube", "v3", credentials=Credentials.from_authorized_user_file(TOKEN, SCOPES))
ch = yt.channels().list(part="brandingSettings,snippet", mine=True).execute()["items"][0]
bs = ch.get("brandingSettings", {})
bs.setdefault("channel", {})
bs["channel"]["title"] = TITLE
bs["channel"]["description"] = DESCRIPTION
bs["channel"]["keywords"] = KEYWORDS

resp = yt.channels().update(part="brandingSettings", body={"id": ch["id"], "brandingSettings": bs}).execute()
print("Updated title       :", resp["brandingSettings"]["channel"].get("title"))
print("Updated description :", resp["brandingSettings"]["channel"].get("description", "")[:60], "...")
print("Updated keywords    :", resp["brandingSettings"]["channel"].get("keywords"))
