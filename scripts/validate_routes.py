#!/usr/bin/env python3
"""Validate internal route references for this static site."""

from __future__ import annotations

from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parents[1]
SITE_HOSTS = {
    "mattanthonyphoto.com",
    "www.mattanthonyphoto.com",
    "mattanthonyphoto.github.io",
}
LINK_ATTRS = {"href", "src", "action", "poster"}
SKIP_SCHEMES = {"mailto", "tel", "javascript", "data"}
QUOTED_ROUTE = re.compile(
    r"""(?P<quote>['"])(?P<url>/(?!/)[A-Za-z0-9_./?&=%#:+-]+)(?P=quote)"""
)


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.links: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if name in LINK_ATTRS and value:
                self.links.append((name, value))


def normalize_internal_route(value: str) -> str | None:
    value = value.strip()
    if not value or value.startswith("#"):
        return None

    parsed = urlparse(value)
    if parsed.scheme in SKIP_SCHEMES:
        return None
    if parsed.scheme in {"http", "https"}:
        if parsed.netloc not in SITE_HOSTS:
            return None
        return parsed.path or "/"
    if value.startswith("/"):
        return value
    return None


def route_exists(route: str) -> bool:
    route = unquote(route.split("#", 1)[0].split("?", 1)[0])
    if not route or route == "/":
        return (ROOT / "index.html").exists()
    if not route.startswith("/"):
        return True

    rel = route.lstrip("/")
    return (
        (ROOT / rel).exists()
        or (ROOT / rel / "index.html").exists()
        or (ROOT / f"{rel}.html").exists()
    )


def iter_html_links(path: Path, text: str) -> list[tuple[str, str]]:
    parser = LinkParser()
    parser.feed(text)
    return parser.links


def main() -> int:
    broken: dict[str, list[tuple[str, str, str]]] = defaultdict(list)

    for path in sorted(ROOT.rglob("*.html")):
        if ".git" in path.parts:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        rel = str(path.relative_to(ROOT))

        for attr, value in iter_html_links(path, text):
            route = normalize_internal_route(value)
            if route and not route_exists(route):
                broken[route].append((rel, attr, value))

        for match in QUOTED_ROUTE.finditer(text):
            value = match.group("url")
            route = normalize_internal_route(value)
            if route and not route_exists(route):
                broken[route].append((rel, "quoted-route", value))

    for path in sorted(ROOT.rglob("*.js")):
        if ".git" in path.parts:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        rel = str(path.relative_to(ROOT))
        for match in QUOTED_ROUTE.finditer(text):
            value = match.group("url")
            route = normalize_internal_route(value)
            if route and not route_exists(route):
                broken[route].append((rel, "quoted-route", value))

    if broken:
        print(f"Broken internal routes: {len(broken)}", file=sys.stderr)
        for route, refs in sorted(broken.items()):
            files = sorted({ref[0] for ref in refs})
            print(f"{route} ({len(refs)} refs in {len(files)} files)", file=sys.stderr)
            for rel, attr, value in refs[:8]:
                print(f"  {rel}: {attr}={value}", file=sys.stderr)
            if len(refs) > 8:
                print(f"  ... {len(refs) - 8} more refs", file=sys.stderr)
        return 1

    print("All internal routes resolve.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
