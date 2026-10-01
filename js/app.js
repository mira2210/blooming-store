// ============================================================
// BLOOMING STORE
// ============================================================


// ============================================================
// TELEGRAM MINI APP
// ============================================================

const tg = window.Telegram?.WebApp || null;


if (tg) {

    // Сообщаем Telegram,
    // что Mini App загрузился

    tg.ready();


    // Раскрываем приложение
    // на максимально доступную высоту

    tg.expand();

}


// ============================================================
// НАСТРОЙКИ
// ============================================================


const SHEET_ID =
    '1Rh4za11B6YBRFuh3djCgf76euUkRJ-O8_lilpnimygc';


// Telegram мастерицы.
// Сюда идут все заказы.

const TELEGRAM_USERNAME =
    'BloomingDejaVu';


// Telegram кофейни.
// Сюда ведёт кнопка мастер-классов.

const MASTERCLASS_LINK =
    'https://t.me/dejavuufa';


// ============================================================
// КАТЕГОРИИ
// ============================================================


const CATEGORIES = {

    knit: {
        sheet: '02 — Вязаные изделия',
        title: 'Вязаные изделия',
        subtitle: 'уютные вещи, созданные вручную'
    },


    earrings: {
        sheet: '03 — Серьги',
        title: 'Серьги',
        subtitle: 'маленькие детали для настроения ♡'
    },


    bracelets: {
        sheet: '04 — Браслеты и подвески',
        title: 'Браслеты и подвески',
        subtitle: 'украшения ручной работы'
    },


    bags: {
        sheet: '05 — Сумки',
        title: 'Сумки',
        subtitle: 'для красивых повседневных вещей'
    },


    other: {
        sheet: '06 — Прочее',
        title: 'Прочее',
        subtitle: 'маленькие находки от Blooming Store'
    }

};


// ============================================================
// GOOGLE SHEETS
// ============================================================


async function getSheetData(sheetName) {

    const url =
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
        `?sheet=${encodeURIComponent(sheetName)}` +
        `&tqx=out:json`;


    try {

        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `Ошибка загрузки таблицы: ${response.status}`
            );

        }


        const text =
            await response.text();


        const jsonText =
            text.substring(
                text.indexOf('{'),
                text.lastIndexOf('}') + 1
            );


        const data =
            JSON.parse(jsonText);


        if (
            !data.table ||
            !data.table.rows
        ) {

            return [];

        }


        const columns =
            data.table.cols.map(
                column => column.label || ''
            );


        return data.table.rows.map(row => {

            const item = {};


            columns.forEach(
                (column, index) => {

                    const cell =
                        row.c[index];


                    if (!column) {
                        return;
                    }


                    if (!cell) {

                        item[column] = '';

                        return;

                    }


                    item[column] =
                        cell.f !== undefined
                            ? cell.f
                            : cell.v !== undefined
                                ? cell.v
                                : '';

                }
            );


            return item;

        });


    } catch (error) {

        console.error(
            'Ошибка Google Sheets:',
            error
        );

        throw error;

    }

}


// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================


function formatPrice(price) {

    if (!price) {
        return '';
    }


    const number =
        Number(
            String(price)
                .replace(/\s/g, '')
                .replace(/₽/g, '')
                .replace(',', '.')
        );


    if (Number.isNaN(number)) {
        return price;
    }


    return `${number.toLocaleString('ru-RU')} ₽`;

}



function encode(value) {

    return encodeURIComponent(
        value || ''
    );

}



function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return '';

    }


    return String(value)

        .replace(/&/g, '&amp;')

        .replace(
            /</g,
            '&lt;'
        )

        .replace(
            />/g,
            '&gt;'
        )

        .replace(
            /"/g,
            '&quot;'
        )

        .replace(
            /'/g,
            '&#039;'
        );

}


// ============================================================
// TELEGRAM — ЗАКАЗ
// ============================================================


function getTelegramOrderLink(
    productName = ''
) {

    const message =
        `Здравствуйте! Хочу заказать «${productName}» из Blooming Store 🌿`;


    return (
        `https://t.me/${TELEGRAM_USERNAME}` +
        `?text=${encode(message)}`
    );

}


