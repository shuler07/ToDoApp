# (Rus) ToDoApp
Веб-сервис, реализованный на React, FastAPI и PostgreSQL. Служит для создания, изменения, хранения и удобной организации пользовательских заметок. Возможности на данный момент: 
- Аутентификация пользователя по почте + паролю с верификацией почты  
- Создание, обновление, удаление, получение заметок
- Статусы заметок: выполненные, невыполненные и удаленные  
- Пользовательские теги для заметок: важное, любимое и любые другие, созданные пользователем
- Обновление почты, пароля, никнейма

## Как запустить
Для запуска потребуется установленный docker

### 1 способ:
1. Установите репозиторий к себе на устройство и запустите терминал из этой директории 
2. Запустить билд образа API:
   ###### docker build api -t todoapp-api
3. Запустить билд образа фронта:
   ###### docker build web -t todoapp-web
4. Подтянуть образ postgres:
   ###### docker image pull postgres:latest
5. Поднять композ из API, фронта и postgres:
   ###### docker compose up -d

### 2 способ:
1. Подтянуть образ API:
   ###### docker image pull shuler7/todoapp-api:1.0
2. Подтянуть образ фронта:
   ###### docker image pull shuler7/todoapp-web:1.0
3. Подтянуть образ postgres:
   ###### docker image pull postgres:latest
4. Поднять композ из API, фронта и postgres:
   ###### docker compose up -d

#### После запуска сервер будет находиться по адресу: http://localhost:5173

## Дополнительные настройки
.env файл задан по умолчанию с базовыми настройками и отключенной верификацией почты  
Для включения верификации, см. документацию [google](https://developers.google.com/workspace/gmail/api/quickstart/python). После настройки в .env изменить:  
###### VERIFICATION_ENABLED = "True"  
###### EMAIL_USER = "<ваша почта>"  
###### EMAIL_PASSWORD = "<специальный пароль для доступа к Gmail API>"  



# (Eng) ToDoApp
A web service built on React, FastAPI, and PostgreSQL. It allows you to create, edit, store, and easily organize user notes. Current features:
- User authentication via email and password with email verification
- Create, update, delete, and retrieve notes
- Note statuses: completed, uncompleted, and deleted
- Custom tags for notes: important, favorite, and any other tags created by the user
- Update email, password, and nickname

## How to run
Docker must be installed to run.

### 1 way:
1. Istall the repository to your device and run terminal from this directory.
2. Run the API image build:
###### docker build api -t todoapp-api
3. Run the frontend image build:
###### docker build web -t todoapp-web
4. Pull the postgres image:
###### docker image pull postgres:latest
5. Compose the API, frontend, and postgres:
###### docker compose up -d

### 2 way:
1. Pull the API image:
###### docker image pull shuler7/todoapp-api:1.0
2. Pull the frontend image:
###### docker image pull shuler7/todoapp-web:1.0
3. Pull the postgres image:
###### docker image pull postgres:latest
4. Compose the API, frontend, and postgres:
###### docker compose up -d

#### After starting, the server will be located at: http://localhost:5173

## Additional settings

The .env file is set by default with basic settings and email verification disabled  
To enable verification, see the [google](https://developers.google.com/workspace/gmail/api/quickstart/python) documentation. After configuring, change the following in .env:  
###### VERIFICATION_ENABLED = "True"
###### EMAIL_USER = "<your email>"
###### EMAIL_PASSWORD = "<special password for accessing the Gmail API>"
