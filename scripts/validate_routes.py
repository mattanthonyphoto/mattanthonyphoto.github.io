#!/usr/bin/env python3
"""Validate internal routes for the static GitHub Pages site."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parents[1]
SAME_DOMAIN_HOSTS = {"mattanthonyphoto.com", "www.mattanthonyphoto.com"}
ATTRIBUTES_TO_CHECK = {"href", "src", "action", "poster"}
TEXT_EXTENSIONS = {".html", ".js"}


class RouteParser(HTMLParser):
    def __init__(self, path: Path) -> None:
        super().__init__()
        self.path = path
        self.refs: list[tuple[str, str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if name in ATTRIBUTES_TO_CHECK and value:
                self.refs.append((tag, name, value))


def site_files() -> set[str]:
    return {
        path.relative_to(ROOT).as_posix()
        for path in ROOT.rglob("*")
        if path.is_file() and ".git" not in path.parts
    }


def route_exists(url_path: str, files: set[str]) -> bool:
    path = unquote(url_path.split("#", 1)[0].split("?", 1)[0])
    if not path or path == "/":
        return True
    if path.startswith("/"):
        path = path[1:]
    path = path.rstrip("/")
    if not path:
        return True
    return path in files or f"{path}/index.html" in files


def checked_path(value: str) -> str | None:
    parsed = urlparse(value)
    if parsed.scheme in {"http", "https"}:
        if parsed.netloc in SAME_DOMAIN_HOSTS:
            return parsed.path
        return None
    if value.startswith("/") and not value.startswith("//"):
        return parsed.path
    return None


def validate_attributes(files: set[str]) -> list[str]:
    failures: list[str] = []
    for path in sorted(ROOT.rglob("*.html")):
        if ".git" in path.parts:
            continue
        parser = RouteParser(path)
        parser.feed(path.read_text(errors="ignore"))
        rel = path.relative_to(ROOT).as_posix()
        for tag, attr, value in parser.refs:
            route = checked_path(value)
            if route is not None and not route_exists(route, files):
                failures.append(f"{rel}: broken {tag} {attr} -> {value}")
    return failures


def validate_quoted_routes(files: set[str]) -> list[str]:
    failures: list[str] = []
    quoted_route = re.compile(
        r"""(?P<quote>['"])(?P<url>/(?!/)[A-Za-z0-9._~!$&()*+,;=:@%/-]+)(?:[?#][^'"]*)?(?P=quote)"""
    )
    for path in sorted(ROOT.rglob("*")):
        if ".git" in path.parts or path.suffix not in TEXT_EXTENSIONS:
            continue
        rel = path.relative_to(ROOT).as_posix()
        text = path.read_text(errors="ignore")
        for match in quoted_route.finditer(text):
            url = match.group("url")
            if not route_exists(url, files):
                failures.append(f"{rel}: broken quoted route -> {url}")
    return failures


def main() -> int:
    files = site_files()
    failures = validate_attributes(files) + validate_quoted_routes(files)
    if failures:
        for failure in failures:
            print(failure)
        print(f"\n{len(failures)} broken internal route reference(s) found.", file=sys.stderr)
        return 1
    print("All internal route references resolve.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