// ============================================================
// СТАТУС ТОВАРА
// ============================================================


function getStatus(product) {

    return String(
        product['Статус'] || ''
    )
        .trim()
        .toLowerCase();

}



function isAvailable(product) {

    const status =
        getStatus(product);


    return (
        status === 'в наличии' ||
        status === 'под заказ'
    );

}


// ============================================================
// КАРТОЧКА ТОВАРА
// ============================================================


function createProductCard(
    product,
    categoryKey
) {

    const id =
        product['ID'] || '';


    const name =
        product['Название'] ||
        'Изделие';


    const image =
        product['Фото 1'] ||
        '';


    const description =
        product['Описание'] ||
        '';


    const price =
        product['Цена'] ||
        '';


    const status =
        product['Статус'] ||
        '';


    const productUrl =
        `product.html?id=${encodeURIComponent(id)}` +
        `&category=${encodeURIComponent(categoryKey)}`;


    let statusClass = '';


    if (
        status.toLowerCase() ===
        'в наличии'
    ) {

        statusClass =
            'status--available';

    }


    if (
        status.toLowerCase() ===
        'под заказ'
    ) {

        statusClass =
            'status--order';

    }


    return `

        <a
            href="${productUrl}"
            class="product-card"
        >


            <div class="product-card__image-wrap">


                ${
                    image

                    ? `

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(name)}"
                            class="product-card__image"
                            loading="lazy"
                        >

                      `

                    : `

                        <div class="product-card__placeholder">
                            🌿
                        </div>

                      `
                }


                ${
                    status

                    ? `

                        <span
                            class="product-card__status ${statusClass}"
                        >
                            ${escapeHTML(status)}
                        </span>

                      `

                    : ''
                }


            </div>


            <div class="product-card__info">


                <h2 class="product-card__name">
                    ${escapeHTML(name)}
                </h2>


                ${
                    description

                    ? `

                        <p class="product-card__description">
                            ${escapeHTML(description)}
                        </p>

                      `

                    : ''
                }


                ${
                    price

                    ? `

                        <p class="product-card__price">
                            ${formatPrice(price)}
                        </p>

                      `

                    : ''
                }


            </div>


        </a>

    `;

}


// ============================================================
// СТРАНИЦА КАТЕГОРИИ
// ============================================================


async function loadCategoryPage() {

    const productsGrid =
        document.getElementById(
            'products-grid'
        );


    if (!productsGrid) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const categoryKey =
        params.get('category');


    const category =
        CATEGORIES[categoryKey];


    if (!category) {

        productsGrid.innerHTML = `

            <div class="empty-state">

                <h2>
                    Категория не найдена
                </h2>

                <p>
                    Вернитесь в каталог
                    и выберите нужный раздел.
                </p>

                <a
                    href="catalog.html"
                    class="button button--primary"
                >
                    Вернуться в каталог
                </a>

            </div>

        `;


        return;

    }


    const titleElement =
        document.getElementById(
            'category-title'
        );


    const subtitleElement =
        document.getElementById(
            'category-subtitle'
        );


    if (titleElement) {

        titleElement.textContent =
            category.title;

    }


    if (subtitleElement) {

        subtitleElement.textContent =
            category.subtitle;

    }


    try {

        const products =
            await getSheetData(
                category.sheet
            );


        const visibleProducts =
            products.filter(
                product => {

                    const name =
                        String(
                            product['Название'] ||
                            ''
                        ).trim();


                    const status =
                        getStatus(product);


                    if (!name) {
                        return false;
                    }


                    if (
                        status === 'скрыт'
                    ) {
                        return false;
                    }


                    return true;

                }
            );


        visibleProducts.sort(
            (a, b) => {

                const orderA =
                    Number(
                        a['Порядок']
                    ) || 9999;


                const orderB =
                    Number(
                        b['Порядок']
                    ) || 9999;


                return orderA - orderB;

            }
        );


        if (
            visibleProducts.length === 0
        ) {

            productsGrid.innerHTML = `

                <div class="empty-state">

                    <div class="empty-state__icon">
                        🌿
                    </div>

                    <h2>
                        Здесь пока пусто
                    </h2>

                    <p>
                        Новые изделия скоро появятся.
                    </p>

                </div>

            `;


            return;

        }


        productsGrid.innerHTML =
            visibleProducts
                .map(
                    product =>
                        createProductCard(
                            product,
                            categoryKey
                        )
                )
                .join('');


    } catch (error) {

        console.error(error);


        productsGrid.innerHTML = `

            <div class="empty-state">

                <div class="empty-state__icon">
                    🌿
                </div>

                <h2>
                    Не удалось загрузить каталог
                </h2>

                <p>
                    Проверьте доступ к Google Таблице
                    и попробуйте обновить страницу.
                </p>

                <button
                    class="button button--primary"
                    onclick="location.reload()"
                >
                    Обновить
                </button>

            </div>

        `;

    }

}


