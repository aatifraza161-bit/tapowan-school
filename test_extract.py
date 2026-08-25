import urllib.request
import os

image_path = r'C:\Users\Admin\.gemini\antigravity\brain\5b8c1e83-9133-41f5-8359-5db87ff3994f\media__1784568369223.png'
with open(image_path, 'rb') as f:
    img_data = f.read()

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = (
    b'--' + boundary.encode() + b'\r\n' +
    b'Content-Disposition: form-data; name="file"; filename="face.png"\r\n' +
    b'Content-Type: image/png\r\n\r\n' +
    img_data +
    b'\r\n--' + boundary.encode() + b'--\r\n'
)

req = urllib.request.Request('http://localhost:8000/extract', data=body, method='POST')
req.add_header('Content-Type', 'multipart/form-data; boundary=' + boundary)

try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except Exception as e:
    print('ERROR:', e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
