#!/usr/bin/env python3
"""
Whisper Model Manager
Handles model installation and provides status
"""

import sys
import json
from pathlib import Path
import shutil
import ssl

try:
    import whisper
except Exception as e:
    whisper = None


def get_model_path(model_name):
    cache_dir = Path.home() / ".cache" / "whisper"
    return cache_dir / f"{model_name}.pt"

MODELS = ["tiny", "base", "small", "medium", "large"]

def prune_other_models(keep_model: str):
    cache_dir = Path.home() / ".cache" / "whisper"
    if not cache_dir.exists():
        return
    for m in MODELS:
        if m == keep_model:
            continue
        p = cache_dir / f"{m}.pt"
        try:
            if p.exists():
                p.unlink()
        except Exception:
            pass


def is_model_installed(model_name):
    try:
        return get_model_path(model_name).exists()
    except Exception:
        return False


def install_model(model_name):
    if whisper is None:
        return {"status": "error", "error": "whisper not installed in Python env"}
    try:
        original_context = ssl._create_default_https_context
        ssl._create_default_https_context = ssl._create_unverified_context
        path_obj = get_model_path(model_name)
        if path_obj.exists():
            try:
                path_obj.unlink()
            except Exception:
                pass
        prune_other_models(model_name)

        model = whisper.load_model(model_name)
        path = str(get_model_path(model_name))
        size_bytes = get_model_path(model_name).stat().st_size if Path(path).exists() else 0
        return {"status": "installed", "progress": 100, "path": path, "size_bytes": size_bytes, "model": model_name}
    except Exception as e:
        return {"status": "error", "error": str(e)}
    finally:
        try:
            ssl._create_default_https_context = original_context
        except Exception:
            pass


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Model name required"}))
        sys.exit(1)
    model_name = sys.argv[1]
    action = sys.argv[2] if len(sys.argv) > 2 else "install"
    if action == "check":
        path = str(get_model_path(model_name))
        installed = is_model_installed(model_name)
        size_bytes = Path(path).stat().st_size if installed and Path(path).exists() else 0
        print(json.dumps({"installed": installed, "path": path, "size_bytes": size_bytes, "model": model_name}))
        return

    result = install_model(model_name)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