// ============================================================
// ПОИСК ТОВАРА
// ============================================================


async function findProduct(
    categoryKey,
    productId
) {

    const category =
        CATEGORIES[categoryKey];


    if (!category) {
        return null;
    }


    const products =
        await getSheetData(
            category.sheet
        );


    return products.find(
        product =>
            String(product['ID']) ===
            String(productId)
    );

}


// ============================================================
// ГАЛЕРЕЯ
// ============================================================


function createGallery(product) {

    const images = [

        product['Фото 1'],

        product['Фото 2'],

        product['Фото 3'],

        product['Фото 4']

    ].filter(Boolean);


    if (
        images.length === 0
    ) {

        return `

            <div class="product-gallery">

                <div
                    class="
                        product-gallery__main
                        product-gallery__placeholder
                    "
                >
                    🌿
                </div>

            </div>

        `;

    }


    const thumbnails =
        images.length > 1

            ? `

                <div
                    class="product-gallery__thumbs"
                >

                    ${
                        images
                            .map(
                                (
                                    image,
                                    index
                                ) => `

                                    <button
                                        class="
                                            product-gallery__thumb
                                            ${
                                                index === 0
                                                    ? 'is-active'
                                                    : ''
                                            }
                                        "
                                        data-image="${escapeHTML(image)}"
                                        type="button"
                                    >

                                        <img
                                            src="${escapeHTML(image)}"
                                            alt=""
                                        >

                                    </button>

                                `
                            )
                            .join('')
                    }

                </div>

              `

            : '';


    return `

        <div class="product-gallery">


            <div class="product-gallery__main">

                <img
                    id="main-product-image"
                    src="${escapeHTML(images[0])}"
                    alt="${escapeHTML(product['Название'])}"
                >

            </div>


            ${thumbnails}


        </div>

    `;

}


// ============================================================
// ПЕРЕКЛЮЧЕНИЕ ФОТО
// ============================================================


function setupGallery() {

    const mainImage =
        document.getElementById(
            'main-product-image'
        );


    const thumbnails =
        document.querySelectorAll(
            '.product-gallery__thumb'
        );


    if (
        !mainImage ||
        thumbnails.length === 0
    ) {

        return;

    }


    thumbnails.forEach(
        thumbnail => {

            thumbnail.addEventListener(
                'click',
                () => {

                    const image =
                        thumbnail.dataset.image;


                    if (!image) {
                        return;
                    }


                    mainImage.src =
                        image;


                    thumbnails.forEach(
                        item => {

                            item.classList.remove(
                                'is-active'
                            );

                        }
                    );


                    thumbnail.classList.add(
                        'is-active'
                    );

                }
            );

        }
    );

}


// ============================================================
// СТРАНИЦА ТОВАРА
// ============================================================


