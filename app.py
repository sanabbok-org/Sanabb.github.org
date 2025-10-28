from flask import Flask, request, jsonify, render_template, send_file
from rembg import remove
from PIL import Image
import io
import os
import uuid

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/remove-background', methods=['POST'])
def remove_background():
    try:
        # چیک کریں کہ فائل موجود ہے
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'کوئی فائل اپلوڈ نہیں ہوئی'})
        
        file = request.files['image']
        
        # چیک کریں کہ فائل کا نام ہے
        if file.filename == '':
            return jsonify({'success': False, 'error': 'کوئی فائل منتخب نہیں ہوئی'})
        
        # چیک کریں کہ فائل امیج ہے
        if not file.content_type.startswith('image/'):
            return jsonify({'success': False, 'error': 'صرف امیج فائلز اپلوڈ کریں'})
        
        # امیج کو کھولیں
        input_image = Image.open(file.stream)
        
        # فائل کا سائز چیک کریں
        if len(file.read()) > 16 * 1024 * 1024:
            return jsonify({'success': False, 'error': 'فائل کا سائز 16MB سے کم ہونا چاہیے'})
        file.stream.seek(0)  # ری سیٹ کریں
        
        # بیک گراؤنڈ ریموو کریں
        output_image = remove(input_image)
        
        # آؤٹ پٹ امیج کو میموری میں سیو کریں
        output_buffer = io.BytesIO()
        output_image.save(output_buffer, 'PNG')
        output_buffer.seek(0)
        
        return send_file(
            output_buffer,
            mimetype='image/png',
            as_attachment=True,
            download_name=f'no-background-{uuid.uuid4().hex[:8]}.png'
        )
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'سرور ایرر: {str(e)}'})

@app.route('/health')
def health():
    return jsonify({'status': 'OK', 'message': 'سرور کام کر رہا ہے'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
