async function loadProducts(variant) {
    try {
        const response = await fetch('/load_products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({variant: variant})
        });

        const data = await response.json();
        const products = data.products;

        let tableContent = document.createDocumentFragment();
        products.forEach((product, index) => {
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.name}</td>
                <td>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value="0"
                        class="quantity"
                        data-price="${product.price}"
                        data-index="${index}"
                        oninput="validatePrecision(this, 15, 3)">
                </td>
                <td>${product.price}</td>
                <td class="sum" id="sum-${index}">0.00</td>
            `;
            tableContent.appendChild(tr);
        });

        const tableBody = document.getElementById('products-table-body');
        tableBody.innerHTML = '';
        tableBody.appendChild(tableContent);
        attachQuantityListeners();
        validateForm();
    } catch (error) {
        console.error("Ошибка при загрузке товаров:", error);
    }
}

function validateForm() {
    const confirmButton = document.querySelector("button.confirm");

    // Проверяем, заполнена ли форма
    const isFormValid = $('#order-form')[0].checkValidity();

    // Кнопка активна, если форма валидна
    confirmButton.disabled = !isFormValid;
}

function validatePrecision(input, maxDigits, maxDecimals) {
    const regex = new RegExp(`^\\d{0,${maxDigits}}(\\.\\d{0,${maxDecimals}})?$`);
    const value = input.value;
    if (!regex.test(value)) {
        input.value = value.slice(0, -1);
    }
}

function attachQuantityListeners() {
    const quantityInputs = document.querySelectorAll('.quantity');

    quantityInputs.forEach(input => {
        input.addEventListener('input', function (event) {
            const value = this.value;
            const cursorPosition = this.selectionStart;

            validatePrecision(this, 15, 3);

            if (this.value !== value) {
                this.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
            }

            // Динамически пересчитываем сумму при каждом изменении значения
            const price = parseFloat(this.getAttribute('data-price')) || 0;
            const index = this.getAttribute('data-index');
            const quantity = parseFloat(this.value) || 0;
            //Используем parseInt для целых чисел
            const sum = price * quantity;
            document.getElementById(`sum-${index}`).textContent = sum.toFixed(2);
        });

        input.addEventListener('focus', function () {
            if (this.value === '0') {
                this.value = '';
            }
        });

        input.addEventListener('blur', function () {
            if (!this.value.trim()) {
                this.value = '0';
            }
        });
    });
}

$(document).ready(function () {
    // Загружаем товары для начального варианта
    loadProducts('variant1');

    // Обработчик клика по кнопкам выбора варианта
    $('.variant-button').on('click', function () {
        const selectedVariant = $(this).data('variant');

        // Деактивируем все кнопки и активируем выбранную
        $('.variant-button').removeClass('active');
        $(this).addClass('active');

        // Загружаем товары для выбранного варианта
        loadProducts(selectedVariant);
    });

// Активируем кнопку для предзагруженного варианта
    $('.variant-button[data-variant="variant1"]').addClass('active');

    $('#order-form').on("input change", validateForm);


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
});

