import os
import json
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Cargar .env
load_dotenv()

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

# Config debug
DEBUG_MODE = os.getenv("FLASK_DEBUG", "false").lower() == "true"

# <<<< CAMBIO PRINCIPAL: Catálogo de productos completo y bien formateado >>>>
PRODUCT_CATALOG = """
- CATEGORÍA: Buzos
  - PRODUCTO: Buzo Lafayette Negro, PRECIO: $55.00
  - PRODUCTO: Buzo Givenchy Negro, PRECIO: $95.00
  - PRODUCTO: Buzo Fresh Eyes Celeste, PRECIO: $48.50
  - PRODUCTO: Buzo Graffiti Beige, PRECIO: $52.00
  - PRODUCTO: Buzo Cuello Redondo Marrón, PRECIO: $42.99
  - PRODUCTO: Buzo Liso Beige, PRECIO: $45.00
  - PRODUCTO: Buzo Explorer Verde, PRECIO: $50.00
  - PRODUCTO: Buzo Urbano Lila, PRECIO: $58.00
  - PRODUCTO: Sweater Rayado con Cierre, PRECIO: $62.00

- CATEGORÍA: Pantalones
  - PRODUCTO: Pantalón Cargo Lavado Beige, PRECIO: $75.00
  - PRODUCTO: Pantalón Cargo Técnico Gris, PRECIO: $80.00
  - PRODUCTO: Pantalón Cargo Jean Gris, PRECIO: $78.50
  - PRODUCTO: Jean Recto Negro, PRECIO: $68.00
  - PRODUCTO: Jean Ancho con Rotos, PRECIO: $72.00
  - PRODUCTO: Jean Carpintero Azul, PRECIO: $69.50
  - PRODUCTO: Jean Ancho Rotos Celeste, PRECIO: $71.00
  - PRODUCTO: Jean Slouchy Azul, PRECIO: $65.00

- CATEGORÍA: Remeras
  - PRODUCTO: Chomba Lisa Azul Marino, PRECIO: $35.00
  - PRODUCTO: Remera Fly Master Gris, PRECIO: $28.00
  - PRODUCTO: Remera Tokyo Negra, PRECIO: $27.50
  - PRODUCTO: Remera Urban Artist Negra, PRECIO: $29.00
  - PRODUCTO: Remera Lisa Blanca, PRECIO: $22.00
  - PRODUCTO: Remera "74" Gris Oscuro, PRECIO: $26.50

- CATEGORÍA: Camisas
  - PRODUCTO: Camisa Oversize Amarilla, PRECIO: $40.00
  - PRODUCTO: Camisa Satinada a Rayas, PRECIO: $45.50

- POLÍTICAS DE LA TIENDA:
  - ENVÍOS: Hacemos envíos a todo el país a través de Correo Argentino. La demora es de 3 a 7 días hábiles.
  - PAGOS: Aceptamos tarjetas de crédito/débito y Mercado Pago.
  - CAMBIOS: Se pueden realizar cambios dentro de los 15 días de recibida la compra.
"""

