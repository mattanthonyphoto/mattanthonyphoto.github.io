#!/usr/bin/env python3
"""Validate that static internal routes referenced by HTML and JS exist."""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
SITE_HOSTS = {
    "mattanthonyphoto.com",
    "www.mattanthonyphoto.com",
    "mattanthonyphoto.github.io",
}
ATTRS_TO_CHECK = {"href", "src", "action", "poster"}
SKIP_SCHEMES = {"", "http", "https"}
QUOTED_ROUTE_RE = re.compile(r"""(?P<quote>['"])(?P<path>/[A-Za-z0-9_./?#=&%+-]*)(?P=quote)""")
SAME_DOMAIN_RE = re.compile(
    r"""https?://(?:www\.)?(?:mattanthonyphoto\.com|mattanthonyphoto\.github\.io)(?P<path>/[A-Za-z0-9_./?#=&%+-]*)"""
)


class LinkParser(HTMLParser):
    def __init__(self, source: Path) -> None:
        super().__init__(convert_charrefs=True)
        self.source = source
        self.links: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        del tag
        for name, value in attrs:
            if name in ATTRS_TO_CHECK and value:
                self.links.append((name, value))


def iter_source_files() -> list[Path]:
    return sorted(ROOT.glob("**/*.html")) + sorted((ROOT / "js").glob("**/*.js"))


def normalize_route(value: str) -> str | None:
    parsed = urlparse(value)
    if parsed.scheme and parsed.scheme not in SKIP_SCHEMES:
        return None
    if parsed.netloc and parsed.netloc not in SITE_HOSTS:
        return None

    path = parsed.path
    if not path or path == "/":
        return "/"
    if not path.startswith("/"):
        return None
    if path.startswith("//"):
        return None
    if path != "/" and path.endswith("/"):
        path = path.rstrip("/")
    return path


def route_exists(route: str) -> bool:
    if route == "/":
        return (ROOT / "index.html").is_file()

    relative = route.lstrip("/")
    target = ROOT / relative
    if target.is_file():
        return True
    if (ROOT / f"{relative}.html").is_file():
        return True
    if (target / "index.html").is_file():
        return True
    return False


def collect_routes_from_file(path: Path) -> list[tuple[str, str]]:
    text = path.read_text(encoding="utf-8")
    routes: list[tuple[str, str]] = []

    if path.suffix == ".html":
        parser = LinkParser(path)
        parser.feed(text)
        routes.extend(parser.links)

    for match in QUOTED_ROUTE_RE.finditer(text):
        routes.append(("quoted", match.group("path")))
    for match in SAME_DOMAIN_RE.finditer(text):
        routes.append(("same-domain", match.group("path")))

    return routes


def main() -> int:
    failures: list[str] = []
    seen: set[tuple[Path, str, str]] = set()

    for source in iter_source_files():
        for context, raw in collect_routes_from_file(source):
            route = normalize_route(raw)
            if route is None:
                continue
            key = (source, context, route)
            if key in seen:
                continue
            seen.add(key)
            if not route_exists(route):
                rel_source = source.relative_to(ROOT)
                failures.append(f"{rel_source}: {context} references missing route {route}")

    if failures:
        print("Missing internal routes found:")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print(f"Validated internal routes in {len(iter_source_files())} HTML/JS files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
