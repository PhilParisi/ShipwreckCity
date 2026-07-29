#!/usr/bin/env python3
"""Local dev server that serves .html files at extensionless URLs."""
import http.server, os, urllib.parse

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        # If path has no extension and no trailing slash, try appending .html
        _, ext = os.path.splitext(path)
        if not ext and not path.endswith('/'):
            candidate = path.lstrip('/') + '.html'
            if os.path.isfile(candidate):
                self.path = '/' + candidate
        super().do_GET()

    def log_message(self, fmt, *args):
        pass  # silence request log noise

if __name__ == '__main__':
    port = 8080
    print(f'\n  → http://localhost:{port}\n')
    http.server.test(HandlerClass=Handler, port=port)
