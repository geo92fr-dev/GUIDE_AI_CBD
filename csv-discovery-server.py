#!/usr/bin/env python3
"""
🔍 CSV Discovery Server
Serveur simple pour découvrir dynamiquement les fichiers CSV dans samples/
"""

import os
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse
import mimetypes

class CSVDiscoveryHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        # API endpoint pour lister les fichiers CSV
        if parsed_path.path == '/api/discover-csv':
            self.send_csv_list()
        # API endpoint pour lister les fichiers widgets
        elif parsed_path.path == '/api/discover-widgets':
            self.send_widget_list()
        # Servir les fichiers statiques normalement
        else:
            super().do_GET()
    
    def send_csv_list(self):
        """Découvre et retourne la liste des fichiers CSV dans samples/"""
        try:
            samples_dir = 'samples'
            csv_files = []
            
            if os.path.exists(samples_dir):
                for filename in os.listdir(samples_dir):
                    if filename.lower().endswith('.csv'):
                        filepath = os.path.join(samples_dir, filename)
                        if os.path.isfile(filepath):
                            # Obtenir la taille du fichier
                            file_size = os.path.getsize(filepath)
                            
                            csv_files.append({
                                'fileName': filename,
                                'path': f'{samples_dir}/{filename}',
                                'size': file_size,
                                'lastModified': os.path.getmtime(filepath)
                            })
            
            # Trier par nom de fichier
            csv_files.sort(key=lambda x: x['fileName'])
            
            response_data = {
                'success': True,
                'files': csv_files,
                'count': len(csv_files)
            }
            
            # Envoyer la réponse JSON
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            json_response = json.dumps(response_data, indent=2)
            self.wfile.write(json_response.encode('utf-8'))
            
            print(f"📋 Discovered {len(csv_files)} CSV files")
            
        except Exception as e:
            # Erreur
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {
                'success': False,
                'error': str(e),
                'files': [],
                'count': 0
            }
            
            json_response = json.dumps(error_response)
            self.wfile.write(json_response.encode('utf-8'))
            
            print(f"❌ Error discovering CSV files: {e}")

    def send_widget_list(self):
        """Découvre et retourne la liste des fichiers widgets dans src/widgets/"""
        try:
            widgets_dir = 'src/widgets'
            widget_files = []
            
            if os.path.exists(widgets_dir):
                for filename in os.listdir(widgets_dir):
                    if filename.startswith('widget_') and filename.endswith('.js'):
                        filepath = os.path.join(widgets_dir, filename)
                        
                        if os.path.isfile(filepath):
                            file_size = os.path.getsize(filepath)
                            widget_files.append({
                                'fileName': filename,
                                'path': f'{widgets_dir}/{filename}',
                                'size': file_size,
                                'lastModified': os.path.getmtime(filepath)
                            })
            
            # Trier par nom de fichier
            widget_files.sort(key=lambda x: x['fileName'])
            
            response_data = {
                'success': True,
                'widgets': [w['fileName'] for w in widget_files],
                'files': widget_files,
                'count': len(widget_files)
            }
            
            # Envoyer la réponse JSON
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            json_response = json.dumps(response_data, indent=2)
            self.wfile.write(json_response.encode('utf-8'))
            
            print(f"🧩 Discovered {len(widget_files)} widget files")
            
        except Exception as e:
            # Erreur
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {
                'success': False,
                'error': str(e),
                'widgets': [],
                'files': [],
                'count': 0
            }
            
            json_response = json.dumps(error_response)
            self.wfile.write(json_response.encode('utf-8'))
            
            print(f"❌ Error discovering widget files: {e}")

if __name__ == '__main__':
    port = 8080
    server = HTTPServer(('localhost', port), CSVDiscoveryHandler)
    print(f"🚀 CSV & Widget Discovery Server running on http://localhost:{port}")
    print(f"📋 CSV discovery API: http://localhost:{port}/api/discover-csv")
    print(f"🧩 Widget discovery API: http://localhost:{port}/api/discover-widgets")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
    finally:
        server.server_close()