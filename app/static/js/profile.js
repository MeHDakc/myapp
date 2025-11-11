document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            fetch('/logout', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    window.location.href = '/';
                }
            }).catch(error => {
                console.error('Ошибка выхода:', error);
            });
        });
    }

    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', function () {
            window.location.href = '/order_form';
        });
    }

    const ordersLink = document.getElementById('orders-link');
    if (ordersLink) {
        ordersLink.addEventListener('click', function () {
            window.location.href = '/order_form';
        });
    }

    const ordersButton = document.getElementById('orders-button');
    if (ordersButton) {
        ordersButton.addEventListener('click', function () {
            window.location.href = '/order_form';
        });
    }
});