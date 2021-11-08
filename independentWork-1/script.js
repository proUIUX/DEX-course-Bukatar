//УСЛОВНЫЕ ВЕТВЛЕНИЯ
//1. if (строка с нулём)
Выведется

//2. Название JavaScript
let question = prompt('Какое «официальное» название JavaScript?', '');

if (question == 'ECMAScript') {
  alert( 'Верно!' );
} else {
  alert( 'Не знаете? ECMAScript!' );
}

//3. Покажите знак числа
let numberCheck = prompt('Введите число', 0);

if (numberCheck > 0) {
  alert( 1 );
} else if (numberCheck < 0) {
  alert( -1 );
} else {
  alert( 0 );
}

//4. Перепишите 'if' в '?'
result = (a + b < 4) ? 'Мало' : 'Много';

//5. Перепишите 'if..else' в '?'
let message = (login == 'Сотрудник') ? 'Привет' :
  (login == 'Директор') ? 'Здравствуйте' :
  (login == '') ? 'Нет логина' :
  '';



// ТИПЫ ДАННЫХ
// 1.Шаблонные строки
let name = "Ilya";
alert( `hello ${1}` ); // будет hello 1
alert( `hello ${"name"}` ); //  будет hello name
alert( `hello ${name}` ); // будет hello Ilya



// ЧИСЛА
// 1. Сумма пользовательских чисел
let numberOne = +prompt("напишите число", "");
let numberTwo = +prompt("напишите число"", "");

alert( numberOne + numberTwo );



// СТРОКИ
//1. Сделать первый символ заглавным
function ucFirst(str) {
  if (!str) return str;

  return str[0].toUpperCase() + str.slice(1);
}

alert( ucFirst("вася") );



// ДАТА И ВРЕМЯ
// 1. Создайте дату
let newDate = new Date(2012, 1, 20, 3, 12);
alert( newDate );



// БАЗОВЫЕ ОПЕРАТОРЫ
//1. Постфиксная и префиксная формы
a = 2;
b = 2;
c = 2;
d = 1;

//2.Результат присваивания
a = 4;
x = 5;

//3. Преобразование типов
"" + 1 + 0 = "10";
"" - 1 + 0 = -1;
true + false = 1;
6 / "3" = 2;
"2" * "3" = 6;
4 + 5 + "px" = "9px";
"$" + 4 + 5 = "$45";
"4" - 2 = 2;
"4px" - 2 = NaN;
7 / 0 = Infinity;
"  -9  " + 5 = "  -9  5";
"  -9  " - 5 = -14;
null + 1 = 1;
undefined + 1 = NaN;
" \t \n" - 2 = -2;

//4.Исправьте сложение
let a = +prompt("Первое число?", 1);
let b = +prompt("Второе число?", 2);
alert(a + b);



// ЛОГИЧЕСКИЕ ОПЕРАТОРЫ
// 1. Что выведет alert (ИЛИ)?
alert( null || 2 || undefined );



// ОПЕРАТОРЫ СРАВНЕНИЯ
// 1. Операторы сравнения
5 > 4 → true
"ананас" > "яблоко" → false
"2" > "12" → true
undefined == null → true
undefined === null → false
null == "\n0\n" → false
null === +"\n0\n" → false
