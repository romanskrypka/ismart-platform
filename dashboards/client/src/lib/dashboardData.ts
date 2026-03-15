export interface Section {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'code' | 'table' | 'quiz' | 'diagram' | 'comparison';
  codeLanguage?: string;
  tableData?: { headers: string[]; rows: string[][] };
  quizData?: { question: string; options: string[]; correctIndex: number; explanation: string };
}

export interface Dashboard {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  heroImage: string;
  moduleNumber: number;
  sections: Section[];
}

const HERO_IMAGES = {
  aiConcepts: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663157817553/Pc5VksQAQSKYP2FnC37sA8/hero-ai-concepts-ChCmVB8eS3A7xwbvnCnN4c.webp',
  localLlm: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663157817553/Pc5VksQAQSKYP2FnC37sA8/hero-local-llm-3Ko2v2gQQSSNE7Nz3yassF.webp',
  rag: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663157817553/Pc5VksQAQSKYP2FnC37sA8/hero-rag-3mfCxoQRb6hDHWK9QSL6Nf.webp',
  text2sql: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663157817553/Pc5VksQAQSKYP2FnC37sA8/hero-text2sql-LJdYhjRmQAZ3o22Frj4E5o.webp',
  finetuning: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663157817553/Pc5VksQAQSKYP2FnC37sA8/hero-finetuning-mk2Z3LbjRP433iZeZGhASb.webp',
};

