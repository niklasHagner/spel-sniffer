const cheerio = require('cheerio');
const request = require('request');

const searchUrlTemplate = 'https://www.alphaspel.se/search/?query=';
const domainPrefix = 'https://www.alphaspel.se';


const parseHtmlToProducts = (response) => {
    const $ = cheerio.load(response);
    const foundProducts = $('.product').map((_, el) => {
        const $el = $(el);
        const game = {
            url: domainPrefix + $el.find('a').first().attr('href'),
            name: $el.find('.product-name').text().trim(),
            image: domainPrefix + $el.find('img').first().attr('src'),
            price: $el.find('.price').first().text().trim(),
            available: $el.find('.add-to-cart').text().indexOf('Köp') > -1
        }

        return game;
    }).get();

    return foundProducts;
}


const search = (term) => {
    const concenatedTerm = term.replace(' ', '+');

    const searchUrl = searchUrlTemplate + concenatedTerm;
    return new Promise((resolve, reject) => {
        request(searchUrl, function (error, response, body) {
            if (error) {
                reject(error);
            }

            if (response.statusCode >= 200 && response.statusCode < 300) {
                resolve({
                    name: 'alphaspel',
                    url: '',
                    games: parseHtmlToProducts(body)
                });
            }

            reject('Unknown error');
        });
    });
}

module.exports = {
    search
}