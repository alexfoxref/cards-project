# cards-project

Cards Project

Приложение разработано в демонстрационных целях (и как тренировка для мозгов :) ), не является реальным продакшн проектом.

Реализовано:

  Серверная часть:

    1. API написано с помощью express.js
    2. В качестве базы данных используется облачный сервис Mongo
    
  Клиентская часть:
  
    1. Разработана библиотека, использующая концепт VirtualDOM наподобие React.js (в исходники не заглядывал на тот момент - тренировка для мозгов + практика и опробирование нового). В рамках библиотеки реализовано:
      - String/HTML Parser
      - VirtualDOM
      - Hooks (по образу и подобию react)
      - Routing
      - Store Manager (использую связку useReducer + useContext)
    2. Разработано небольшое приложение, реализующее:
      - Регистрация/Авторизация (без подтверждения)
      - Просмотр всех созданных карточек
      - Поиск по карточкам
      - Просмотр своих карточек
      - Создание/Редактирование/Удаление своей карточки
      
Скрипты:
  - npm run dev - разработка
  - npm run start - продакшн
  
Приложение развернуто на VPS хостинге:
  http://alexfoxrefcards.online/
