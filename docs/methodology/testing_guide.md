# Гайд по тестированию Django-проектов с ИИ (Cursor)

## Оглавление

1.  [Философия: Test-Driven Development с ИИ](#1-философия-test-driven-development-с-ии)
2.  [Пирамида тестирования в контексте Django](#2-пирамида-тестирования-в-контексте-django)
3.  [Unit-тесты: Тестирование изолированных компонентов](#3-unit-тесты-тестирование-изолированных-компонентов)
    -   [Тестирование моделей (Models)](#тестирование-моделей-models)
    -   [Тестирование сервисов и бизнес-логики](#тестирование-сервисов-и-бизнес-логики)
4.  [Integration-тесты: Взаимодействие компонентов](#4-integration-тесты-взаимодействие-компонентов)
    -   [Тестирование представлений (Views)](#тестирование-представлений-views)
    -   [Тестирование API (Django Rest Framework)](#тестирование-api-django-rest-framework)
    -   [Тестирование фоновых задач (Celery)](#тестирование-фоновых-задач-celery)
5.  [E2E-тесты: Сквозные сценарии пользователя](#5-e2e-тесты-сквозные-сценарии-пользователя)
6.  [Тестирование ИИ-компонентов](#6-тестирование-ии-компонентов)
    -   [Тестирование промптов](#тестирование-промптов)
    -   [Тестирование RAG-систем](#тестирование-rag-систем)
    -   [Тестирование ИИ-агентов](#тестирование-ии-агентов)
7.  [Приложение: Промпты для генерации тестов в Cursor](#7-приложение-промпты-для-генерации-тестов-в-cursor)

---

## 1. Философия: Test-Driven Development с ИИ

Классический TDD (Test-Driven Development) — это цикл "Красный → Зелёный → Рефакторинг". С появлением ИИ-ассистентов, таких как Cursor, этот цикл можно и нужно адаптировать. Мы называем этот подход **AI-Assisted TDD**.

**Ключевой принцип:** ИИ пишет и код, и тесты, но вы, как разработчик, управляете процессом, задавая контракты и проверяя результат. Вместо того чтобы писать тест руками, вы пишете **промпт для генерации теста**.

| Шаг | Классический TDD | AI-Assisted TDD |
|---|---|---|
| 1 | Написать падающий тест | **Написать промпт для генерации падающего теста** |
| 2 | Запустить тест, убедиться, что он красный | Запустить сгенерированный тест, убедиться, что он красный |
| 3 | Написать минимальный код для прохождения теста | **Написать промпт для генерации кода, проходящего тест** |
| 4 | Запустить все тесты, убедиться, что они зелёные | Запустить все тесты, убедиться, что они зелёные |
| 5 | Провести рефакторинг кода и тестов | **Написать промпт для рефакторинга кода и тестов** |

Этот подход позволяет вам оставаться на высоком уровне абстракции (проектирование и спецификация), делегируя рутинную реализацию ИИ.

---

## 2. Пирамида тестирования в контексте Django

Пирамида тестирования — это визуализация стратегии, где основу составляют быстрые и дешёвые unit-тесты, а вершину — медленные и дорогие E2E-тесты.

-   **Unit-тесты (70%):** Тестируют один компонент (функцию, класс) в изоляции. В Django это тесты для моделей, форм, сервисных классов. Они быстрые и не требуют доступа к БД или внешним сервисам (используются моки).
-   **Integration-тесты (20%):** Тестируют взаимодействие нескольких компонентов. В Django это тесты для views, API-эндпоинтов, Celery-задач. Они требуют доступа к тестовой БД.
-   **E2E-тесты (10%):** Тестируют полный пользовательский сценарий от начала до конца через браузер. Используются инструменты вроде Selenium или Playwright.

---

## 3. Unit-тесты: Тестирование изолированных компонентов

### Тестирование моделей (Models)

**Цель:** Проверить кастомные методы модели, свойства и логику сохранения.

**Шаблон теста (`tests/test_models.py`):**

```python
# FILE: tests/test_models.py
# START_MODULE_CONTRACT
# PURPOSE: Unit-тесты для моделей приложения core.
# END_MODULE_CONTRACT

from django.test import TestCase
from core.models import Order

# START_BLOCK_ORDER_MODEL_TESTS
class OrderModelTest(TestCase):

    # START_CONTRACT
    # PURPOSE: Тестирование метода is_overdue
    # END_CONTRACT
    def test_is_overdue_method(self):
        # ARRANGE: Создаем заказ, который уже просрочен
        overdue_order = Order.objects.create(status='new', due_date='2022-01-01')
        
        # ACT: Вызываем метод
        result = overdue_order.is_overdue()
        
        # ASSERT: Проверяем, что результат True
        self.assertTrue(result)
# END_BLOCK_ORDER_MODEL_TESTS
```

### Тестирование сервисов и бизнес-логики

**Цель:** Проверить сложную бизнес-логику, вынесенную в отдельные сервисные классы.

**Шаблон теста (`tests/test_services.py`):**

```python
# FILE: tests/test_services.py

from django.test import TestCase
from unittest.mock import patch
from core.services import NotificationService

class NotificationServiceTest(TestCase):

    @patch('core.services.requests.post')
    def test_send_telegram_notification(self, mock_post):
        # ARRANGE: Настраиваем мок для имитации успешного ответа API
        mock_post.return_value.status_code = 200
        service = NotificationService()
        
        # ACT: Вызываем метод сервиса
        service.send_telegram_notification(chat_id='123', message='test')
        
        # ASSERT: Проверяем, что метод requests.post был вызван с правильными аргументами
        mock_post.assert_called_once()
        self.assertIn('https://api.telegram.org', mock_post.call_args[0][0])
```

---

## 4. Integration-тесты: Взаимодействие компонентов

### Тестирование представлений (Views)

**Цель:** Проверить, что view возвращает правильный HTTP-статус, использует нужный шаблон и передаёт в него корректный контекст.

**Шаблон теста (`tests/test_views.py`):**

```python
from django.test import TestCase, Client
from django.urls import reverse
from core.models import Product

class ProductListViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        Product.objects.create(name='Test Product', price=100)

    def test_product_list_view(self):
        # ARRANGE: Получаем URL для нашего view
        url = reverse('product_list')
        
        # ACT: Делаем GET-запрос
        response = self.client.get(url)
        
        # ASSERT: Проверяем статус, шаблон и контекст
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'products/product_list.html')
        self.assertIn('products', response.context)
        self.assertEqual(len(response.context['products']), 1)
```

### Тестирование API (Django Rest Framework)

**Цель:** Проверить эндпоинты API: статус-коды, структуру ответа, создание и изменение данных.

**Шаблон теста (`tests/test_api.py`):**

```python
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

class ProductAPITest(APITestCase):
    def test_create_product(self):
        # ARRANGE
        url = reverse('product-list')
        data = {'name': 'New Product', 'price': '150.00'}
        
        # ACT
        response = self.client.post(url, data, format='json')
        
        # ASSERT
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Product')
```

### Тестирование фоновых задач (Celery)

**Цель:** Проверить, что задача Celery корректно выполняется и производит ожидаемые побочные эффекты.

**Шаблон теста (`tests/test_tasks.py`):**

```python
from django.test import TestCase
from core.tasks import generate_report
from unittest.mock import patch

class ReportTaskTest(TestCase):

    @patch('core.utils.pdf.create_pdf_file')
    def test_generate_report_task(self, mock_create_pdf):
        # ARRANGE
        # Чтобы задача выполнилась синхронно, а не через брокер
        
        # ACT
        generate_report.s(user_id=1).apply()
        
        # ASSERT
        mock_create_pdf.assert_called_once()
```

---

## 5. E2E-тесты: Сквозные сценарии пользователя

**Цель:** Эмулировать действия реального пользователя в браузере.

**Инструменты:** `django.contrib.staticfiles.testing.StaticLiveServerTestCase` + `selenium`.

**Шаблон теста (`tests/test_e2e.py`):**

```python
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium.webdriver.firefox.webdriver import WebDriver

class LoginE2ETest(StaticLiveServerTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.selenium = WebDriver()
        cls.selenium.implicitly_wait(10)

    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super().tearDownClass()

    def test_login(self):
        # ARRANGE: Открываем страницу логина
        self.selenium.get(f'{self.live_server_url}/login/')
        
        # ACT: Находим поля, вводим данные и нажимаем кнопку
        username_input = self.selenium.find_element_by_name("username")
        username_input.send_keys('myuser')
        password_input = self.selenium.find_element_by_name("password")
        password_input.send_keys('secret')
        self.selenium.find_element_by_xpath('//button[@type="submit"]').click()
        
        # ASSERT: Проверяем, что мы на главной странице
        self.assertEqual(self.selenium.current_url, f'{self.live_server_url}/')
```

---

## 6. Тестирование ИИ-компонентов

Тестирование ИИ — это не только проверка кода, но и проверка качества ответов модели.

### Тестирование промптов

**Цель:** Убедиться, что промпт генерирует ожидаемый результат в 80%+ случаев.

**Процесс:**
1.  **Создать датасет:** Подготовить 10-20 примеров входных данных для промпта.
2.  **Запустить прогоны:** Автоматически прогнать датасет через промпт и сохранить ответы LLM.
3.  **Оценить результаты:** Вручную или с помощью другой LLM оценить каждый ответ по шкале (например, от 1 до 5).
4.  **Итерация:** Если средний балл низкий, доработать промпт (добавить примеры, уточнить инструкцию) и повторить.

### Тестирование RAG-систем

**Цель:** Проверить, что система находит релевантные документы и генерирует ответ на их основе.

**Метрики:**
-   **`context_precision`:** Насколько релевантны найденные фрагменты?
-   **`faithfulness`:** Не галлюцинирует ли модель, основывается ли ответ на контексте?
-   **`answer_relevancy`:** Насколько ответ соответствует вопросу?

**Инструменты:** Фреймворк `ragas` позволяет автоматизировать расчёт этих метрик.

### Тестирование ИИ-агентов

**Цель:** Проверить, что агент правильно выбирает инструменты и достигает цели.

**Процесс:**
1.  **Определить сценарии:** Описать 5-10 типичных задач для агента.
2.  **Запустить симуляции:** Запустить агента для каждого сценария и записать последовательность вызова инструментов.
3.  **Проверить траекторию:** Убедиться, что последовательность вызовов логична и приводит к правильному результату.

---

## 7. Приложение: Промпты для генерации тестов в Cursor

### Промпт для генерации Unit-теста для модели

```
Режим: Code.

Задача: Написать unit-тест для модели `@core/models.py::Order`.

Нужно протестировать метод `is_shipped()`.

Следуй плейбуку:
1. Создай файл `tests/test_models.py`, если его нет.
2. Создай класс `OrderModelTest(TestCase)`.
3. Напиши метод `test_is_shipped_method`.
4. Внутри создай два объекта Order: один со статусом 'shipped', другой со статусом 'new'.
5. Вызови метод `is_shipped()` для каждого и проверь результат с помощью `self.assertTrue()` и `self.assertFalse()`.
6. Добавь полную GRACE-разметку в файл теста.
```

### Промпт для генерации Integration-теста для API

```
Режим: Code.

Задача: Написать integration-тест для API эндпоинта `GET /api/v1/products/{id}/`.

Следуй плейбуку:
1. Создай файл `tests/test_api.py`.
2. Создай класс `ProductAPITest(APITestCase)`.
3. В методе `setUp` создай один объект Product.
4. Напиши метод `test_retrieve_single_product`.
5. Внутри получи URL с помощью `reverse('product-detail', kwargs={'pk': self.product.pk})`.
6. Сделай GET-запрос.
7. Проверь, что статус ответа `status.HTTP_200_OK`.
8. Проверь, что `response.data['name']` соответствует имени созданного продукта.
```
