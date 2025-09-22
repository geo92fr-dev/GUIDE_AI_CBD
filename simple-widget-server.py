#!/usr/bin/env python3
"""
Simple Widget Discovery Server for Windows
"""

import os
import json
import glob
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading

class WidgetHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/list-widgets':
            self.handle_list_widgets()
        else:
            super().do_GET()
    
    def handle_list_widgets(self):
        # Find all widget files
        widgets_dir = os.path.join(os.getcwd(), 'src', 'widgets')
        pattern = os.path.join(widgets_dir, 'widget_*.js')
        widget_files = glob.glob(pattern)
        
        # Convert to relative paths
        widgets = []
        for file_path in widget_files:
            relative_path = os.path.relpath(file_path, os.getcwd())
            url_path = relative_path.replace(os.sep, '/')
            widgets.append(url_path)
        
        response = {
            'widgets': widgets,
            'count': len(widgets)
        }
        
        # Send response
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        json_data = json.dumps(response, indent=2)
        self.wfile.write(json_data.encode())
        
        print(f"📋 Listed {len(widgets)} widgets")

def run_server():
    httpd = HTTPServer(('localhost', 8081), WidgetHandler)
    print("🚀 Simple Widget Server on http://localhost:8081")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()