# Intento de configurar google.generativeai (opcional)
model = None
genai = None
try:
    import google.generativeai as genai
    api_key = os.getenv("GOOGLE_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        print("INFO: google-generativeai configurado correctamente.")
    else:
        print("INFO: GOOGLE_API_KEY no encontrada en .env.")
except Exception as e:
    print("INFO: No se pudo inicializar google.generativeai:", str(e))

print("DEBUG: GOOGLE_API_KEY?:", bool(os.getenv("GOOGLE_API_KEY")))
print("DEBUG: modelo configurado?:", bool(model))

# ... (El resto del código sigue exactamente igual) ...

# Servir estáticos
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def static_proxy(path):
    if path == '':
        return app.send_static_file('index.html')
    try:
        return app.send_static_file(path)
    except Exception:
        return app.send_static_file('index.html')

# Endpoint de diagnóstico del chatbot
@app.route('/api/chatbot/test', methods=['GET'])
def api_chatbot_test():
    if not model:
        return jsonify({"ok": False, "message": "Modelo NO configurado en el servidor (fallback activo)."}), 200
    try:
        chat = model.start_chat()
        resp = chat.send_message({"role": "user", "parts": ["Hola"]})
        reply = getattr(resp, "text", None) or str(resp)
        return jsonify({"ok": True, "reply_preview": reply})
    except Exception as e:
        tb = traceback.format_exc() if DEBUG_MODE else str(e)
        return jsonify({"ok": False, "error": tb}), 500

def _build_prompt_with_history(system_prompt, history, user_message):
    hist_lines = []
    for m in history:
        sender = m.get('sender', 'user')
        text = m.get('text', '')
        hist_lines.append(f"{sender.upper()}: {text}")
    historial = "\n".join(hist_lines).strip()
    prompt_parts = [system_prompt.strip()]
    if historial:
        prompt_parts.append("\n\nHistorial de la conversación:\n" + historial)
    prompt_parts.append("\n\nUsuario: " + user_message.strip())
    return "\n".join(prompt_parts)

# Chatbot conversacional (widget)
@app.route('/api/chatbot', methods=['POST'])
def api_chatbot():
    data = request.get_json() or {}
    user_message = (data.get('message') or '').strip()
    history = data.get('history', [])

    if not user_message:
        return jsonify({"error": "No se recibió ningún mensaje."}), 400

    if not model:
        text = user_message.lower()
        if 'producto' in text or 'productos' in text or 'listar' in text:
            prods = []
            for line in PRODUCT_CATALOG.splitlines():
                line = line.strip()
                if line.startswith('- PRODUCTO:') or line.startswith('- PRODUCTO'):
                    prods.append(line.split(':', 1)[-1].strip())
                if len(prods) >= 6:
                    break
            reply = "Tenemos: " + (", ".join(prods) if prods else "varios productos. Revisá la tienda.")
            return jsonify({"reply": reply})
        if 'envío' in text or 'envios' in text or 'envíos' in text:
            return jsonify({"reply": "Hacemos envíos a todo el país. Demora 3 a 7 días hábiles."})
        return jsonify({"reply": "El asistente no está configurado en el servidor. Podés preguntar 'listar productos' o 'envíos'."})

    system_prompt = f"""
Eres Jarvis, un asistente de ventas para 'Urban Threads'. Tuteá al cliente, sé amable y conciso.
Respondé únicamente con la información del catálogo y políticas. Si no sabés algo, decilo.
Base de conocimiento:
{PRODUCT_CATALOG}
"""
    prompt = _build_prompt_with_history(system_prompt, history, user_message)

    try:
        chat_session = model.start_chat()
        response = chat_session.send_message({"parts": [prompt]})
        reply_text = getattr(response, "text", None) or str(response)
        return jsonify({"reply": reply_text})
    except Exception as e:
        import traceback
        tb = traceback.format_exc() if DEBUG_MODE else str(e)
        print("ERROR /api/chatbot:", tb)
        return jsonify({"error": "Hubo un problema con el asistente. " + (tb if DEBUG_MODE else "")}), 500

# ... (El resto de los endpoints: /api/generar, /api/ventas, /api/login siguen igual) ...

@app.route('/api/generar', methods=['POST'])
def api_generar():
    data = request.get_json() or {}
    texto_mail = (data.get('textoMail') or '').strip()
    if not texto_mail:
        return jsonify({"error": "No se envió texto para generar la respuesta."}), 400
    if not model:
        resumen = texto_mail[:300].replace('\n', ' ')
        reply = (
            f"Hola,\n\nGracias por tu mensaje. Resumen: {resumen}...\n\n"
            "Proponé confirmar disponibilidad y pedir datos faltantes. ¿Querés que lo adapte con tono formal o informal?"
        )
        return jsonify({"respuesta": reply})
    system_prompt = """
Eres Jarvis, asistente de soporte/ventas. Generá un borrador de respuesta para el cliente a partir del correo recibido.
Sé cordial, claro y breve. Identificá la intención y proponé el siguiente paso.
"""
    prompt = system_prompt + "\n\nCorreo recibido:\n\n" + texto_mail
    try:
        chat_session = model.start_chat()
        response = chat_session.send_message({"parts": [prompt]})
        reply_text = getattr(response, "text", None) or str(response)
        return jsonify({"respuesta": reply_text})
    except Exception as e:
        import traceback
        tb = traceback.format_exc() if DEBUG_MODE else str(e)
        print("ERROR /api/generar:", tb)
        return jsonify({"error": "No se pudo generar la respuesta con la IA." + (f" Detalle: {tb}" if DEBUG_MODE else "")}), 500

@app.route('/api/ventas', methods=['POST'])
def api_ventas():
    data = request.get_json() or {}
    ventas_file = os.path.join(os.path.dirname(__file__), 'ventas.json')
    ventas = []
    if os.path.exists(ventas_file):
        try:
            with open(ventas_file, 'r', encoding='utf-8') as f:
                ventas = json.load(f)
        except Exception:
            ventas = []
    ventas.append(data)
    try:
        with open(ventas_file, 'w', encoding='utf-8') as f:
            json.dump(ventas, f, ensure_ascii=False, indent=2)
        return jsonify({"success": True})
    except Exception as e:
        tb = traceback.format_exc() if DEBUG_MODE else str(e)
        print("ERROR /api/ventas:", tb)
        return jsonify({"success": False, "message": "No se pudo guardar la venta."}), 500

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    username = data.get('username', '')
    password = data.get('password', '')
    ADMIN_USER = os.getenv('ADMIN_USER', 'admin')
    ADMIN_PASS = os.getenv('ADMIN_PASS', 'admin123')
    if username == ADMIN_USER and password == ADMIN_PASS:
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Usuario o contraseña incorrectos."}), 401

if __name__ == '__main__':
    app.run(debug=DEBUG_MODE, host='0.0.0.0', port=5000)