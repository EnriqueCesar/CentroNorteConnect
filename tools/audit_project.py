#!/usr/bin/env python3
"""Auditoría estática reproducible para CentroNorteConnect (sin dependencias)."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

HTML_FILES = ("index.html", "regional-review.html", "competidores_cn.html", "Plan_Accion_Centro_Norte.html", "offline.html")


class RefParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.refs: list[tuple[str, str]] = []
        self.external_blank_without_rel: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        for key in ("href", "src"):
            if values.get(key):
                self.refs.append((key, values[key] or ""))
        href = values.get("href", "") or ""
        rel = set((values.get("rel", "") or "").split())
        if href.startswith(("http://", "https://")) and values.get("target") == "_blank" and not {"noopener", "noreferrer"}.issubset(rel):
            self.external_blank_without_rel.append(href)


def local_target(root: Path, page: Path, ref: str) -> Path | None:
    if not ref or ref.startswith(("#", "data:", "mailto:", "tel:", "javascript:")):
        return None
    parsed = urlsplit(ref)
    if parsed.scheme or parsed.netloc:
        return None
    clean = parsed.path
    if not clean:
        return None
    return (root / clean.lstrip("/")) if clean.startswith("/") else (page.parent / clean)


def audit(root: Path) -> dict:
    broken, insecure, references = [], [], defaultdict(list)
    source_text = ""
    for name in HTML_FILES:
        page = root / name
        if not page.exists():
            broken.append({"page": name, "reference": "archivo requerido ausente"})
            continue
        page_text = page.read_text(encoding="utf-8")
        source_text += "\n" + page_text
        parser = RefParser()
        parser.feed(page_text)
        insecure.extend({"page": name, "url": url} for url in parser.external_blank_without_rel)
        for _, ref in parser.refs:
            target = local_target(root, page, ref)
            if target:
                references[str(target.resolve())].append(name)
                if not target.exists():
                    broken.append({"page": name, "reference": ref})

    files = [p for p in root.rglob("*") if p.is_file() and ".git" not in p.parts]
    digests = defaultdict(list)
    for path in files:
        digests[hashlib.sha256(path.read_bytes()).hexdigest()].append(path.relative_to(root).as_posix())
    duplicates = [paths for paths in digests.values() if len(paths) > 1]
    assets = [p for p in files if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".svg", ".webp"}]
    unused_assets = [p.relative_to(root).as_posix() for p in assets if str(p.resolve()) not in references and p.relative_to(root).as_posix() not in source_text]

    manifest_error = None
    try:
        manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
        for field in ("name", "short_name", "start_url", "scope", "display", "icons"):
            if field not in manifest:
                raise ValueError(f"falta el campo {field}")
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        manifest_error = str(exc)

    scripts = "\n".join((root / name).read_text(encoding="utf-8") for name in HTML_FILES if (root / name).exists())
    duplicate_function_names = sorted(name for name, count in __import__("collections").Counter(re.findall(r"function\s+([A-Za-z_$][\w$]*)\s*\(", scripts)).items() if count > 1)
    return {
        "html_files_checked": len(HTML_FILES),
        "files_checked": len(files),
        "broken_local_references": broken,
        "external_blank_without_safe_rel": insecure,
        "duplicate_file_groups": duplicates,
        "duplicate_function_names": duplicate_function_names,
        "unreferenced_image_candidates": unused_assets,
        "manifest_error": manifest_error,
        "status": "ok" if not broken and not insecure and not manifest_error else "review"
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", nargs="?", default=".")
    parser.add_argument("--output", default="audit-results.json")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    result = audit(root)
    (root / args.output).write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
