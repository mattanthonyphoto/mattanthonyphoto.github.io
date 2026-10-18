#!/usr/bin/env python3
"""Validate root-relative links in the static site."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
SITE_HOSTS = {"mattanthonyphoto.com", "www.mattanthonyphoto.com"}


class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return

        attrs = dict(attrs)
        href = attrs.get("href")
        if href:
            self.links.append(href)


def iter_html_files():
    for path in ROOT.rglob("*.html"):
        if ".git" not in path.parts:
            yield path


def normalize_internal_path(href):
    parsed = urlparse(href)

    if parsed.scheme in {"mailto", "tel", "sms", "javascript"}:
        return None
    if parsed.scheme and parsed.netloc not in SITE_HOSTS:
        return None
    if parsed.scheme and parsed.netloc in SITE_HOSTS:
        target = parsed.path
    else:
        if not href.startswith("/"):
            return None
        target = parsed.path

    if not target or target == "/":
        return "/"
    return target.rstrip("/")


def route_exists(route):
    if route == "/":
        return (ROOT / "index.html").is_file()

    target = ROOT / route.lstrip("/")
    return (
        target.is_file()
        or (target / "index.html").is_file()
        or target.with_suffix(".html").is_file()
    )


def main():
    broken = []

    for html_file in iter_html_files():
        parser = LinkParser()
        parser.feed(html_file.read_text())

        for href in parser.links:
            route = normalize_internal_path(href)
            if route and not route_exists(route):
                broken.append((html_file.relative_to(ROOT), href))

    if broken:
        print("Broken internal links:")
        for source, href in broken:
            print(f"{source}: {href}")
        return 1

    print("All internal links resolve.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
