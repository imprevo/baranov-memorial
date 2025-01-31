document.addEventListener('DOMContentLoaded', () => {
    const logos = {
        'igromania': 'igromania.svg',
        'dtf': 'dtf.png',
        'stopgame': 'stopgame.png',
        'kanobu': 'kanobu.png',
        'lki': 'lki.png',
        'bestgamer': 'bestgamerICON.png',
        'zog': 'zog.png'
    };

    const fancy_names = {
        'igromania': 'Игромания',
        'dtf': 'DTF',
        'stopgame': 'StopGame.ru',
        'kanobu': 'Канобу',
        'lki': 'ЛКИ',
        'bestgamer': 'BestGamer.ru',
        'zog': 'Zone of Games'
    };

    let records = [];
    const loaded_event = new CustomEvent('records.loaded', {
        bubbles: true
    });

    function compile_all() {
        const data_files = [
            'dtf_main',
            'igromania_main',
            'stopgame_main',
            'stopgame_stream',
            'stopgame_infact',
            'kanobu',
            'lki',
            'bestgamer',
            'zog'
        ];
        const needed = data_files.length;
        let finished = 0;
        for (let i in data_files) {
            fetch('./data/' + data_files[i] + '.json')
                .then(res => res.json())
                .then(data => {
                    records = records.concat(data);
                    ++finished;
                    if (finished === needed) {
                        document.dispatchEvent(loaded_event)
                    }
                })
        }
    }

    const base_card = `
        <div class="col-xs-12 col-md-4 col-xl-3 pb-4 memorial-card-column">
                <div class="card memorial-card {nourl}" data-year="{year}" data-what="{where}">
                    {logo}
                    {img}
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                            <h5 class="card-title">{title}</h5>
                            <p class="card-text">{teaser_text}</p>
                        </div>
                    </div>
                        <div class="card-footer text-muted">
                            {url} <span class="float-right">{date}</span>
                        </div>
                </div>
        </div>`;
    const card_logo = '<img class="logo" src="{logo}">';
    const card_image = '<img src="{img}" class="card-img-top" loading="lazy">';
    const card_url = '<a href="{url}" target="_blank" class="btn btn-primary btn-sm">Перейти к материалу</a>';
    const card_nourl = '<a href="https://discord.gg/zDxKb44" target="_blank" class="btn btn-danger btn-sm">Нужна помощь в поиске!</a>';

    function draw_card(record) {
        let card = base_card
            .replace('{title}', record.title)
            .replace('{teaser_text}', record.teaser_text)
            .replace('{date}', record.date.day + '.' + record.date.month + '.' + record.date.year)
            .replace('{year}', record.date.year)
            .replace('{where}', record.where);

        if (record.date.day > 0) {
            card = card.replace('{date}', record.date.day + '.' + record.date.month + '.' + record.date.year)
        } else {
            card = card.replace('{date}', record.date.month + '.' + record.date.year)
        }

        if (record.url) {
            card = card.replace('{url}', card_url.replace('{url}', record.url)).replace('{nourl}', '')
        } else {
            card = card.replace('{url}', card_nourl).replace('{nourl}', 'border-danger')
        }

        if (record.img) {
            card = card.replace('{img}', card_image.replace('{img}', record.img))
        } else {
            card = card.replace('{img}', card_image.replace('{img}', './logo/placeholder.png'))
        }

        if (logos[record.where]) {
            card = card.replace('{logo}', card_logo.replace('{logo}', './res/image/' + logos[record.where]))
        } else {
            card = card.replace('{logo}', '')
        }

        document.querySelector('#records_container').insertAdjacentHTML('beforeend', card)
    }

    function draw(_records) {
        _records.forEach(record => {
            draw_card(record)
        })
    }

    document.addEventListener('records.loaded', function () {
        records = records.sort(function (a, b) {
            let amonth;
            let bmonth;
            let aday;
            let bday;
            a = a.date;
            b = b.date;
            if ((a.month + '').length === 1) {
                amonth = '0' + a.month
            } else {
                amonth = a.month
            }
            if ((b.month + '').length === 1) {
                bmonth = '0' + b.month
            } else {
                bmonth = b.month
            }
            if ((a.day + '').length === 1) {
                aday = '0' + a.day
            } else {
                aday = a.day
            }
            if ((b.day + '').length === 1) {
                bday = '0' + b.day
            } else {
                bday = b.day
            }
            if (Number(a.year + '' + amonth + '' + aday) > Number(b.year + '' + bmonth + '' + bday)) {
                return -1
            }
            if (Number(a.year + '' + amonth + '' + aday) < Number(b.year + '' + bmonth + '' + bday)) {
                return 1
            }
            return 0

        });


        draw(records);
        document.getElementById('placeholder').remove();

        const years = {};
        const sources = {};

        for (let i in records) {
            let record = records[i];

            if (!years[record.date.year]) {
                years[record.date.year] = 0
            }
            ++years[record.date.year];

            if (!sources[record.where]) {
                sources[record.where] = 0
            }
            ++sources[record.where]
        }

        Object.keys(years).forEach(year => {
            let linkNode = document.createElement('a');

            linkNode.classList.add('dropdown-item');
            linkNode.dataset.year = year;
            linkNode.textContent = year + ' (' + years[year] + ')';
            linkNode.href = 'javascript:void(0)';

            document.querySelector('#filters_year').insertAdjacentElement('afterbegin', linkNode)
        });

        Object.keys(sources).forEach(source => {
            let linkNode = document.createElement('a');

            linkNode.classList.add('dropdown-item');
            linkNode.dataset.where = source;
            linkNode.textContent = fancy_names[source] + ' (' + sources[source] + ')';
            linkNode.href = 'javascript:void(0)';

            document.querySelector('#filters_where').insertAdjacentElement('afterbegin', linkNode)
        });
    });

    compile_all();

    function remove_cards() {
        Array.from(document.querySelectorAll('.memorial-card-column')).forEach(card => card.remove())
    }

    function filter(filters) {
        let year;
        if (filters['year'] !== undefined) {
            year = filters['year']
        }

        let where;
        if (filters['where'] !== undefined) {
            where = filters['where']
        }

        return records.filter(function (record) {
            if (year !== undefined && where !== undefined) {
                return record.date.year === year && record.where === where
            } else if (year !== undefined) {
                return record.date.year === year
            } else if (where !== undefined) {
                return record.where === where
            } else {
                return true
            }
        })
    }

    document.body.addEventListener('click', e => {
        if (e.target.classList.contains('dropdown-item')) {
            if ('year' in e.target.dataset || 'where' in e.target.dataset) {
                remove_cards()
            }

            if ('year' in e.target.dataset) {
                draw(filter({'year': Number(e.target.dataset.year)}))
            }

            if ('where' in e.target.dataset) {
                draw(filter({'where': e.target.dataset.where}))
            }

            document.querySelector('#records_container').scrollIntoView({behavior: 'smooth', block: 'start'})
        }
    });

    Array.from(['#unfilter_year', '#unfilter_where']).forEach(id => {
        document.querySelector(id).onclick = () => {
            remove_cards();
            draw(records)
        }
    });

    document.querySelector('#draw_nourl').onclick = () => {
        remove_cards();
        draw(records.filter(function (record) {
            return !record.url
        }))
    }
});

// Hack :(
window.scrollTo(0, 0);
