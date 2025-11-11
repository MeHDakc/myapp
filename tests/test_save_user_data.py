import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from app import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

def test_save_user_data(client):
    response = client.post('/save_user_data', data={
        'fullname': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert response.status_code == 200
    assert response.json['message'] == 'Дані збережено!'