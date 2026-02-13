# Документация iSmart Platform

**Версия:** 1.0
**Дата:** 13.02.2026

Этот каталог содержит полный комплект стратегической и технической документации проекта iSmart Platform, адаптированной под методологии PCAM, GRACE и FLEX.

## Навигация по документам

### Стратегические документы

| Документ | Описание |
| :--- | :--- |
| [VISION.md](./vision/VISION.md) | Видение проекта: трансформация в вертикальную ИИ-компанию, продуктовая архитектура, целевые рынки и конкурентные преимущества. |
| [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) | Поэтапный план развития платформы: от Фазы 1 (Фундамент) до Фазы 3 (Обучающаяся Платформа). |

### Технические документы

| Документ | Описание |
| :--- | :--- |
| [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md) | Техническая спецификация: обзор архитектуры, адаптация GRACE для PHP, процедуры разработки, подготовка к API-First. |
| [CONVENTIONS.md](./CONVENTIONS.md) | Конвенции кода и архитектуры: стандарты для PHP, JSON, Twig, JavaScript, CSS и Git. |
| [PROJECT_STATE.md](./PROJECT_STATE.md) | Текущее состояние проекта (Memory Bank): снимок проекта, ключевые решения, инвентарь артефактов. |

### Конфигурация ИИ-агента

| Документ | Описание |
| :--- | :--- |
| [/.cursorrules](../.cursorrules) | Правила для Cursor: глобальный контекст, технические спецификации, поведение ИИ, адаптация методологий. |
| [USER_PROFILE.xml](./methodology/USER_PROFILE.xml) | Профиль пользователя: роль, стек, методологии, уровень автономии ИИ. |

### Справочные материалы (Методологии)

| Документ | Описание |
| :--- | :--- |
| [project_bootstrap_guide.md](./methodology/project_bootstrap_guide.md) | Руководство по начальной настройке проекта. |
| [grace_detailed_instruction.md](./methodology/grace_detailed_instruction.md) | Детальная инструкция по фреймворку GRACE. |
| [flex_detailed_instruction.md](./methodology/flex_detailed_instruction.md) | Детальная инструкция по методологии FLEX. |
| [specialized_systems_guide.md](./methodology/specialized_systems_guide.md) | Руководство по специализированным системам. |
| [arm_guide.md](./methodology/arm_guide.md) | Руководство по проектированию АРМ. |
| [observability_guide.md](./methodology/observability_guide.md) | Руководство по наблюдаемости (Observability). |
| [security_guide.md](./methodology/security_guide.md) | Руководство по безопасности. |
| [testing_guide.md](./methodology/testing_guide.md) | Руководство по тестированию. |
| [prompt_library.md](./methodology/prompt_library.md) | Библиотека готовых промптов для Cursor. |
| [state_management_guide.md](./methodology/state_management_guide.md) | Руководство по управлению состоянием проекта. |
| [project_questionnaire.md](./methodology/project_questionnaire.md) | Опросник для спецификации проекта. |

## Как использовать

1.  **Новый участник проекта:** Начните с `VISION.md`, затем прочитайте `CONVENTIONS.md` и `TECHNICAL_SPEC.md`.
2.  **ИИ-агент (Cursor):** Автоматически загружает `.cursorrules` из корня проекта. Для полного контекста также используйте `USER_PROFILE.xml` и `PROJECT_STATE.md`.
3.  **Планирование задач:** Используйте `DEVELOPMENT_PLAN.md` для определения приоритетов и `PROJECT_STATE.md` для понимания текущего состояния.
