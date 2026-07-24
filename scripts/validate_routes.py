#!/usr/bin/env python3
"""Validate same-site static routes in generated HTML and JavaScript."""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parents[1]
SAME_SITE_HOSTS = {
    "mattanthonyphoto.com",
    "www.mattanthonyphoto.com",
    "mattanthonyphoto.github.io",
}
ATTRS_TO_CHECK = {"href", "src", "action", "poster"}
SOURCE_SUFFIXES = {".html", ".js"}


class LinkParser(HTMLParser):
    def __init__(self, source: Path) -> None:
        super().__init__()
        self.source = source
        self.links: list[tuple[int, str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        line, _ = self.getpos()
        for name, value in attrs:
            if name in ATTRS_TO_CHECK and value:
                self.links.append((line, name, value))
            elif name == "srcset" and value:
                for candidate in value.split(","):
                    url = candidate.strip().split(" ", 1)[0]
                    if url:
                        self.links.append((line, name, url))


def iter_files() -> Iterable[Path]:
    for path in ROOT.rglob("*"):
        if path.is_file() and ".git" not in path.parts:
            yield path


def route_for_html(path: Path) -> str:
    rel = path.relative_to(ROOT)
    if rel.name == "index.html":
        if rel.parent == Path("."):
            return "/"
        return "/" + rel.parent.as_posix().strip("/")
    return "/" + rel.with_suffix("").as_posix().strip("/")


def known_paths() -> set[str]:
    paths = {"/"}
    for path in iter_files():
        rel = path.relative_to(ROOT)
        file_path = "/" + rel.as_posix()
        paths.add(file_path)
        if path.suffix == ".html":
            route = route_for_html(path)
            paths.add(route)
            if route != "/":
                paths.add(route + "/")
    return paths


def normalize_url(value: str) -> str | None:
    value = value.strip()
    if (
        not value
        or value.startswith("#")
        or value.startswith(("mailto:", "tel:", "javascript:", "data:"))
    ):
        return None

    parsed = urlparse(value)
    if parsed.scheme or parsed.netloc:
        if parsed.netloc not in SAME_SITE_HOSTS:
            return None

    path = unquote(parsed.path or "/")
    if not path.startswith("/"):
        return None
    if path != "/":
        path = path.rstrip("/")
    return path


QUOTED_URL_RE = re.compile(
    r"""(?P<quote>["'])(?P<url>(?:https?://(?:www\.)?mattanthonyphoto\.com|https?://mattanthonyphoto\.github\.io)?/[^"'\s<>)]*)(?P=quote)"""
)


def quoted_urls(source: Path) -> Iterable[tuple[int, str]]:
    text = source.read_text(errors="ignore")

    for match in QUOTED_URL_RE.finditer(text):
        # Source files are small; a simple count keeps the script dependency-free.
        line = text.count("\n", 0, match.start()) + 1
        yield line, match.group("url")


def main() -> int:
    existing = known_paths()
    failures: list[str] = []

    for source in iter_files():
        if source.suffix == ".html":
            parser = LinkParser(source)
            parser.feed(source.read_text(errors="ignore"))
            for line, attr, value in parser.links:
                path = normalize_url(value)
                if path and path not in existing:
                    rel = source.relative_to(ROOT)
                    failures.append(f"{rel}:{line}: {attr} points to missing {path}")

        if source.suffix in SOURCE_SUFFIXES:
            for line, value in quoted_urls(source):
                path = normalize_url(value)
                if path and path not in existing:
                    rel = source.relative_to(ROOT)
                    failures.append(f"{rel}:{line}: string points to missing {path}")

    if failures:
        print("Missing same-site routes:")
        for failure in failures:
            print(f"  {failure}")
        return 1

    print(f"Validated {len(existing)} same-site routes/assets with no missing references.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
