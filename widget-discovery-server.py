#!/usr/bin/env python3
"""
🔍 Widget Discovery Server
Service backend pour découverte automatique des widgets
Port: 8081
"""

import os
import json
import glob
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time

class WidgetDiscoveryHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        parsed_url = urlparse(self.path)
        
        if parsed_url.path == '/list-widgets':
            self.list_widgets()
        elif parsed_url.path == '/health':
            self.health_check()
        else:
            self.send_error(404, "Endpoint not found")
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def list_widgets(self):
        """List all widget files in src/widgets/ directory"""
        try:
            # Path to widgets directory
            widgets_dir = os.path.join(os.getcwd(), 'src', 'widgets')
            
            if not os.path.exists(widgets_dir):
                self.send_json_response({
                    'error': 'Widgets directory not found',
                    'path': widgets_dir
                }, 404)
                return
            
            # Find all widget_*.js files
            pattern = os.path.join(widgets_dir, 'widget_*.js')
            widget_files = glob.glob(pattern)
            
            # Convert to relative paths from project root
            widgets = []
            for file_path in widget_files:
                relative_path = os.path.relpath(file_path, os.getcwd())
                # Convert Windows paths to URL paths
                url_path = relative_path.replace(os.sep, '/')
                widgets.append(url_path)
            
            response = {
                'widgets': widgets,
                'count': len(widgets),
                'directory': widgets_dir,
                'timestamp': time.time()
            }
            
            self.send_json_response(response)
            print(f"📋 Listed {len(widgets)} widgets: {widgets}")
            
        except Exception as e:
            self.send_json_response({
                'error': str(e),
                'type': type(e).__name__
            }, 500)
    
    def health_check(self):
        """Health check endpoint"""
        response = {
            'status': 'healthy',
            'service': 'Widget Discovery Server',
            'timestamp': time.time()
        }
        self.send_json_response(response)
    
    def send_json_response(self, data, status=200):
        """Send JSON response"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        json_data = json.dumps(data, indent=2)
        self.wfile.write(json_data.encode())
    
    def log_message(self, format, *args):
        """Override to customize logging"""
        print(f"🔍 Widget Discovery: {format % args}")

def start_discovery_server(port=8081):
    """Start the widget discovery server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, WidgetDiscoveryHandler)
    
    print(f"🚀 Widget Discovery Server starting on port {port}")
    print(f"📍 Endpoints:")
    print(f"   GET  http://localhost:{port}/list-widgets - List all widgets")
    print(f"   GET  http://localhost:{port}/health - Health check")
    print(f"🔍 Serving from: {os.getcwd()}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n🛑 Widget Discovery Server stopped")
        httpd.shutdown()

if __name__ == '__main__':
    start_discovery_server()