async function loadProductPage() {

    const productDetail =
        document.getElementById(
            'product-detail'
        );


    if (!productDetail) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const categoryKey =
        params.get('category');


    const productId =
        params.get('id');


    if (
        !categoryKey ||
        !productId
    ) {

        productDetail.innerHTML = `

            <div class="empty-state">

                <h2>
                    Изделие не найдено
                </h2>

                <a
                    href="catalog.html"
                    class="button button--primary"
                >
                    Вернуться в каталог
                </a>

            </div>

        `;


        return;

    }


    try {

        const product =
            await findProduct(
                categoryKey,
                productId
            );


        if (!product) {

            productDetail.innerHTML = `

                <div class="empty-state">

                    <h2>
                        Изделие не найдено
                    </h2>

                    <a
                        href="catalog.html"
                        class="button button--primary"
                    >
                        Вернуться в каталог
                    </a>

                </div>

            `;


            return;

        }


        const category =
            CATEGORIES[categoryKey];


        const name =
            product['Название'] ||
            'Изделие';


        const description =
            product['Описание'] ||
            '';


        const materials =
            product['Материалы'] ||
            '';


        const price =
            product['Цена'] ||
            '';


        const status =
            product['Статус'] ||
            '';


        document.title =
            `${name} — Blooming Store`;


        const backLink =
            document.getElementById(
                'product-back'
            );


        if (backLink) {

            backLink.href =
                `category.html?category=${encodeURIComponent(categoryKey)}`;


            backLink.textContent =
                `← ${category.title.toLowerCase()}`;

        }


        let statusClass = '';


        if (
            status.toLowerCase() ===
            'в наличии'
        ) {

            statusClass =
                'status--available';

        }


        if (
            status.toLowerCase() ===
            'под заказ'
        ) {

            statusClass =
                'status--order';

        }


        const orderButton =
            isAvailable(product)

                ? `

                    <a
                        href="${getTelegramOrderLink(name)}"
                        class="
                            button
                            button--primary
                            product-detail__order
                        "
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Заказать в Telegram
                    </a>

                  `

                : `

                    <a
                        href="${getTelegramOrderLink(name)}"
                        class="
                            button
                            button--secondary
                            product-detail__order
                        "
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Уточнить наличие
                    </a>

                  `;


        const materialsBlock =
            materials

                ? `

                    <div class="product-detail__meta">

                        <span>
                            Материалы
                        </span>

                        <p>
                            ${escapeHTML(materials)}
                        </p>

                    </div>

                  `

                : '';


        const descriptionBlock =
            description

                ? `

                    <div
                        class="
                            product-detail__description
                        "
                    >

                        <h3>
                            Описание
                        </h3>

                        <p>
                            ${escapeHTML(description)}
                        </p>

                    </div>

                  `

                : '';


        productDetail.innerHTML = `

            ${createGallery(product)}


            <div class="product-detail__info">


                <p class="eyebrow">
                    ${escapeHTML(category.title)}
                </p>


                <h1>
                    ${escapeHTML(name)}
                </h1>


                ${
                    price

                    ? `

                        <div class="product-detail__price">
                            ${formatPrice(price)}
                        </div>

                      `

                    : ''
                }


                ${
                    status

                    ? `

                        <span
                            class="
                                product-detail__status
                                ${statusClass}
                            "
                        >
                            ${escapeHTML(status)}
                        </span>

                      `

                    : ''
                }


                ${descriptionBlock}


                ${materialsBlock}


                ${orderButton}


            </div>

        `;


        setupGallery();


    } catch (error) {

        console.error(error);


        productDetail.innerHTML = `

            <div class="empty-state">

                <div class="empty-state__icon">
                    🌿
                </div>

                <h2>
                    Не удалось загрузить изделие
                </h2>

                <p>
                    Попробуйте обновить страницу.
                </p>

                <button
                    class="button button--primary"
                    onclick="location.reload()"
                >
                    Обновить
                </button>

            </div>

        `;

    }

}


// ============================================================
// ГЛАВНАЯ
// ============================================================


