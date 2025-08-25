// @todo: напишите здесь код парсера
function getPreviewImages() {
    const images = document.querySelectorAll('.preview img');
    const result = {};
    images.forEach((img, idx) => {
        const src = img.src;
        const full = img.dataset.src;
        result[idx] = {
            alt: img.alt,
            src: src
        };
        if (full && full !== src) {
            result[idx].full = full;
        }
    });
    return result;
}


// Функция для вычисления скидки
function getDiscount () {
    const price = Number((document.querySelector(".price")?.textContent.match(/\d+/) || [null])[0]);
    const oldPrice = Number((document.querySelector(".price")?.textContent.match(/\d+/g) || [null, null])[1]);
    if (oldPrice - price == 0) {
        return "0%"
    } else {
        return oldPrice - price
    }
}

// Функция для определения валюты
function getCurrency(currencyMatch) {
    if (currencyMatch[0] == "₽") {
        return 'RUB';
    } else if (currencyMatch[0] == "$") {
        return 'USD';
    } else if (currencyMatch[0] == "€") {
        return 'EUR';
    }
}

// Функция для получения массива рекомендованных товаров
function getSuggested() {
    const articles = document.querySelectorAll('.suggested .items');
    const result = [];
    articles.forEach((art) => {
        art.querySelectorAll('article').forEach(item => {
            const img = item.querySelector('img');
            const name = item.querySelector('h3').textContent.trim();
            const currency = getCurrency(item.querySelector('b')?.textContent.match(/[^\d\s]+/)[0]);
            const price = Number((item.querySelector('b')?.textContent.match(/\d+/) || [null])[0]);
            result.push({
                name: name,
                description : item.querySelector("p")?.textContent.trim() || '',
                image : img.src,
                price : price,
                currency: currency
            });
        });
    });
    return result;
}


// Функция для получения массива отзывов
function getReviews() {
    const articles = document.querySelectorAll('.reviews .items');
    const result = [];
    articles.forEach((art) => {
        art.querySelectorAll('article').forEach(item => {
            result.push({
                rating: item.querySelectorAll('.rating .filled').length,
                author : { "avatar": item.querySelector(".author img").src, "name": item.querySelector(".author span").textContent.trim() },
                title : item.querySelector('h3').textContent.trim(),
                description : item.querySelector("p")?.textContent.trim() || '',
                date: item.querySelector(".author i")?.textContent.trim() || '',
            });
        });
    });
    return result;
}

// Главная функция парсера
function parsePage() {
    return {
        meta: {"language" : document.documentElement.lang,
            "title" : document.title.split('—')[0].trim(),
            "keywords" : (document.querySelector('meta[name="keywords"]')?.content || '').split(',').map(word => word.trim()),
            "description" : document.querySelector('meta[name="description"]')?.content.trim(),
            "opengraph" : {"title" : document.querySelector('meta[property="og:title"]')?.content.split('—')[0].trim(),
                        "image" : document.querySelector('meta[property="og:image"]')?.content.trim(),
                        "type" : document.querySelector('meta[property="og:type"]')?.content.trim()}
        },
        product: {"id" : document.querySelector('.product').dataset.iMd,
                "name" : document.querySelector('h1').textContent,
                "isLiked" : document.querySelector('.like').classList.contains('active'),
                "images" : getPreviewImages(),
                "tags" : {"category": [document.querySelector(".green").textContent], 
                        "discount": [document.querySelector(".red").textContent],
                        "label": [document.querySelector(".blue").textContent]},
                "price" : Number((document.querySelector(".price")?.textContent.match(/\d+/) || [null])[0]),
                "oldPrice" : Number((document.querySelector(".price")?.textContent.match(/\d+/g) || [null, null])[1]),
                "discount" : getDiscount(),
                "currency" : getCurrency(document.querySelector(".price")?.textContent.match(/[^\d\s]+/)),
                "properties": (() => {
                    const propsArr = document.querySelector('.properties').textContent
                        .split('\n')
                        .map(prop => prop.trim())
                        .filter(prop => prop);
                    const propsObj = {};
                    for (let i = 0; i < propsArr.length; i += 2) {
                        propsObj[propsArr[i]] = propsArr[i + 1] || null;
                    }
                    return propsObj;
                })(),
                "description" : (() => {
                    const desc = document.querySelector('.description');
                    if (!desc) return '';
                    const clone = desc.cloneNode(true);
                    clone.querySelectorAll('*').forEach(el => {
                        Array.from(el.attributes).forEach(attr => el.removeAttribute(attr.name));
                    });
                    Array.from(clone.attributes).forEach(attr => clone.removeAttribute(attr.name));
                    return clone.innerHTML.trim();
                })(),
        },
        suggested: [getSuggested()],
        reviews: [getReviews()]
    };
}

window.parsePage = parsePage;