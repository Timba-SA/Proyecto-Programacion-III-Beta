import os
import json
import google.generativeai as genai
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

ADMIN_USER = {"username": "admin", "password": "1234"}

# --- Base de Conocimiento para la IA ---
# NOTA: Esto es redundante porque los productos están en main.js.
# En un proyecto PRO, la IA leería de la misma base de datos que la tienda.
# Lo ponemos así para replicar la funcionalidad del Trabajo 2.
PRODUCT_KNOWLEDGE_BASE = """
- CATEGORÍA: Buzos
  - PRODUCTOS: Buzo Lafayette Negro, Buzo Givenchy Negro, Buzo Fresh Eyes Celeste.
- CATEGORÍA: Pantalones
  - PRODUCTOS: Pantalón Cargo Lavado Beige, Pantalón Cargo Técnico Gris.
- CATEGORÍA: Remeras
  - PRODUCTOS: Chomba Lisa Azul Marino.
- POLÍTICAS:
  - ENVÍOS: A todo el país por Correo Argentino (3-7 días hábiles).
  - PAGOS: Tarjetas de crédito/débito y Mercado Pago.
  - CAMBIOS: Dentro de los 15 días, prenda en perfectas condiciones.
"""

# --- Configuración de IA de Gemini ---
try:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("No se encontró la GOOGLE_API_KEY en el archivo .env")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Error fatal al configurar la API de Google: {e}")
    model = None

# --- Rutas de la API ---

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if data and data.get('username') == ADMIN_USER['username'] and data.get('password') == ADMIN_USER['password']:
        return jsonify({"success": True, "message": "Login correcto"}), 200
    return jsonify({"success": False, "message": "Usuario o contraseña incorrectos"}), 401

@app.route('/api/ventas', methods=['POST'])
def add_venta():
    venta = request.get_json()
    print("INFO: Nueva venta registrada:", venta)
    return jsonify({"success": True, "message": "Venta registrada con éxito"}), 201
    
@app.route('/api/chatbot', methods=['POST'])
def handle_chatbot():
    if not model:
        return jsonify({"error": "El modelo de IA no está configurado."}), 500

    data = request.get_json()
    user_message = data.get('message')
    history = data.get('history', [])

    if not user_message:
        return jsonify({"error": "No se recibió ningún mensaje."}), 400

    system_prompt_template = f"""
        Eres Craven, un asistente de ventas experto para una tienda de ropa urbana.
        Tu personalidad es amable, canchera y eficiente. Tuteá al cliente.
        Tu objetivo es ayudar con dudas sobre productos y políticas.
        **REGLAS:**
        1. Respondé ÚNICAMENTE con la información de la base de conocimiento.
        2. Si no sabés algo, decilo claramente.
        3. Sé conciso.
        4. Tené en cuenta el historial de la conversación.
        --- BASE DE CONOCIMIENTO ---
        {PRODUCT_KNOWLEDGE_BASE}
        --- FIN BASE DE CONOCIMIENTO ---
    """
    
    # Construimos el historial para la IA, incluyendo el prompt del sistema
    full_conversation = [{"role": "system", "parts": [system_prompt_template]}]
    for message in history:
        role = "user" if message["sender"] == "user" else "model"
        full_conversation.append({"role": role, "parts": [message["text"]]})
    # Agregamos el último mensaje del usuario para obtener la nueva respuesta
    full_conversation.append({"role": "user", "parts": [user_message]})
    
    try:
        chat_session = model.start_chat(history=full_conversation)
        response = chat_session.send_message({"role": "user", "parts": [user_message]})
        return jsonify({"reply": response.text})
    except Exception as e:
        print(f"Error en la API de Gemini: {e}")
        return jsonify({"error": "Hubo un problema con el asistente."}), 500

# --- Sirviendo el Frontend ---
@app.route('/')
def serve_home():
    return send_from_directory('public', 'home.html')

@app.route('/<path:path>')
def serve_public_files(path):
    return send_from_directory('public', path)

if __name__ == '__main__':
    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug_mode, port=5000)