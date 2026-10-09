#!/usr/bin/env python3
"""
FindIt — Smart Lost & Found Network
Production-grade Local Server utilizing Python Standard Library
Zero external dependencies required.
"""

import http.server
import socketserver
import os
import sys
import json
import mimetypes
import webbrowser
from urllib.parse import urlparse

# Ensure Windows terminal doesn't crash on Unicode characters
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Ensure proper mime types
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("text/html", ".html")
mimetypes.add_type("application/json", ".json")

class FindItRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and caching headers for silky smooth local dev
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            response = {
                "status": "online",
                "app": "FindIt - Smart Lost & Found Network",
                "version": "1.0.0",
                "engine": "Multi-Factor Scoring & Verification Vault"
            }
            self.wfile.write(json.dumps(response).encode("utf-8"))
            return

        # Default static file serving
        return super().do_GET()

def start_server():
    global PORT
    for attempt_port in range(PORT, PORT + 10):
        try:
            handler = FindItRequestHandler
            with socketserver.TCPServer(("", attempt_port), handler) as httpd:
                PORT = attempt_port
                url = f"http://localhost:{PORT}"
                print("=" * 65)
                print("[FindIt] Smart Lost & Found Network Server")
                print("=" * 65)
                print(f"-> Running locally at: {url}")
                print(f"-> Serving directory:  {DIRECTORY}")
                print("Features Active:")
                print("  [1] Multi-Factor Smart Matching (Category, Color, Location, Keywords)")
                print("  [2] Hidden Details Ownership Verification Vault")
                print("  [3] Live Claims Tracker & Safe-Zone Locker Timelines")
                print("  [4] Campus Karma Points & Rewards Store")
                print("  [5] 60fps GPU Ambient Particle Visuals & Synthesized Audio FX")
                print("=" * 65)
                print("Open the link above in your browser. Press Ctrl+C to stop.")
                
                # Auto open browser
                try:
                    webbrowser.open(url)
                except Exception:
                    pass

                httpd.serve_forever()
                break
        except OSError as e:
            if "Address already in use" in str(e) or getattr(e, 'errno', 0) == 10048:
                continue
            else:
                raise e

if __name__ == "__main__":
    start_server()
