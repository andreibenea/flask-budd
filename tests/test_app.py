def test_home(client):
    response = client.get('/')
    assert response.status_code == 200


def test_transactions(client):
    response = client.get('/transactions')
    assert response.status_code == 200


def test_new_transaction(client):
    response = client.get('/transactions/add')
    assert response.status_code == 200


def test_budgets(client):
    response = client.get('/budgets')
    assert response.status_code == 200


def test_new_budget(client):
    response = client.get('/budgets/add')
    assert response.status_code == 200
