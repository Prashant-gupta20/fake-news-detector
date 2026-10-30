"""
TruthLens AI - One-Click Application Runner.
Executes baseline setup check, ensures model is trained, and starts the FastAPI server.
"""

import os
import sys
import webbrowser
import threading
import time

# Add root directory to python path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.model_trainer import MODEL_PATH, VECTORIZER_PATH, train_model

import socket

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex((host, port)) == 0

def find_available_port(start_port: int = 8000) -> int:
    port = start_port
    while is_port_in_use(port) and port < 8100:
        port += 1
    return port

def open_browser(port: int):
    time.sleep(1.2)
    webbrowser.open(f"http://localhost:{port}")

def main():
    print("=" * 65)
    print("🚀  TruthLens AI - Fake News Detection Platform")
    print("=" * 65)

    # Verify model artifacts exist
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
        print("[SETUP] Pre-trained model artifacts not found. Starting training pipeline...")
        train_model()
    else:
        print("[OK] Model and Vectorizer artifacts verified.")

    port = find_available_port(8000)

    print("\n[STARTUP] Launching FastAPI Web Application...")
    print(f"📍 Frontend UI:       http://localhost:{port}")
    print(f"📑 Swagger OpenAPI:   http://localhost:{port}/docs")
    print("=" * 65)

    # Open web browser automatically in background thread
    threading.Thread(target=open_browser, args=(port,), daemon=True).start()

    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=port, reload=True)

if __name__ == "__main__":
    main()

