def test_get_transactions(client):
    response = client.get('/api/transactions')
    assert response.status_code == 200
    assert response.json == {'error': 'No transactions found'}
