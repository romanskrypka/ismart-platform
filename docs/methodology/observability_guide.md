# Гайд по визуальной наблюдаемости (Visual Observability)

## Оглавление

1.  [Философия: От логов к визуальному контролю](#1-философия-от-логов-к-визуальному-контролю)
2.  [Уровень 1: Визуальный контроль в Django Admin](#2-уровень-1-визуальный-контроль-в-django-admin)
    -   [2.1. Модель данных для хранения трейсов](#21-модель-данных-для-хранения-трейсов)
    -   [2.2. Декоратор для записи шагов в БД](#22-декоратор-для-записи-шагов-в-бд)
    -   [2.3. Визуализация в Django Admin](#23-визуализация-в-django-admin)
3.  [Уровень 2: Django Debug Toolbar для контроля в реальном времени](#3-уровень-2-django-debug-toolbar-для-контроля-в-реальном-времени)
4.  [Уровень 3: Langfuse UI для визуализации ИИ-пайплайнов](#4-уровень-3-langfuse-ui-для-визуализации-ии-пайплайнов)
5.  [Уровень 4: Визуализация траекторий мультиагентных систем](#5-уровень-4-визуализация-траекторий-мультиагентных-систем)
6.  [Взаимодействие с ИИ: Промпты для Cursor](#6-взаимодействие-с-ии-промпты-для-cursor)
7.  [Приложение: Чек-лист визуального контроля](#7-приложение-чек-лист-визуального-контроля)

---

## 1. Философия: От логов к визуальному контролю

Проблема текстовых логов в том, что они остаются просто текстом в консоли. Вы не можете «увидеть» данные, сравнить их, проследить их трансформацию. Чтобы решить вашу задачу — **видеть глазами, что отдаётся и что получается**, — мы смещаем фокус с *логирования* на *визуальный контроль*.

Наша цель — построить **Панель управления процессом**, где каждый запуск бизнес-процесса или ИИ-пайплайна оставляет визуальный след, который можно изучить.

| Подход «Текстовые логи» | Подход «Визуальный контроль» |
|---|---|
| Данные в неструктурированном тексте | Данные в структурированных полях в UI |
| Нужно вручную искать `trace_id` в консоли | Все шаги сгруппированы в один трейс в админке |
| Сложно увидеть, как изменился JSON | Можно визуально сравнить поля «Вход» и «Выход» |
| **Результат:** вы читаете логи | **Результат:** вы **видите** данные |

---

## 2. Уровень 1: Визуальный контроль в Django Admin

Для стандартной бизнес-логики (не ИИ) мы создадим простую, но мощную систему отслеживания прямо в админке Django. Каждый сложный процесс будет записывать свою историю в базу данных, которую вы сможете просмотреть в удобном интерфейсе.

### 2.1. Модель данных для хранения трейсов

Создадим две модели: `PipelineTrace` для всего процесса и `PipelineStep` для каждого шага внутри него.

**`core/models.py`:**

```python
from django.db import models
import uuid

class PipelineTrace(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, help_text="Название всего процесса, например, 'Обработка заказа #123'")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Трейс: {self.name}"

class PipelineStep(models.Model):
    trace = models.ForeignKey(PipelineTrace, related_name='steps', on_delete=models.CASCADE)
    name = models.CharField(max_length=255, help_text="Название шага, например, 'Валидация данных'")
    input_data = models.JSONField(default=dict, blank=True, help_text="Данные на входе шага")
    output_data = models.JSONField(default=dict, blank=True, help_text="Данные на выходе шага")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Шаг: {self.name}"
```

### 2.2. Декоратор для записи шагов в БД

Теперь создадим декоратор, который будет автоматически создавать объекты `PipelineStep`.

**`core/decorators.py`:**

```python
from functools import wraps
from .models import PipelineStep

def record_step(step_name):
    def decorator(func):
        @wraps(func)
        def wrapper(trace, *args, **kwargs):
            # Первым аргументом в функцию всегда передаётся объект PipelineTrace
            input_data = {"args": args, "kwargs": kwargs}
            
            result = func(trace, *args, **kwargs)
            
            PipelineStep.objects.create(
                trace=trace,
                name=step_name,
                input_data=input_data,
                output_data=result
            )
            return result
        return wrapper
    return decorator
```

**Пример использования в `services.py`:**

```python
from .models import PipelineTrace
from .decorators import record_step

class OrderService:
    def process_new_order(self, order_data):
        # 1. Создаём основной трейс для всего процесса
        trace = PipelineTrace.objects.create(name=f"Обработка заказа #{order_data.get('id')}")
        
        # 2. Вызываем шаги, передавая им trace
        validated_data = self.validate_order(trace, order_data)
        payment_result = self.process_payment(trace, validated_data)
        return payment_result

    @record_step("Шаг 1: Валидация заказа")
    def validate_order(self, trace, data):
        # ... логика валидации ...
        return {"validated": True, "data": data}

    @record_step("Шаг 2: Обработка платежа")
    def process_payment(self, trace, data):
        # ... логика платежа ...
        return {"status": "success", "transaction_id": "xyz-123"}
```

### 2.3. Визуализация в Django Admin

Чтобы это было удобно смотреть, настроим админку.

**`core/admin.py`:**

```python
from django.contrib import admin
from .models import PipelineTrace, PipelineStep
from django.utils.html import format_html
import json

class PipelineStepInline(admin.TabularInline):
    model = PipelineStep
    fields = ('name', 'formatted_input', 'formatted_output', 'created_at')
    readonly_fields = fields
    can_delete = False
    extra = 0

    def formatted_input(self, obj):
        return format_html("<pre>{}</pre>", json.dumps(obj.input_data, indent=2, ensure_ascii=False))
    formatted_input.short_description = "Входные данные"

    def formatted_output(self, obj):
        return format_html("<pre>{}</pre>", json.dumps(obj.output_data, indent=2, ensure_ascii=False))
    formatted_output.short_description = "Выходные данные"

@admin.register(PipelineTrace)
class PipelineTraceAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    inlines = [PipelineStepInline]
    readonly_fields = ('id', 'name', 'created_at')
```

**Результат:** Теперь в админке вы можете зайти в любой `PipelineTrace` и увидеть все его шаги, а на каждом шаге — **визуально сравнить JSON-объекты на входе и выходе**.

---

## 3. Уровень 2: Django Debug Toolbar для контроля в реальном времени

Для отладки в процессе разработки нет ничего лучше **Django Debug Toolbar**. Эта панель появляется на каждой странице в режиме `DEBUG=True` и даёт мгновенный визуальный срез всего, что произошло при обработке запроса.

**Что вы можете увидеть глазами:**

-   **SQL-запросы:** Все запросы к базе данных, их количество и время выполнения. Вы сразу видите медленные запросы.
-   **Request/Response:** Все заголовки, GET/POST параметры, данные сессии и куки.
-   **Templates:** Какие шаблоны были использованы и с каким контекстом.
-   **Cache:** Какие данные были взяты из кэша, а какие нет.

Это идеальный инструмент для локальной разработки, чтобы «видеть» работу стандартных компонентов Django без необходимости писать специальный код.

---

## 4. Уровень 3: Langfuse UI для визуализации ИИ-пайплайнов

Когда в дело вступают LLM, RAG и другие ИИ-компоненты, нам нужен более специализированный инструмент. **Langfuse** — это open-source платформа, которая предоставляет именно тот **визуальный интерфейс**, который вам нужен для контроля над ИИ.

Забудьте про логи в консоли. Каждый вызов LLM или RAG-цепочки превращается в интерактивный трейс в веб-интерфейсе Langfuse.

**Что вы видите глазами в Langfuse UI:**

-   **Дерево вызовов:** Слева вы видите полную иерархию вашего пайплайна. Каждый шаг (генерация, поиск, эмбеддинг) — это отдельный узел. Вы сразу видите последовательность и вложенность операций.
-   **Вход и Выход:** Справа, для каждого шага, вы видите **фактические данные**. Для шага генерации это будет полный промпт на входе и полный ответ LLM на выходе. Для шага поиска — поисковый запрос и найденные фрагменты.
-   **Метаданные и метрики:** Вы видите, какая модель использовалась, сколько токенов было потрачено, какова стоимость и задержка.

**Пример визуального трейса в Langfuse:**

*Ниже представлен скриншот, иллюстрирующий, как выглядит трейс RAG-пайплайна в Langfuse. Слева — дерево вызовов, справа — конкретные данные входа и выхода для шага генерации.* 

<img src="/home/ubuntu/upload/search_images/Ne4Q0bp96j4O.png" alt="Langfuse Trace View" width="800"/>

**Как этого достичь — декоратор `@observe`:**

Инструментация кода минимальна. Вместо нашего `@record_step` мы используем декоратор `@observe` от Langfuse.

```python
from langfuse import Langfuse
from langfuse.decorators import observe

langfuse = Langfuse()

@observe()
def process_rag_query(user_query):
    search_query = generate_search_query(user_query)
    context = find_relevant_chunks(search_query)
    answer = answer_with_context(user_query, context)
    return answer

@observe(as_type="generation")
def answer_with_context(query, context):
    # ... вызов LLM с промптом, содержащим query и context ...
    return llm_response

# ... и так далее для других функций
```

После запуска этого кода вы заходите в UI Langfuse и видите полный визуальный отчёт по каждому вызову `process_rag_query`.

---

## 5. Уровень 4: Визуализация траекторий мультиагентных систем

Мультиагентные системы — самый сложный случай для отладки. Агенты могут вызывать друг друга, использовать инструменты, ошибаться и исправляться. Понять их логику по текстовым логам практически невозможно.

Langfuse решает и эту проблему, позволяя **визуализировать граф рассуждений** агента.

**Что вы видите глазами в Langfuse UI для агентов:**

-   **Граф выполнения:** Вы видите схему, показывающую, как агент двигался от стартовой точки к результату, какие инструменты он вызывал и в какой последовательности.
-   **Траектория мыслей:** Для каждого шага в графе вы можете посмотреть, о чём «думал» агент, какой промпт он сформировал для себя или для вызова другого агента/инструмента.
-   **Вход/Выход каждого шага:** Как и в обычном пайплайне, вы видите конкретные данные, с которыми оперировал агент на каждом шаге.

**Пример визуализации графа агента в Langfuse:**

*На скриншоте ниже показан граф выполнения агента (Node display) и детали одного из шагов. Вы можете визуально проследить путь агента: `start` -> `chatbot` -> `tools` -> `agent` -> `end`.* 

<img src="/home/ubuntu/upload/search_images/PbEFnpBr1qoE.png" alt="Langfuse Agent Graph View" width="800"/>

Этот уровень визуализации позволяет вам не просто видеть результат, а понимать **почему** агент пришёл именно к такому результату, находя ошибки в его логике или инструментах.

---

## 6. Взаимодействие с ИИ: Промпты для Cursor

Чтобы ИИ-ассистент внедрял эти практики визуального контроля, используйте следующие промпты.

### Промпт 1: Создание системы трейсинга в Django Admin

> Создай систему визуального трейсинга в Django. 
> 1.  В файле `core/models.py` создай две модели: `PipelineTrace` (с полями `id`, `name`, `created_at`) и `PipelineStep` (с полями `trace` (FK к PipelineTrace), `name`, `input_data` (JSON), `output_data` (JSON), `created_at`).
> 2.  В файле `core/admin.py` создай `PipelineStepInline` (TabularInline) для отображения шагов внутри `PipelineTraceAdmin`. Используй `format_html` и `json.dumps` для красивого отображения JSON-полей `input_data` и `output_data` прямо в админке.
> 3.  Зарегистрируй `PipelineTraceAdmin`.

### Промпт 2: Создание и применение декоратора `@record_step`

> 1.  В файле `core/decorators.py` создай декоратор `@record_step(step_name)`. Он должен принимать имя шага, а сама декорируемая функция должна принимать первым аргументом объект `trace` (экземпляр `PipelineTrace`).
> 2.  Декоратор должен создавать объект `PipelineStep`, записывая в него `trace`, `step_name`, входные аргументы функции в `input_data` и результат функции в `output_data`.
> 3.  Теперь открой `services.py` и примени этот декоратор ко всем методам сервиса `OrderService`, кроме `process_new_order`. Метод `process_new_order` должен создавать `PipelineTrace` и передавать его в вызываемые методы.

### Промпт 3: Инструментация ИИ-пайплайна с Langfuse для визуализации

> Мне нужно визуализировать работу RAG-пайплайна в Langfuse UI. Возьми функцию `process_rag_query` и сделай следующее:
> 1.  Разбей её на 3 отдельные функции: `generate_search_query`, `find_relevant_chunks`, `answer_with_context`.
> 2.  Оберни каждую из этих 4 функций (включая родительскую) декоратором `@observe` из библиотеки `langfuse`.
> 3.  Убедись, что входы и выходы каждой функции — это простые типы данных (строки, словари), чтобы они корректно отобразились в Langfuse UI.

---

## 7. Приложение: Чек-лист визуального контроля

Используйте этот чек-лист, чтобы убедиться, что вы можете «видеть» работу вашей системы на всех уровнях.

| Уровень | Контроль | Статус (Да/Нет) |
|---|---|:---:|
| **Локальная разработка** | **Django Debug Toolbar** установлен и активен на страницах? | ☐ |
| | Я вижу SQL-запросы и данные запроса/ответа в панели? | ☐ |
| **Бизнес-логика** | Модели `PipelineTrace` и `PipelineStep` созданы и смигрированы? | ☐ |
| | Я вижу трейсы процессов в **Django Admin**? | ☐ |
| | Внутри трейса я вижу шаги с отформатированными **входными и выходными JSON**? | ☐ |
| | Все ключевые многошаговые сервисы инструментированы декоратором `@record_step`? | ☐ |
| **ИИ-пайплайны (RAG, LLM)** | **Langfuse** установлен и настроен (переменные окружения)? | ☐ |
| | Я могу зайти в **Langfuse UI** и вижу свой проект? | ☐ |
| | Все функции, вызывающие LLM, и их родительские функции обёрнуты в `@observe`? | ☐ |
| | В Langfuse UI я вижу **дерево вызовов** для моих ИИ-пайплайнов? | ☐ |
| | Для каждого шага я вижу **фактический промпт (вход)** и **ответ LLM (выход)**? | ☐ |
| **Мультиагентные системы** | Для каждого агента и его инструментов настроена интеграция с Langfuse? | ☐ |
| | В Langfuse UI я вижу **граф выполнения** агента? | ☐ |
| | Я могу кликнуть на узел графа и увидеть **мысли агента** и данные, с которыми он работал? | ☐ |
