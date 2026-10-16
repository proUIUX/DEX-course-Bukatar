/* Единые демо-данные для всех экранов лендинга: объект «Квартира на Пушкинской».
   Суммы считаются из позиций, поэтому в сценах и кадрах всегда совпадают. */
(function () {
  const MARKUP = { W: 15, M: 10, O: 0 }; // наценка по типу позиции, %

  const sections = [
    { name: 'Демонтаж', items: [
      ['W', 'Демонтаж плитки со стен и пола', 32, 'м²', 560],
      ['W', 'Демонтаж старой ванны', 1, 'шт', 2400],
      ['O', 'Вывоз строительного мусора', 1, 'рейс', 9500],
    ]},
    { name: 'Гидроизоляция', items: [
      ['W', 'Гидроизоляция пола', 6, 'м²', 400],
      ['M', 'Гидроизоляция Ceresit CR 65 20 кг', 4, 'шт', 2600, 'pet'],
      ['M', 'Лента гидроизоляционная 10 м', 2, 'шт', 1080, 'pet'],
      ['M', 'Грунт Ceresit CT 17 10 л', 2, 'шт', 640, 'pet'],
    ]},
    { name: 'Плитка', items: [
      ['W', 'Укладка плитки на пол', 6, 'м²', 1800],
      ['W', 'Укладка плитки на стены', 26, 'м²', 2000],
      ['M', 'Керамогранит Kerama Marazzi 60×60', 7, 'м²', 1690, 'pet'],
      ['M', 'Плитка настенная Cersanit 30×60', 28, 'м²', 1450, 'pet'],
      ['M', 'Клей плиточный Ceresit CM 11 25 кг', 16, 'шт', 520, 'pet'],
      ['M', 'Затирка Ceresit CE 40 2 кг', 4, 'шт', 690, 'pet'],
    ]},
    { name: 'Сантехника', items: [
      ['W', 'Монтаж ванны', 1, 'шт', 2800],
      ['W', 'Монтаж инсталляции и унитаза', 1, 'шт', 5500],
      ['W', 'Установка смесителя', 1, 'шт', 1500],
      ['M', 'Ванна акриловая 170×75', 1, 'шт', 18900, 'pet'],
      ['M', 'Инсталляция с унитазом Cersanit', 1, 'шт', 24990, 'pet'],
      ['M', 'Смеситель для ванны Grohe', 1, 'шт', 7490, 'pet'],
      ['O', 'Доставка материалов', 1, 'шт', 3500],
    ]},
  ].map(s => {
    const items = s.items.map(([type, name, qty, unit, cost, pet]) => {
      const markup = MARKUP[type];
      const price = Math.round(cost * (100 + markup)) / 100;
      return { type, name, qty, unit, cost, markup, price,
        costSum: qty * cost, sum: Math.round(qty * price * 100) / 100, pet: !!pet };
    });
    const sum = items.reduce((a, i) => a + i.sum, 0);
    const costSum = items.reduce((a, i) => a + i.costSum, 0);
    return { name: s.name, items, sum, costSum };
  });

  const all = sections.flatMap(s => s.items);
  const byType = t => all.filter(i => i.type === t).reduce((a, i) => a + i.sum, 0);
  const costByType = t => all.filter(i => i.type === t).reduce((a, i) => a + i.costSum, 0);
  const total = all.reduce((a, i) => a + i.sum, 0);
  const cost = all.reduce((a, i) => a + i.costSum, 0);

  const fmt = (n, dec = 2) => n.toLocaleString('ru-RU', { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace(/ /g, ' ');
  const qty = n => Number.isInteger(n) ? String(n) : fmt(n);

  window.BRO = {
    company: 'Моя компания',
    user: { initials: 'АИ', name: 'Алексей Иванов' },
    object: { name: 'Квартира на Пушкинской', city: 'Санкт-Петербург', address: 'Санкт-Петербург, ул. Пушкинская, 12, кв. 8', code: 'ТВЭ03800820' },
    client: { name: 'Ирина Смирнова', phone: '+7 921 456-12-08', email: 'irina.smirnova@mail.ru' },
    master: 'Алексей Иванов',
    estimate: { name: 'Ремонт ванной', status: 'Новая', template: 'Ванная под ключ', room: 'Ванная комната' },
    templates: [
      'Ванная под ключ',
      'Смета на ремонт (из "White Box" в чистовую) в квартире 40м² с потолком 3м',
      'Смета на ремонт (из бетона в чистовую) в квартире 40м² с потолком 3м',
      'Смета на черновые материалы',
    ],
    sections,
    totals: {
      total, cost, profit: total - cost,
      works: byType('W'), materials: byType('M'), other: byType('O'),
      worksCost: costByType('W'), materialsCost: costByType('M'), otherCost: costByType('O'),
      materialsPet: all.filter(i => i.type === 'M' && i.pet).reduce((a, i) => a + i.sum, 0),
    },
    // План-график, октябрь. День 1 = 1 октября, «сегодня» = 8 октября.
    plan: {
      month: 'Октябрь', from: 4, to: 19, today: 8,
      groups: [
        { name: '1. Демонтаж', works: [
          { n: '1.1 Демонтаж плитки и ванны', s: 5, e: 6, st: 'done' },
          { n: '1.2 Вывоз мусора', s: 6, e: 6, st: 'done' },
        ]},
        { name: '2. Гидроизоляция', works: [
          { n: '2.1 Гидроизоляция пола', s: 7, e: 8, st: 'work', delay: 2 },
        ]},
        { name: '3. Плитка', works: [
          { n: '3.1 Укладка плитки на пол', s: 11, e: 12, st: 'wait' },
          { n: '3.2 Укладка плитки на стены', s: 12, e: 15, st: 'wait' },
        ]},
        { name: '4. Сантехника', works: [
          { n: '4.1 Монтаж ванны', s: 16, e: 16, st: 'wait' },
          { n: '4.2 Монтаж инсталляции', s: 16, e: 17, st: 'wait' },
          { n: '4.3 Установка смесителя', s: 17, e: 17, st: 'wait' },
        ]},
        { name: '5. Финиш', works: [
          { n: '5.1 Уборка и сдача', s: 18, e: 18, st: 'wait' },
        ]},
      ],
    },
    // Финансы, акты и вложения объекта
    finance: {
      payments: [
        { d: '03 окт', n: 'Аванс по смете «Ремонт ванной»', who: 'Ирина Смирнова', sum: 100000 },
        { d: '08 окт', n: 'Оплата за материалы', who: 'Ирина Смирнова', sum: 50000 },
      ],
      expenses: [
        { d: '04 окт', n: 'Материалы Петровича, заказ 4821', sum: 128730 },
        { d: '06 окт', n: 'Вывоз мусора', sum: 9500 },
      ],
    },
    acts: [
      { n: 'Акт 1', w: 'Демонтаж', d: '06 окт', sum: 32868, st: 'Подписан заказчиком' },
      { n: 'Акт 2', w: 'Гидроизоляция', d: '10 окт', sum: 17984, st: 'Отправлен заказчику' },
    ],
    docs: [
      { n: 'Ремонт ванной.pdf', t: 'pdf', s: '214 КБ', d: '02 окт' },
      { n: 'Договор подряда.pdf', t: 'pdf', s: '1,2 МБ', d: '02 окт' },
      { n: 'План ванной.jpg', t: 'img', s: '840 КБ', d: '03 окт' },
      { n: 'Фото до ремонта', t: 'photos', s: '6 фото', d: '04 окт' },
    ],
    room: { l: 2.5, w: 2.4, h: 2.65, floor: 6, walls: 25.97 },
    fmt, qty,
  };
})();
