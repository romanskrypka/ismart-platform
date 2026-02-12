# Гайд по сквозной наблюдаемости (Observability) в ИИ-системах

## Оглавление

1.  [Философия: От «чёрного ящика» к «прозрачной коробке»](#1-философия-от-чёрного-ящика-к-прозрачной-коробке)
2.  [Архитектурный паттерн: Pipeline Tap (Точка съёма)](#2-архитектурный-паттерн-pipeline-tap-точка-съёма)
3.  [Уровень 1: Наблюдаемость в Django через логирование](#3-уровень-1-наблюдаемость-в-django-через-логирование)
    -   [3.1. Настройка структурированного логирования](#31-настройка-структурированного-логирования)
    -   [3.2. Middleware для трассировки запросов](#32-middleware-для-трассировки-запросов)
    -   [3.3. Декоратор для логирования функций](#33-декоратор-для-логирования-функций)
4.  [Уровень 2: Наблюдаемость ИИ-пайплайнов с Langfuse](#4-уровень-2-наблюдаемость-ии-пайплайнов-с-langfuse)
5.  [Уровень 3: Наблюдаемость мультиагентных систем](#5-уровень-3-наблюдаемость-мультиагентных-систем)
6.  [Взаимодействие с ИИ: Промпты для Cursor](#6-взаимодействие-с-ии-промпты-для-cursor)
7.  [Приложение: Правило для `.cursorrules`](#7-приложение-правило-для-cursorrules)

---

## 1. Философия: От «чёрного ящика» к «прозрачной коробке»

Большие системы, особенно с ИИ-компонентами, часто превращаются в «чёрный ящик». Вы подаёте данные на вход, получаете результат на выходе, но что происходит внутри — загадка. Качество результата падает, а найти причину невозможно. Проблема в том, что вы теряете **наблюдаемость** — способность понимать внутреннее состояние системы по её внешним выходам.

Наша цель — превратить «чёрный ящик» в **«прозрачную коробку» (Glassbox)**. Мы должны иметь возможность в любой момент времени увидеть, как данные преобразуются на каждом шаге, от первоначального запроса до финального ответа. Это достигается через **сквозную трассировку** (end-to-end tracing).

| Подход «Чёрный ящик» | Подход «Прозрачная коробка» |
|---|---|
| Логируется только ошибка в конце | Логируется **вход и выход каждого шага** |
| Непонятно, на каком этапе исказились данные | Видна вся цепочка преобразований |
| Отладка занимает дни | Отладка занимает минуты |
| Низкое доверие к системе | Высокое доверие и полный контроль |

---

## 2. Архитектурный паттерн: Pipeline Tap (Точка съёма)

Представьте ваш процесс обработки данных как конвейер (pipeline). Чтобы понять, что происходит на конвейере, мы устанавливаем «точки съёма» (Taps) после каждого важного шага. Каждая такая точка — это функция или декоратор, который перехватывает данные, логирует их и передаёт дальше без изменений.

**Пример пайплайна RAG (Retrieval-Augmented Generation):**

`Пользовательский запрос` → **[TAP 1]** → `Поисковый запрос к БД` → **[TAP 2]** → `Найденные фрагменты (контекст)` → **[TAP 3]** → `Промпт для LLM` → **[TAP 4]** → `Ответ от LLM` → **[TAP 5]** → `Финальный ответ пользователю`

Каждый `[TAP]` — это место, где мы сохраняем входные и выходные данные. Это позволяет нам в любой момент восстановить всю цепочку и понять, где произошла ошибка. Например, если финальный ответ нерелевантен, мы можем посмотреть на `[TAP 3]` и увидеть, что в контекст попали не те фрагменты, а затем на `[TAP 2]`, чтобы понять, почему поиск отработал неправильно.

---

## 3. Уровень 1: Наблюдаемость в Django через логирование

Для не-ИИ частей системы (стандартные CRUD, бизнес-логика) можно реализовать наблюдаемость с помощью встроенных инструментов Django и Python.

### 3.1. Настройка структурированного логирования

Первый шаг — настроить логирование так, чтобы оно было машиночитаемым (например, в JSON) и содержало уникальный ID для каждого запроса.

**`settings.py`:**

```python
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(name)s %(levelname)s %(message)s %(trace_id)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}
```

### 3.2. Middleware для трассировки запросов

Создадим Middleware, которое будет генерировать `trace_id` для каждого входящего запроса и добавлять его в логи.

**`core/middleware.py`:**

```python
import uuid
import logging

class RequestTracingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        trace_id = str(uuid.uuid4())
        request.trace_id = trace_id
        
        logger = logging.getLogger(__name__)
        logger.info(
            f"Request started: {request.method} {request.path}",
            extra={
                "trace_id": trace_id,
                "request_input": request.GET or request.POST
            }
        )
        
        response = self.get_response(request)
        
        logger.info(
            f"Request finished: {response.status_code}",
            extra={
                "trace_id": trace_id,
                "response_output": response.content.decode("utf-8", "ignore")[:500]
            }
        )
        
        return response
```

### 3.3. Декоратор для логирования функций

Создадим декоратор, который будет работать как `Pipeline Tap` для любой функции, логируя её входные аргументы и выходной результат.

**`core/decorators.py`:**

```python
import logging
from functools import wraps

def log_pipeline_step(func):
    """Декоратор для логирования входа и выхода функции."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        logger = logging.getLogger(func.__module__)
        
        # Пытаемся достать trace_id из request, если он есть
        trace_id = "N/A"
        if args and hasattr(args[0], 'trace_id'):
            trace_id = args[0].trace_id

        logger.info(
            f"Pipeline step started: {func.__name__}",
            extra={
                "trace_id": trace_id,
                "step_input": {"args": args, "kwargs": kwargs}
            }
        )
        
        result = func(*args, **kwargs)
        
        logger.info(
            f"Pipeline step finished: {func.__name__}",
            extra={
                "trace_id": trace_id,
                "step_output": result
            }
        )
        return result
    return wrapper
```

**Пример использования в `services.py`:**

```python
from .decorators import log_pipeline_step

@log_pipeline_step
def process_order(order_data):
    # ... какая-то логика ...
    processed_data = order_data.copy()
    processed_data["status"] = "processed"
    return processed_data
```
_# 4. Уровень 2: Наблюдаемость ИИ-пайплайнов с Langfuse

Стандартного логирования недостаточно для сложных ИИ-пайплайнов (RAG, цепочки вызовов LLM). Здесь нам нужен специализированный инструмент, который умеет строить деревья вызовов (трейсы). Мы будем использовать **Langfuse** — open-source платформу для наблюдаемости LLM-приложений. Она позволяет визуализировать всю цепочку, включая вызовы моделей, и анализировать задержки и стоимость.

**Как это работает:**

1.  **Self-hosted Langfuse:** Вы запускаете Langfuse локально через Docker. Это даёт полный контроль над данными.
2.  **SDK:** В Django-проект добавляется `langfuse` SDK.
3.  **Декоратор `@observe`:** Вы оборачиваете каждую функцию в вашем ИИ-пайплайне этим декоратором. Он автоматически перехватывает вход/выход, время выполнения, ошибки и отправляет в Langfuse.

**Пример RAG-пайплайна с Langfuse:**

```python
from langfuse import observe
from langfuse.client import Langfuse

langfuse = Langfuse() # Инициализация клиента

@observe(name="rag-pipeline")
def handle_user_query(query: str):
    search_query = generate_search_query(query)
    context = find_relevant_chunks(search_query)
    llm_response = answer_with_context(query, context)
    return llm_response

@observe(name="step-1-generate-search-query")
def generate_search_query(query: str) -> str:
    # Логика преобразования запроса пользователя в поисковый запрос
    return f"search for {query}"

@observe(name="step-2-find-relevant-chunks")
def find_relevant_chunks(search_query: str) -> list:
    # Логика поиска в векторной БД
    return ["chunk 1...", "chunk 2..."]

@observe(name="step-3-answer-with-context", as_type="generation")
def answer_with_context(query: str, context: list) -> str:
    # Вызов LLM с промптом, включающим query и context
    # as_type="generation" говорит Langfuse, что это вызов LLM
    # для отслеживания токенов и стоимости
    return "Final answer from LLM."

# Запуск
handle_user_query("What is observability?")
```

**Результат в Langfuse UI:**

Вы увидите красивое дерево (трейс), где `rag-pipeline` — это корневой элемент, а вложенные вызовы — его дочерние элементы. Вы сможете кликнуть на каждый шаг и увидеть его входные и выходные данные.

![Пример трейса в Langfuse](https://langfuse.com/images/docs/trace-complex.png)

---

## 5. Уровень 3: Наблюдаемость мультиагентных систем

Мультиагентные системы — самый сложный случай для отладки. Агенты вызывают друг друга, используют инструменты, формируют «мысли». Здесь критически важно видеть не просто вход/выход, а всю **траекторию рассуждений** каждого агента.

Мы можем расширить наш подход с Langfuse, используя вложенные трейсы для каждого агента и его инструментов.

**Пример с CrewAI и Langfuse:**

Представим Crew из двух агентов: `Researcher` и `Writer`.

```python
from langfuse import observe
from crewai import Agent, Task, Crew

# Оборачиваем выполнение задачи в декоратор @observe
@observe(name="crew-execution")
def run_crew():
    # ... определение агентов и задач ...

    researcher = Agent(
        role='Senior Researcher',
        goal='Uncover groundbreaking technologies',
        # ...
    )

    writer = Agent(
        role='Content Strategist',
        goal='Craft compelling content on tech advancements',
        # ...
    )

    task1 = Task(description='Investigate the latest AI trends', agent=researcher)
    task2 = Task(description='Write a blog post on AI trends', agent=writer)

    crew = Crew(agents=[researcher, writer], tasks=[task1, task2])
    result = crew.kickoff()
    return result

# Теперь нам нужно инструментировать внутренности CrewAI или агентов
# Это можно сделать, обернув их методы или используя callback-и

# Пример с кастомным агентом, который использует Langfuse
class TracedAgent(Agent):
    @observe(name="agent-execution")
    def execute_task(self, task, context):
        # Логируем мысли агента перед вызовом LLM
        thought_process = f"I need to accomplish: {task.description}. Context: {context}"
        langfuse.span(name="thought", input=thought_process)

        # Выполнение задачи
        result = super().execute_task(task, context)

        return result
```

**Что мы получим в Langfuse:**

-   **Верхнеуровневый трейс:** `crew-execution`.
-   **Вложенные спаны:** `agent-execution` для каждого агента.
-   **Еще более глубокие спаны:** `thought` (мысли агента), `tool-call` (вызов инструмента), `llm-generation` (вызов LLM).

Это позволяет нам полностью реконструировать, что делал каждый агент, о чем он «думал», какие инструменты использовал и что ему ответила модель на каждом шаге. Это превращает отладку из гадания в анализ логов.

---

## 6. Взаимодействие с ИИ: Промпты для Cursor

Чтобы ИИ-ассистент (Cursor) следовал этим принципам, ему нужно давать чёткие инструкции. Используйте следующие промпты:

### Промпт 1: Создание декоратора для логирования

> Создай в файле `core/decorators.py` декоратор `@log_pipeline_step`. Он должен:
> 1.  Принимать на вход любую функцию.
> 2.  Перед вызовом функции логировать её имя и все переданные аргументы (`args` и `kwargs`) с уровнем `INFO`.
> 3.  В `extra`-параметры лога добавлять `trace_id`, который он должен попытаться извлечь из первого аргумента функции (если это объект `request`).
> 4.  После вызова функции логировать её имя и возвращаемый результат с уровнем `INFO` и тем же `trace_id`.
> 5.  Использовать стандартный `logging` и `functools.wraps`.

### Промпт 2: Применение декоратора к сервисному слою

> Проанализируй файл `services.py`. Примени декоратор `@log_pipeline_step` ко всем публичным методам (тем, что не начинаются с `_`) в каждом классе этого файла. Импортируй декоратор из `core.decorators`.

### Промпт 3: Инструментация ИИ-пайплайна с Langfuse

> У меня есть функция `process_rag_query`, которая выполняет RAG-пайплайн. Мне нужно инструментировать её с помощью Langfuse для полной наблюдаемости.
> 1.  Разбей функцию `process_rag_query` на 3 отдельные функции-шага:
>     -   `generate_search_query(query)`
>     -   `find_relevant_chunks(search_query)`
>     -   `answer_with_context(query, context)`
> 2.  Оберни каждую из этих 4 функций (включая родительскую `process_rag_query`) декоратором `@observe` из библиотеки `langfuse`.
> 3.  Для функции `answer_with_context` добавь в декоратор параметр `as_type="generation"`.
> 4.  В начале файла импортируй `observe` и создай экземпляр клиента `langfuse = Langfuse()`.

### Промпт 4: Требование наблюдаемости при рефакторинге

> Рефакторизуй этот код. Вынеси бизнес-логику из view в отдельный сервисный класс `OrderService` в файле `services.py`. Каждый публичный метод в новом сервисе должен быть обёрнут в декоратор `@log_pipeline_step` для обеспечения наблюдаемости.

---

## 7. Приложение: Правило для `.cursorrules`

Чтобы закрепить практику наблюдаемости на уровне проекта, добавьте следующее правило в ваш файл `.cursorrules`.

```yaml
- name: EnforceObservability
  description: "Все публичные методы в сервисах и агентах должны быть декорированы для логирования."
  rule: "Каждый публичный метод (не начинающийся с '_') в любом файле, находящемся в директориях `services/` или `agents/`, ДОЛЖЕН иметь декоратор `@log_pipeline_step` или `@observe`."
  good_example: |
    # services/payment_service.py
    from core.decorators import log_pipeline_step

    class PaymentService:
        @log_pipeline_step
        def process_payment(self, amount, currency):
            # ... logic ...
            return {"status": "success"}

  bad_example: |
    # services/payment_service.py

    class PaymentService:
        def process_payment(self, amount, currency): # Отсутствует декоратор
            # ... logic ...
            return {"status": "success"}

  why_is_it_important: "Без этого правила мы теряем наблюдаемость. Мы не можем отследить, какие данные вошли в функцию и какие вышли, что делает отладку почти невозможной. Это правило гарантирует, что каждый критический шаг бизнес-логики оставляет след в логах."
```

Это правило заставит ИИ-ассистента автоматически добавлять декораторы ко всему новому коду в указанных директориях, поддерживая систему «прозрачной» по мере её роста.
