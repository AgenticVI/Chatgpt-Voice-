import http.server
import socketserver
import os
import sys
import socket

def find_available_port(start_port=3000, max_attempts=50):
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('127.0.0.1', port))
                return port
        except OSError:
            continue
    return 8000

if __name__ == '__main__':
    directory = os.path.dirname(os.path.abspath(__file__))
    os.chdir(directory)
    
    port = find_available_port(3000)
    Handler = http.server.SimpleHTTPRequestHandler
    
    # Enable CORS and disable caching for development
    class CustomHandler(Handler):
        def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            super().end_headers()

    with socketserver.TCPServer(('127.0.0.1', port), CustomHandler) as httpd:
        print(f"PROTOTYPE_SERVER_STARTED:http://localhost:{port}")
        sys.stdout.flush()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer shutting down.")
