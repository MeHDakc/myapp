async function loadProducts(variant, callback) {
    try {
        const response = await fetch('/load_products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({variant})
        });
        const data = await response.json();

        const tableBody = $('#products-table-body');
        tableBody.empty();

        data.products.forEach((product, index) => {
            tableBody.append(`
                    <tr>
                        <td>${product.name}</td>
                        <td><input type="tel" inputmode="numeric" min="0" step="0.001" value="0" class="quantity" data-price="${product.price}" data-index="${index}" oninput="validatePrecision(this, 15, 3)"></td>
                        <td>${product.price}</td>
                        <td class="sum" id="sum-${index}">0.00</td>
                    </tr>
                `);
        });

        attachQuantityListeners();
        validateForm();
        if (callback) callback(); // Запуск анимации после загрузки
    } catch (error) {
        console.error("Ошибка при загрузке товаров:", error);
    }
}

function validatePrecision(input, maxDigits, maxDecimals) {
    const regex = new RegExp(`^\\d{0,${maxDigits}}(\\.\\d{0,${maxDecimals}})?$`);
    const value = input.value;
    if (!regex.test(value)) {
        input.value = value.slice(0, -1);
    }
}

function attachQuantityListeners() {
    $('.quantity').on('input', function () {
        const price = parseFloat($(this).data('price')) || 0;
        const index = $(this).data('index');
        const quantity = parseFloat($(this).val()) || 0;
        const sum = price * quantity;
        $(`#sum-${index}`).text(sum.toFixed(3));
        validateForm();
    });
}

function validateForm() {
    const confirmButton = $(".confirm");
    const hasValidProducts = $(".quantity").toArray().some(input => parseFloat($(input).val()) > 0);
    confirmButton.prop("disabled", !hasValidProducts);
}

function validateForm() {
    const confirmButton = document.querySelector("button.confirm");

    // Проверяем, есть ли хотя бы один товар с ненулевым количеством
    const hasValidProducts = Array.from(document.querySelectorAll(".quantity"))
        .some(input => parseFloat(input.value) > 0);

    confirmButton.disabled = !hasValidProducts;
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
    loadProducts('variant1', animateRows);

    $('.variant-button').on('click', function () {
        const selectedVariant = $(this).data('variant');

        // Деактивируем все кнопки и активируем выбранную
        $('.variant-button').removeClass('active');
        $(this).addClass('active');

        // Очистка текущего содержимого с плавным исчезновением
        $('#products-table-body').fadeOut(200, function () {
            loadProducts(selectedVariant, function () {
                $('#products-table-body').fadeIn(200);
                animateRows();
            });
        });
    });

    function animateRows() {
        $('#products-table-body tr').each(function (index) {
            $(this).css({
                opacity: 0,
                transform: 'translateX(-30px)'
            });

            setTimeout(() => {
                $(this).css({
                    opacity: 1,
                    transform: 'translateX(0)',
                    transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out'
                });
            }, index * 100);
        });
    }

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
})
;
document.addEventListener('input', function (event) {
    if (event.target.classList.contains('quantity')) {
        event.target.value = event.target.value.replace(/[^0-9.]/g, '');
    }
});

document.addEventListener('keydown', function (event) {
    if ((event.key === 'Enter' || event.key === 'Done') && event.target.classList.contains('quantity')) {
        event.preventDefault(); // Предотвращаем отправку формы
        const inputs = Array.from(document.querySelectorAll('.quantity'));
        const index = inputs.indexOf(event.target);
        if (index !== -1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    }
});
