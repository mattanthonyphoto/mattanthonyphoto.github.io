#!/usr/bin/env python3
"""Validate same-site static routes referenced by HTML and JavaScript files."""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
LOCAL_HOSTS = {
    "mattanthonyphoto.com",
    "www.mattanthonyphoto.com",
    "mattanthonyphoto.github.io",
}
HTML_ATTRS = {"href", "src", "action", "content", "data-url"}
ROUTE_STRING_RE = re.compile(
    r"""['"]((?:https?://(?:www\.)?mattanthonyphoto\.com|"""
    r"""https?://mattanthonyphoto\.github\.io)?/[-A-Za-z0-9_/]+)['"]"""
)


class RouteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.refs: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if value and name in HTML_ATTRS:
                self.refs.append((name, value))


def route_for_html(path: Path) -> str:
    rel = path.relative_to(ROOT)
    if rel.name == "index.html":
        parent = rel.parent.as_posix()
        return "/" if parent == "." else f"/{parent}".rstrip("/")
    return f"/{rel.with_suffix('').as_posix()}".rstrip("/")


def route_from_reference(raw: str) -> str | None:
    value = raw.strip()
    if not value or value.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return None
    if value.startswith("//"):
        return None

    if value.startswith(("http://", "https://")):
        parsed = urlparse(value)
        if parsed.netloc not in LOCAL_HOSTS:
            return None
        path = parsed.path or "/"
    elif value.startswith("/"):
        path = value
    else:
        return None

    if "." in Path(path).name:
        return None
    return path.rstrip("/") or "/"


def iter_source_files(pattern: str) -> list[Path]:
    return [path for path in ROOT.rglob(pattern) if ".git" not in path.parts]


def main() -> int:
    html_files = iter_source_files("*.html")
    routes = {route_for_html(path) for path in html_files}
    references: list[tuple[Path, str, str, str]] = []

    for path in html_files:
        text = path.read_text(errors="ignore")
        parser = RouteParser()
        parser.feed(text)
        for attr, raw in parser.refs:
            route = route_from_reference(raw)
            if route:
                references.append((path, attr, raw, route))
        for match in ROUTE_STRING_RE.finditer(text):
            raw = match.group(1)
            route = route_from_reference(raw)
            if route:
                references.append((path, "quoted", raw, route))

    for path in iter_source_files("*.js"):
        text = path.read_text(errors="ignore")
        for match in ROUTE_STRING_RE.finditer(text):
            raw = match.group(1)
            route = route_from_reference(raw)
            if route:
                references.append((path, "quoted", raw, route))

    missing: dict[str, list[tuple[Path, str, str]]] = {}
    for path, attr, raw, route in references:
        if route not in routes:
            missing.setdefault(route, []).append((path, attr, raw))

    if missing:
        for route, items in sorted(missing.items()):
            print(f"{route} ({len(items)} references)")
            for path, attr, raw in items[:5]:
                rel = path.relative_to(ROOT)
                print(f"  {rel}: {attr}={raw}")
            if len(items) > 5:
                print("  ...")
        return 1

    print(f"Validated {len(html_files)} HTML files and {len(routes)} routes.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