export const dashboards: Dashboard[] = [
  {
    id: 'ai-concepts',
    slug: 'ai-concepts',
    title: 'Основы ИИ',
    subtitle: 'От машинного обучения до трансформеров',
    description: 'Фундаментальные концепции искусственного интеллекта: ML, DL, NLP, архитектура трансформеров, генеративный ИИ и промпт-инжиниринг.',
    color: '#ef4444',
    colorClass: 'text-coral',
    bgClass: 'bg-coral',
    borderClass: 'border-coral',
    heroImage: HERO_IMAGES.aiConcepts,
    moduleNumber: 1,
    sections: [
      {
        id: 'ai-definition',
        title: 'Искусственный интеллект (ИИ)',
        type: 'text',
        content: 'Искусственный интеллект (AI) — это широчайшая область компьютерных наук, целью которой является создание систем, способных выполнять задачи, обычно требующие человеческого интеллекта: визуальное восприятие, распознавание речи, принятие решений и перевод между языками.\n\nИИ можно рассматривать как «большой зонтик», под которым скрываются все остальные концепции. Традиционный ИИ фокусируется на анализе данных, поиске паттернов и прогнозировании — например, алгоритмы предсказания погоды, классификации спама или рекомендации фильмов.',
      },
      {
        id: 'ml-definition',
        title: 'Машинное обучение (ML)',
        type: 'text',
        content: 'Машинное обучение (Machine Learning) — подмножество ИИ. Вместо жёстких правил (if-then) ML использует алгоритмы для обучения на данных. Система «учится» распознавать закономерности и делать прогнозы на основе предоставленных примеров.\n\nТри основные парадигмы:\n• Обучение с учителем (Supervised) — модель обучается на размеченных данных\n• Обучение без учителя (Unsupervised) — модель ищет скрытые структуры\n• Обучение с подкреплением (Reinforcement) — модель учится методом проб и ошибок',
      },
      {
        id: 'dl-definition',
        title: 'Глубокое обучение (DL)',
        type: 'text',
        content: 'Глубокое обучение (Deep Learning) — подмножество ML, основанное на нейронных сетях с множеством слоёв. Эти слои позволяют модели постепенно извлекать всё более сложные признаки из необработанных данных.\n\nВ отличие от классического ML, где инженеру приходится вручную отбирать признаки (feature engineering), DL-модели делают это самостоятельно. Именно глубокое обучение стало катализатором прорывов в распознавании изображений, автономном вождении и NLP.',
      },
      {
        id: 'ai-hierarchy',
        title: 'Иерархия: ИИ → ML → DL',
        type: 'comparison',
        content: 'Каждая следующая область является подмножеством предыдущей. ИИ — самый широкий зонтик, ML — его подмножество, DL — подмножество ML.',
        tableData: {
          headers: ['Уровень', 'Область', 'Ключевая идея', 'Пример'],
          rows: [
            ['1', 'Искусственный интеллект', 'Имитация человеческого интеллекта', 'Шахматный движок, голосовой ассистент'],
            ['2', 'Машинное обучение', 'Обучение на данных без явного программирования', 'Спам-фильтр, рекомендации Netflix'],
            ['3', 'Глубокое обучение', 'Нейросети с множеством слоёв', 'GPT, распознавание лиц, DALL-E'],
          ],
        },
      },
      {
        id: 'transformer',
        title: 'Архитектура трансформера',
        type: 'text',
        content: 'В 2017 году статья «Attention Is All You Need» представила архитектуру Трансформер — нейронную сеть, которая отказалась от последовательной обработки данных (как в RNN) в пользу параллельной.\n\nМеханизм самовнимания (Self-Attention) — сердце трансформера. Для каждого слова вычисляются три вектора:\n• Query (Q) — что это слово ищет в контексте?\n• Key (K) — что содержит это слово?\n• Value (V) — какую смысловую нагрузку оно несёт?\n\nОригинальный трансформер состоит из кодировщика (Encoder, как BERT) и декодировщика (Decoder, как GPT).',
      },
      {
        id: 'genai-categories',
        title: 'Категории генеративного ИИ',
        type: 'table',
        content: 'Генеративный ИИ классифицируется по типу создаваемого контента:',
        tableData: {
          headers: ['Категория', 'Описание', 'Примеры'],
          rows: [
            ['Текст → Текст', 'LLM: статьи, переводы, код', 'ChatGPT, Claude, LLaMA'],
            ['Текст → Изображение', 'Диффузионные модели', 'Midjourney, DALL-E, Stable Diffusion'],
            ['Текст → Аудио', 'Генерация речи и музыки', 'Suno, ElevenLabs'],
            ['Текст → Видео', 'Создание анимаций и фильмов', 'Sora, Runway'],
            ['Текст → 3D', 'Трёхмерные модели', 'Point-E, DreamFusion'],
          ],
        },
      },
      {
        id: 'genai-quiz',
        title: 'Проверка знаний: Генеративный ИИ',
        type: 'quiz',
        content: '',
        quizData: {
          question: 'Что из перечисленного НЕ относится к генеративному ИИ?',
          options: [
            'Создание изображений по текстовому описанию (DALL-E)',
            'Классификация писем на спам и не-спам',
            'Написание кода по описанию задачи (ChatGPT)',
            'Генерация музыки (Suno)',
          ],
          correctIndex: 1,
          explanation: 'Классификация спама — это задача предиктивного/аналитического ИИ. Генеративный ИИ создаёт новый контент, а не классифицирует существующий.',
        },
      },
      {
        id: 'llm-training',
        title: 'Обучение LLM: три этапа',
        type: 'table',
        content: 'Процесс создания LLM состоит из трёх основных этапов:',
        tableData: {
          headers: ['Этап', 'Название', 'Описание', 'Результат'],
          rows: [
            ['1', 'Pre-training', 'Модель «читает» огромную часть интернета в режиме самообучения', 'Базовая модель (знает язык, но не умеет вести диалог)'],
            ['2', 'Fine-tuning (SFT)', 'Обучение на парах «инструкция — правильный ответ»', 'Модель-ассистент (умеет отвечать на вопросы)'],
            ['3', 'Alignment (RLHF)', 'Обучение с подкреплением на основе отзывов людей', 'Безопасная, вежливая модель'],
          ],
        },
      },
      {
        id: 'prompt-engineering',
        title: 'Промпт-инжиниринг',
        type: 'comparison',
        content: 'Основные техники составления запросов к языковым моделям:',
        tableData: {
          headers: ['Техника', 'Описание', 'Когда использовать'],
          rows: [
            ['Zero-shot', 'Прямой запрос без примеров', 'Простые задачи: перевод, определения'],
            ['Few-shot', 'Несколько примеров перед заданием', 'Нужен конкретный формат ответа'],
            ['Chain of Thought', '«Давай думать шаг за шагом»', 'Логические и математические задачи'],
            ['System Prompt', 'Глобальная роль и ограничения', 'Задание контекста и стиля ответов'],
          ],
        },
      },
      {
        id: 'prompt-quiz',
        title: 'Проверка знаний: Промпт-инжиниринг',
        type: 'quiz',
        content: '',
        quizData: {
          question: 'Какая техника промпт-инжиниринга заставляет модель разбить задачу на промежуточные шаги?',
          options: [
            'Zero-shot prompting',
            'Few-shot prompting',
            'Chain of Thought (CoT)',
            'System Prompt',
          ],
          correctIndex: 2,
          explanation: 'Chain of Thought (CoT) заставляет модель «думать шаг за шагом», что кардинально снижает вероятность ошибки в логических и математических задачах.',
        },
      },
    ],
  },
  {
    id: 'local-llm',
    slug: 'local-llm',
    title: 'Локальные LLM',
    subtitle: 'Развёртывание и настройка на своём оборудовании',
    description: 'Полное руководство по установке Ollama, настройке моделей, GUI-клиентам, Python-среде, аппаратному ускорению и созданию ИИ-агентов.',
    color: '#10b981',
    colorClass: 'text-emerald',
    bgClass: 'bg-emerald',
    borderClass: 'border-emerald',
    heroImage: HERO_IMAGES.localLlm,
    moduleNumber: 2,
    sections: [
      {
        id: 'tools-comparison',
        title: 'Инструменты для локального запуска LLM',
        type: 'table',
        content: 'Экосистема инструментов для локального запуска LLM в 2026 году:',
        tableData: {
          headers: ['Инструмент', 'Описание', 'Преимущества', 'Недостатки'],
          rows: [
            ['Ollama', 'CLI и API-сервер', 'Простая установка, богатая библиотека, OpenAI-совместимый API', 'Нет встроенного GUI'],
            ['LM Studio', 'Десктопное приложение с GUI', 'Удобный поиск моделей из HuggingFace, встроенный сервер', 'Проприетарное ПО'],
            ['llama.cpp', 'Низкоуровневая C/C++ библиотека', 'Максимальная производительность, GGUF-квантование', 'Высокий порог входа'],
            ['Jan AI', 'Open-source десктоп', 'Полностью открытый код, локальное хранение', 'Меньше функций'],
            ['AnythingLLM', 'Приложение для RAG', 'Загрузка документов, многопользовательский режим', 'Требует настройки БД'],
          ],
        },
      },
      {
        id: 'ollama-install',
        title: 'Установка Ollama',
        type: 'code',
        codeLanguage: 'bash',
        content: '# macOS (через Homebrew)\nbrew install ollama\n\n# Linux (официальный скрипт)\ncurl -fsSL https://ollama.com/install.sh | sh\n\n# Windows — скачайте OllamaSetup.exe с ollama.com',
      },
      {
        id: 'ollama-commands',
        title: 'Основные команды Ollama CLI',
        type: 'table',
        content: 'Управление моделями через командную строку:',
        tableData: {
          headers: ['Команда', 'Описание', 'Пример'],
          rows: [
            ['ollama run', 'Запуск модели (скачает при необходимости)', 'ollama run llama3.2'],
            ['ollama pull', 'Скачивание модели без запуска', 'ollama pull mistral'],
            ['ollama list', 'Список установленных моделей', 'ollama list'],
            ['ollama ps', 'Активные модели в памяти', 'ollama ps'],
            ['ollama rm', 'Удаление модели', 'ollama rm llama3.2'],
            ['ollama serve', 'Запуск API-сервера', 'ollama serve'],
          ],
        },
      },
      {
        id: 'ollama-env',
        title: 'Переменные окружения Ollama',
        type: 'table',
        content: 'Настройка поведения Ollama через переменные среды:',
        tableData: {
          headers: ['Переменная', 'Описание', 'Значение по умолчанию'],
          rows: [
            ['OLLAMA_HOST', 'Адрес и порт API-сервера', '127.0.0.1:11434'],
            ['OLLAMA_MODELS', 'Путь хранения моделей', '~/.ollama/models'],
            ['OLLAMA_KEEP_ALIVE', 'Время удержания модели в памяти', '5m'],
            ['OLLAMA_NUM_PARALLEL', 'Количество параллельных запросов', '1'],
            ['OLLAMA_MAX_LOADED_MODELS', 'Макс. моделей в памяти одновременно', '1'],
          ],
        },
      },
      {
        id: 'first-app',
        title: 'Первое приложение: консольный ассистент',
        type: 'code',
        codeLanguage: 'python',
        content: `import ollama\n\nmessages = [\n    {"role": "system", "content": "Ты — полезный ассистент. Отвечай кратко и по делу."},\n]\n\nprint("Консольный ассистент (введите 'exit' для выхода)")\nwhile True:\n    user_input = input("\\nВы: ")\n    if user_input.lower() == "exit":\n        break\n    messages.append({"role": "user", "content": user_input})\n    response = ollama.chat(\n        model="llama3.2",\n        messages=messages,\n        stream=True,\n    )\n    print("Ассистент: ", end="")\n    full_response = ""\n    for chunk in response:\n        token = chunk["message"]["content"]\n        print(token, end="", flush=True)\n        full_response += token\n    messages.append({"role": "assistant", "content": full_response})`,
      },
      {
        id: 'hardware-table',
        title: 'Требования к оборудованию',
        type: 'table',
        content: 'Рекомендации по RAM/VRAM для моделей разных размеров:',
        tableData: {
          headers: ['Размер модели', 'Мин. RAM (CPU)', 'Рек. VRAM (GPU)', 'Примеры моделей'],
          rows: [
            ['1–3B', '4 ГБ', '4 ГБ', 'Phi-3 Mini, Gemma 2B'],
            ['7–8B', '8 ГБ', '8 ГБ', 'Llama 3.1 8B, Mistral 7B'],
            ['13–14B', '16 ГБ', '12 ГБ', 'Llama 2 13B, CodeLlama 13B'],
            ['30–34B', '32 ГБ', '24 ГБ', 'CodeLlama 34B, Yi 34B'],
            ['70B+', '64 ГБ', '48 ГБ+', 'Llama 3.1 70B, Mixtral 8x22B'],
          ],
        },
      },
      {
        id: 'gpu-support',
        title: 'Поддержка GPU',
        type: 'comparison',
        content: 'Ollama поддерживает аппаратное ускорение на различных платформах:',
        tableData: {
          headers: ['Платформа', 'Технология', 'Минимальные требования'],
          rows: [
            ['NVIDIA', 'CUDA', 'Compute Capability 5.0+ (GTX 900+), драйвер 450.80+'],
            ['AMD', 'ROCm', 'gfx900+ (RX 5000+, Radeon Pro VII)'],
            ['Apple Silicon', 'Metal', 'M1/M2/M3/M4 — нативная поддержка'],
          ],
        },
      },
      {
        id: 'hardware-quiz',
        title: 'Проверка знаний: Оборудование',
        type: 'quiz',
        content: '',
        quizData: {
          question: 'Сколько минимально RAM нужно для запуска модели Llama 3.1 8B на CPU?',
          options: ['4 ГБ', '8 ГБ', '16 ГБ', '32 ГБ'],
          correctIndex: 1,
          explanation: 'Для моделей размером 7–8B рекомендуется минимум 8 ГБ оперативной памяти при работе на CPU.',
        },
      },
    ],
  },
  {
    id: 'rag',
    slug: 'rag',
    title: 'RAG',
    subtitle: 'Генерация, дополненная поиском',
    description: 'Технология RAG: эмбеддинги, векторные БД, семантический поиск, реальные кейсы внедрения и пошаговый RAG-пайплайн.',
    color: '#f59e0b',
    colorClass: 'text-saffron',
    bgClass: 'bg-saffron',
    borderClass: 'border-saffron',
    heroImage: HERO_IMAGES.rag,
    moduleNumber: 3,
    sections: [
      {
        id: 'rag-vs-ft',
        title: 'RAG vs Файн-тюнинг: как выбрать?',
        type: 'comparison',
        content: 'Два основных подхода к оптимизации LLM:',
        tableData: {
          headers: ['Характеристика', 'RAG', 'Fine-Tuning'],
          rows: [
            ['Принцип', 'Динамический поиск внешних данных', 'Изменение весов модели'],
            ['Актуальность', 'Высокая (БД обновляется мгновенно)', 'Низкая (требует переобучения)'],
            ['Стоимость', 'Низкая (настройка пайплайнов)', 'Высокая (GPU + датасеты)'],
            ['Галлюцинации', 'Эффективно борется', 'Менее эффективно'],
            ['Идеальный сценарий', 'Корпоративный поиск, FAQ', 'Специфический стиль/формат'],
          ],
        },
      },
      {
        id: 'embeddings',
        title: 'Эмбеддинги (Embeddings)',
        type: 'text',
        content: 'Эмбеддинги — числовые векторы, представляющие текст в многомерном пространстве. Тексты с похожим смыслом находятся близко друг к другу.\n\nНапример, векторы фраз «собака бежит» и «пёс мчится» будут почти идентичны, хотя слова разные. Это позволяет искать информацию по смыслу, а не по точному совпадению слов.\n\nДля создания эмбеддингов используются специальные модели: nomic-embed-text (Ollama), text-embedding-3-small (OpenAI), all-MiniLM-L6-v2 (Sentence Transformers).',
      },
      {
        id: 'vector-db',
        title: 'Векторные базы данных',
        type: 'table',
        content: 'Специализированные хранилища для эмбеддингов:',
        tableData: {
          headers: ['База данных', 'Тип', 'Особенности'],
          rows: [
            ['ChromaDB', 'Встраиваемая (in-process)', 'Простая интеграция с Python, идеальна для прототипов'],
            ['FAISS', 'Библиотека (Meta)', 'Высокая производительность, миллиарды векторов'],
            ['Pinecone', 'Облачный сервис', 'Управляемая инфраструктура, автомасштабирование'],
            ['Weaviate', 'Self-hosted / Cloud', 'GraphQL API, гибридный поиск'],
            ['Qdrant', 'Self-hosted / Cloud', 'Rust-движок, фильтрация метаданных'],
          ],
        },
      },
      {
        id: 'rag-pipeline',
        title: 'RAG-пайплайн: 4 шага',
        type: 'text',
        content: '1. Запрос — пользователь задаёт вопрос на естественном языке\n2. Поиск (Retrieval) — система преобразует запрос в вектор и ищет релевантные фрагменты в векторной БД\n3. Дополнение (Augmentation) — найденные фрагменты добавляются к промпту как контекст\n4. Генерация (Generation) — LLM генерирует ответ на основе предоставленных фактов\n\nКлючевой этап подготовки — chunking (разбиение документов на фрагменты). Рекомендуемый размер: 1000–1200 символов с перекрытием (overlap) 200–300 символов.',
      },
      {
        id: 'rag-cases',
        title: 'Реальные кейсы RAG',
        type: 'table',
        content: 'Компании, успешно внедрившие RAG:',
        tableData: {
          headers: ['Компания', 'Применение', 'Результат'],
          rows: [
            ['DoorDash', 'Чат-бот для курьеров', 'Мгновенные ответы по политикам компании'],
            ['LinkedIn', 'Поддержка клиентов', 'Сокращение времени решения на 28.6%'],
            ['Pinterest', 'Text-to-SQL для аналитиков', 'Доступ к данным без знания SQL'],
            ['Яндекс', 'Neurosupport', 'Снижение времени обработки на 15%'],
            ['Grab', 'Автоматизация отчётов', 'Экономия 3–4 часа на отчёт'],
          ],
        },
      },
      {
        id: 'rag-code',
        title: 'Пример: RAG-пайплайн на Python',
        type: 'code',
        codeLanguage: 'python',
        content: 'import ollama\nimport chromadb\n\n# 1. Инициализация векторной БД\nclient = chromadb.Client()\ncollection = client.create_collection("docs")\n\n# 2. Загрузка и индексация документов\ndocuments = [\n    "Ollama — инструмент для локального запуска LLM.",\n    "RAG соединяет LLM с внешними источниками знаний.",\n    "ChromaDB — встраиваемая векторная база данных.",\n]\ncollection.add(\n    documents=documents,\n    ids=[f"doc_{i}" for i in range(len(documents))],\n)\n\n# 3. Поиск релевантных документов\nquery = "Как запустить LLM локально?"\nresults = collection.query(query_texts=[query], n_results=2)\ncontext = "\\n".join(results["documents"][0])\n\n# 4. Генерация ответа с контекстом\nresponse = ollama.chat(\n    model="llama3.2",\n    messages=[{\n        "role": "user",\n        "content": f"Контекст:\\n{context}\\n\\nВопрос: {query}",\n    }],\n)\nprint(response["message"]["content"])',
      },
      {
        id: 'rag-quiz',
        title: 'Проверка знаний: RAG',
        type: 'quiz',
        content: '',
        quizData: {
          question: 'Какой этап RAG-пайплайна отвечает за разбиение документов на фрагменты?',
          options: ['Retrieval', 'Chunking', 'Generation', 'Augmentation'],
          correctIndex: 1,
          explanation: 'Chunking — это этап предварительной подготовки, на котором документы разбиваются на фрагменты оптимального размера (1000–1200 символов) для последующей векторизации и поиска.',
        },
      },
    ],
  },
  {
    id: 'text-to-sql',
    slug: 'text-to-sql',
    title: 'Text-to-SQL',
    subtitle: 'Запросы к БД на естественном языке',
    description: 'Технология NL2SQL: архитектура, проблемы, модели (SQLCoder, DB-GPT), шаблоны проектирования и интеграция с RAG.',
    color: '#3b82f6',
    colorClass: 'text-sapphire',
    bgClass: 'bg-sapphire',
    borderClass: 'border-sapphire',
    heroImage: HERO_IMAGES.text2sql,
    moduleNumber: 4,
    sections: [
      {
        id: 'text2sql-intro',
        title: 'Что такое Text-to-SQL?',
        type: 'text',
        content: 'Text-to-SQL (NL2SQL) — технология автоматического перевода запросов на естественном языке в корректные SQL-запросы. Она позволяет менеджерам, аналитикам и руководителям без технических навыков напрямую взаимодействовать с базами данных.\n\nАрхитектура состоит из двух компонентов:\n• Модуль понимания языка — анализирует текст, выявляет сущности и намерения\n• Модуль генерации SQL — создаёт синтаксически правильный код с учётом диалекта СУБД',
      },
      {
        id: 'text2sql-problems',
        title: 'Ключевые проблемы Text-to-SQL',
        type: 'table',
        content: 'Семь основных вызовов при преобразовании текста в SQL:',
        tableData: {
          headers: ['Проблема', 'Описание', 'Решение'],
          rows: [
            ['Галлюцинации', 'LLM выдумывает несуществующие таблицы/столбцы', 'Валидация схемы, RAG с метаданными'],
            ['SQL Injection', 'Злонамеренные запросы (DROP TABLE)', 'Песочница, read-only доступ, whitelist'],
            ['Масштаб схемы', 'Сотни таблиц не помещаются в контекст', 'Schema linking, фильтрация релевантных таблиц'],
            ['Неясные названия', 'Столбцы типа col_1, tmp_val', 'Словарь синонимов, описания в метаданных'],
            ['Сложные JOIN', 'Многотабличные запросы с подзапросами', 'Few-shot примеры, декомпозиция запроса'],
            ['Сдвиг выборки', 'Обучающие данные не покрывают домен', 'Fine-tuning на корпоративных данных'],
            ['Out-of-distribution', 'Запросы вне обучающей выборки', 'RAG + самокоррекция агента'],
          ],
        },
      },
      {
        id: 'text2sql-models',
        title: 'Модели и инструменты',
        type: 'comparison',
        content: 'Сравнение подходов к Text-to-SQL:',
        tableData: {
          headers: ['Подход', 'Инструмент', 'Точность', 'Особенности'],
          rows: [
            ['Промпт-инжиниринг', 'GPT-4 Turbo + few-shot', '~85%', 'Быстрый старт, без обучения'],
            ['Fine-tuning', 'SQLCoder (Defog)', '~96%', 'Превосходит GPT-4 на SQL-бенчмарках'],
            ['RAG + Agent', 'Vanna AI / DB-GPT', '~90%', 'Самокоррекция, обучение на примерах'],
          ],
        },
      },
      {
        id: 'text2sql-patterns',
        title: 'Шаблоны проектирования',
        type: 'text',
        content: 'Три архитектурных шаблона для систем Text-to-SQL:\n\nШаблон 1: Прямая генерация — LLM получает схему БД и генерирует SQL напрямую. Инструменты: Chat2DB, SQLChat.\n\nШаблон 2: Агент с самокоррекцией — LLM генерирует SQL → система выполняет → при ошибке агент анализирует и исправляет запрос. Цикл повторяется до успеха.\n\nШаблон 3: RAG для Text-to-SQL — система хранит примеры успешных запросов в векторной БД. При новом вопросе находит похожие примеры и использует их как few-shot контекст. Инструменты: Vanna AI, MindSQL.',
      },
      {
        id: 'text2sql-quiz',
        title: 'Проверка знаний: Text-to-SQL',
        type: 'quiz',
        content: '',
        quizData: {
          question: 'Какая модель для Text-to-SQL показывает точность ~96%, превосходя GPT-4?',
          options: ['DB-GPT', 'Vanna AI', 'SQLCoder (Defog)', 'Claude 3.5'],
          correctIndex: 2,
          explanation: 'SQLCoder от компании Defog — специализированная fine-tuned модель для генерации SQL, которая на бенчмарках показывает точность около 96%, превосходя универсальные модели вроде GPT-4.',
        },
      },
    ],
  },
  {
    id: 'fine-tuning',
    slug: 'fine-tuning',
    title: 'Файн-тюнинг',
    subtitle: 'Дообучение LLM под свои задачи',
    description: 'Техники файн-тюнинга: полное дообучение, PEFT/LoRA/QLoRA, дистилляция знаний. Фреймворки: Unsloth, Axolotl, LlamaFactory.',
    color: '#8b5cf6',
    colorClass: 'text-amethyst',
    bgClass: 'bg-amethyst',
    borderClass: 'border-amethyst',
    heroImage: HERO_IMAGES.finetuning,
    moduleNumber: 5,
    sections: [
      {
        id: 'ft-steps',
        title: 'Шаги файн-тюнинга',
        type: 'text',
        content: 'Процесс дообучения LLM — комплексный инженерный пайплайн:\n\n1. Анализ бизнес-требований — определение метрик успеха, выбор базовой модели (Llama 3, Mistral)\n2. Подготовка данных — сбор пар «инструкция — ответ», исследование качества\n3. Предобработка — токенизация, форматирование в шаблоны (ChatML, Alpaca)\n4. Обучение — запуск обновления весов на GPU с мониторингом (W&B, TensorBoard)\n5. Оценка — валидация на отложенной выборке, проверка на Catastrophic Forgetting\n6. Развёртывание — экспорт в GGUF/safetensors, запуск инференс-сервера',
      },
      {
        id: 'ft-techniques',
        title: 'Техники файн-тюнинга',
        type: 'comparison',
        content: 'Сравнение подходов к дообучению:',
        tableData: {
          headers: ['Техника', 'Обучаемые параметры', 'VRAM для 7B', 'Когда использовать'],
          rows: [
            ['Полный Fine-tuning', '100% весов', '100–120 ГБ', 'Максимальная адаптация, неограниченные ресурсы'],
            ['LoRA', '0.01–1% (адаптеры)', '12–16 ГБ', 'Баланс качества и ресурсов'],
            ['QLoRA', '0.01–1% + квантование 4-bit', '6–8 ГБ', 'Ограниченные ресурсы (1 GPU)'],
            ['Дистилляция', 'Модель-ученик целиком', 'Зависит от ученика', 'Сжатие большой модели в маленькую'],
          ],
        },
      },
      {
        id: 'lora-explanation',
        title: 'Как работает LoRA',
        type: 'text',
        content: 'LoRA (Low-Rank Adaptation) — метод, который «замораживает» все оригинальные веса модели и добавляет небольшие обучаемые матрицы (адаптеры) к каждому слою трансформера.\n\nВместо обновления матрицы весов W размером d×d, LoRA обучает две маленькие матрицы A (d×r) и B (r×d), где r — ранг (обычно 8–64). Итоговое изменение: W\' = W + A×B.\n\nЭто сокращает количество обучаемых параметров в 10 000 раз, при этом качество остаётся сопоставимым с полным файн-тюнингом.\n\nQLoRA добавляет 4-битное квантование базовой модели, что ещё больше снижает требования к памяти.',
      },
      {
        id: 'ft-frameworks',
        title: 'Фреймворки для файн-тюнинга',
        type: 'table',
        content: 'Сравнение популярных фреймворков:',
        tableData: {
          headers: ['Фреймворк', 'Ускорение', 'Интерфейс', 'Лучше всего для'],
          rows: [
            ['Unsloth', '2–5x, экономия 35% VRAM', 'Python API', '1–2 GPU, быстрые эксперименты'],
            ['Axolotl', '1x (стандарт)', 'YAML-конфиг', 'Продакшен, многоузловое обучение'],
            ['LlamaFactory', '1–2x', 'Веб-интерфейс LlamaBoard', 'Низкий порог входа, прототипы'],
            ['DeepSpeed', 'ZeRO-оптимизация', 'Python API + конфиг', 'Модели с миллиардами параметров'],
          ],
        },
      },
      {
        id: 'distillation',
        title: 'Дистилляция знаний',
        type: 'text',
        content: 'Дистилляция знаний (Knowledge Distillation) — метод сжатия большой модели-учителя (Teacher) в компактную модель-ученика (Student).\n\nТри механизма передачи знаний:\n• Логиты — ученик учится воспроизводить распределение вероятностей учителя\n• Признаки — передача промежуточных представлений из скрытых слоёв\n• Сходства — сохранение отношений между примерами\n\nТри схемы обучения:\n• Offline — учитель зафиксирован, ученик обучается на его выходах\n• Online — оба обучаются одновременно\n• Self-distillation — модель дистиллирует сама себя',
      },
      {
        id: 'ft-quiz',
        title: 'Проверка знаний: Файн-тюнинг',
        type: 'quiz',
        content: '',
        quizData: {
          question: 'Какой метод файн-тюнинга сокращает количество обучаемых параметров в ~10 000 раз?',
          options: ['Полный Fine-tuning', 'Дистилляция знаний', 'LoRA', 'Prompt Tuning'],
          correctIndex: 2,
          explanation: 'LoRA (Low-Rank Adaptation) замораживает оригинальные веса и добавляет маленькие адаптерные матрицы, сокращая обучаемые параметры в ~10 000 раз при сопоставимом качестве.',
        },
      },
    ],
  },
];

export function getDashboardBySlug(slug: string): Dashboard | undefined {
  return dashboards.find((d) => d.slug === slug);
}
