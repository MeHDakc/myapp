from flask import render_template, request, redirect, url_for, session, jsonify
from app import app
from app.utils import save_user_to_db, user_exists, get_user_by_email, get_products_by_variant
from werkzeug.security import generate_password_hash, check_password_hash
import re
from app.utils import send_registration_email

@app.route('/')
def index():
    if 'email' in session:
        return redirect(url_for('order_form'))
    return render_template('index.html')

@app.route('/register', methods=['POST'])
def register():

    firstname = request.form['firstname']
    lastname = request.form['lastname']
    middle_name = request.form.get('middle_name', '')

    email = request.form.get('signup-email', '').strip().lower()
    phone = request.form.get('phone', '').strip()
    password = request.form.get('signup-password', '')
    confirm_password = request.form.get('confirm-password', '')

    fullname = f"{firstname} {lastname} {middle_name}".strip()
    # Проверка заполнения полей
    if not fullname or not email or not phone or not password or not confirm_password:
        return jsonify({"error": "Всі поля є обов'язковими для заповнення."}), 400

    # Проверка email
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Некоректний формат електронної пошти."}), 400

    # Проверка существования пользователя
    if user_exists(email):
        return jsonify({"error": "Користувач з такою електронною поштою вже існує."}), 400

    # Проверка пароля
    if password != confirm_password:
        return jsonify({"error": "Паролі не співпадають."}), 400

    # Хешируем пароль и сохраняем пользователя
    hashed_password = generate_password_hash(password)
    save_user_to_db(fullname, email, phone, hashed_password)
    session['email'] = email

    try:
        send_registration_email(email, fullname)
    except Exception as e:
        print(f"Ошибка отправки email: {e}")

    return jsonify({"success": "Реєстрація успішна. Перевірте свою пошту!"}), 200

@app.route('/login', methods=['POST'])
def login():

    email = request.form.get('signin-email', '').strip().lower()
    password = request.form.get('signin-password', '')

    # Проверка на пустые поля
    if not email or not password:
        return jsonify({"error": "Будь ласка, заповніть усі поля."}), 400

    user = get_user_by_email(email)

    # Проверка существования пользователя
    if not user:
        return jsonify({"error": "Користувача з такою електронною поштою не існує."}), 400

    # Проверка пароля
    if not check_password_hash(user['password_hash'], password):
        return jsonify({"error": "Неправильний пароль."}), 400

    # Авторизация
    session['email'] = email
    return jsonify({"success": "Вхід виконано успішно."}), 200


@app.route('/logout')
def logout():
    session.pop('email', None)
    return redirect(url_for('index'))

@app.route('/order_form', methods=['GET'])
def order_form():

    if 'email' not in session:
        return redirect(url_for('index'))
    products = get_products_by_variant(1)
    return render_template("order_form.html", products=products)

@app.route('/load_products', methods=['POST'])
def load_products():

    data = request.get_json()
    variant = data.get("variant")

    if variant == "variant1":
        products = get_products_by_variant(1)
    elif variant == "variant2":
        products = get_products_by_variant(2)
    else:
        return jsonify({"error": "Невідомий варіант"}), 400

    return jsonify({"products": products})

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/go_to_orders')
def go_to_orders():
    return render_template('order_form.html')