async function loadHomePage() {

    const heroImage =
        document.getElementById(
            'hero-image'
        );


    const heroTitle =
        document.getElementById(
            'hero-title'
        );


    if (
        !heroImage &&
        !heroTitle
    ) {

        return;

    }


    try {

        const data =
            await getSheetData(
                '01 — Главная'
            );


        const settings = {};


        data.forEach(
            row => {

                const parameter =
                    String(
                        row['Параметр'] ||
                        ''
                    ).trim();


                const value =
                    row['Значение'] ||
                    '';


                if (parameter) {

                    settings[parameter] =
                        value;

                }

            }
        );


        // Заголовок

        if (
            heroTitle &&
            settings.title
        ) {

            heroTitle.innerHTML =
                escapeHTML(
                    settings.title
                ).replace(
                    /\n/g,
                    '<br>'
                );

        }


        // Подзаголовок

        const heroSubtitle =
            document.getElementById(
                'hero-subtitle'
            );


        if (
            heroSubtitle &&
            settings.subtitle
        ) {

            heroSubtitle.textContent =
                settings.subtitle;

        }


        // Верхняя надпись

        const heroEyebrow =
            document.getElementById(
                'hero-eyebrow'
            );


        if (
            heroEyebrow &&
            settings.eyebrow
        ) {

            heroEyebrow.textContent =
                settings.eyebrow;

        }


        // Описание

        const heroDescription =
            document.getElementById(
                'hero-description'
            );


        if (
            heroDescription &&
            settings.description
        ) {

            heroDescription.textContent =
                settings.description;

        }


        // Главное фото

        if (
            heroImage &&
            settings.main_image
        ) {

            heroImage.style.backgroundImage =
                `url("${settings.main_image}")`;

        }


        // ====================================================
        // ИНДИВИДУАЛЬНЫЙ ЗАКАЗ
        // ====================================================

        const customOrder =
            document.getElementById(
                'custom-order'
            );


        if (customOrder) {

            const customMessage =
                'Здравствуйте! Хочу обсудить индивидуальный заказ для Blooming Store 🌿';


            customOrder.href =
                `https://t.me/${TELEGRAM_USERNAME}` +
                `?text=${encodeURIComponent(customMessage)}`;


            customOrder.target =
                '_blank';


            customOrder.rel =
                'noopener noreferrer';

        }


        // ====================================================
        // МАСТЕР-КЛАССЫ
        // ====================================================

        const masterclasses =
            document.getElementById(
                'masterclasses'
            );


        if (masterclasses) {

            masterclasses.href =
                MASTERCLASS_LINK;


            masterclasses.target =
                '_blank';


            masterclasses.rel =
                'noopener noreferrer';

        }


        // Заголовок страницы

        if (settings.title) {

            document.title =
                settings.title;

        }


    } catch (error) {

        console.error(
            'Не удалось загрузить главную:',
            error
        );


        // Даже если Google Sheets
        // временно недоступен,
        // кнопка заказа всё равно работает.

        const customOrder =
            document.getElementById(
                'custom-order'
            );


        if (customOrder) {

            const customMessage =
                'Здравствуйте! Хочу обсудить индивидуальный заказ для Blooming Store 🌿';


            customOrder.href =
                `https://t.me/${TELEGRAM_USERNAME}` +
                `?text=${encodeURIComponent(customMessage)}`;


            customOrder.target =
                '_blank';


            customOrder.rel =
                'noopener noreferrer';

        }

    }

}


// ============================================================
// TELEGRAM BACK BUTTON
// ============================================================


function setupTelegramBackButton() {

    if (!tg) {
        return;
    }


    const currentPage =
        window.location.pathname
            .split('/')
            .pop();


    // Главная

    if (
        currentPage === 'index.html' ||
        currentPage === ''
    ) {

        tg.BackButton.hide();

        return;

    }


    // Остальные страницы

    tg.BackButton.show();


    tg.BackButton.onClick(
        () => {


            // Каталог → главная

            if (
                currentPage ===
                'catalog.html'
            ) {

                window.location.href =
                    'index.html';

                return;

            }


            // Категория → каталог

            if (
                currentPage ===
                'category.html'
            ) {

                window.location.href =
                    'catalog.html';

                return;

            }


            // Товар → категория

            if (
                currentPage ===
                'product.html'
            ) {

                const params =
                    new URLSearchParams(
                        window.location.search
                    );


                const category =
                    params.get(
                        'category'
                    );


                if (category) {

                    window.location.href =
                        `category.html?category=${encodeURIComponent(category)}`;

                } else {

                    window.location.href =
                        'catalog.html';

                }


                return;

            }


            window.history.back();

        }
    );

}


// ============================================================
// ЗАПУСК
// ============================================================


document.addEventListener(
    'DOMContentLoaded',
    () => {

        setupTelegramBackButton();

        loadHomePage();

        loadCategoryPage();

        loadProductPage();

    }
);
