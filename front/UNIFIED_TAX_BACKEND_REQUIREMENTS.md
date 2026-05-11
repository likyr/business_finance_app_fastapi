# Требования к бэкенду: Единый налог

## 1. Получение всех ставок единого налога

**Эндпоинт:** `GET /api/taxes/unified-tax-rates`

**Описание:** Возвращает все ставки единого налога (матрица регион × вид деятельности).

**Формат ответа (вариант 1 - массив):**
```json
[
  { "region": "Минск", "activity_type": "Торговля", "rate": 50.0 },
  { "region": "Минск", "activity_type": "Услуги", "rate": 30.0 },
  { "region": "Гродно", "activity_type": "Торговля", "rate": 45.0 }
]
```

**Формат ответа (вариант 2 - объект):**
```json
{
  "Минск": { "Торговля": 50.0, "Услуги": 30.0 },
  "Гродно": { "Торговля": 45.0, "Услуги": 25.0 }
}
```

**Альтернативные названия полей:**
- `region_name` вместо `region`
- `activity_type_name` вместо `activity_type`
- `value` вместо `rate`

**Логика:**
- Проверить авторизацию (опционально: роль Admin)
- Получить все ставки из БД
- Если ставки нет для пары регион-вид деятельности → вернуть 0 или не включать в ответ

---

## 2. Обновление ставки единого налога

**Эндпоинт:** `PUT /api/taxes/unified-tax-rates`

**Описание:** Обновляет или создает ставку для пары регион-вид деятельности.

**Тело запроса:**
```json
{
  "region": "Минск",
  "activity_type": "Торговля",
  "rate": 55.0
}
```

**Формат ответа:**
```json
{
  "success": true,
  "message": "Ставка единого налога успешно обновлена",
  "region": "Минск",
  "activity_type": "Торговля",
  "rate": 55.0
}
```

**Валидация:**
- `region` - обязательное, строка, должен существовать в справочнике регионов
- `activity_type` - обязательное, строка, должен существовать в справочнике видов деятельности
- `rate` - обязательное, число >= 0 (рубли за месяц, может быть дробным)

**Логика:**
1. Проверить авторизацию
2. Валидировать данные
3. Найти запись по паре (region, activity_type)
4. Если существует → обновить, если нет → создать (UPSERT)
5. Вернуть подтверждение

**Ошибки:**
- `400` - невалидные данные, регион/вид деятельности не найден
- `401` - не авторизован
- `403` - нет доступа (если требуется Admin)

---

## Структура БД

**Таблица:** `unified_tax_rates`

```sql
CREATE TABLE unified_tax_rates (
    id SERIAL PRIMARY KEY,
    region VARCHAR(255) NOT NULL,
    activity_type VARCHAR(255) NOT NULL,
    rate DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(region, activity_type)
);
```

**Индексы:**
```sql
CREATE INDEX idx_unified_tax_rates_region ON unified_tax_rates(region);
CREATE INDEX idx_unified_tax_rates_activity_type ON unified_tax_rates(activity_type);
```

**UPSERT запрос (PostgreSQL):**
```sql
INSERT INTO unified_tax_rates (region, activity_type, rate, updated_at)
VALUES (:region, :activity_type, :rate, CURRENT_TIMESTAMP)
ON CONFLICT (region, activity_type)
DO UPDATE SET 
    rate = EXCLUDED.rate,
    updated_at = CURRENT_TIMESTAMP
RETURNING *;
```

---

## Важные замечания

1. **Синхронизация:** Названия регионов и видов деятельности должны точно совпадать с:
   - `/api/company/options/regions`
   - `/api/company/options/activity-types`

2. **Единицы:** Ставка в **рублях за месяц** (может быть дробной, например 50.5)

3. **Формат:** Ставки возвращаются как числа (не строки)

4. **Инициализация:** При первом запуске можно создать записи для всех комбинаций регион × вид деятельности со значением 0

5. **Обработка ошибок:**
```json
{
  "detail": "Описание ошибки",
  "message": "Дополнительное сообщение"
}
```

---

## Примеры

### Получение ставок
```http
GET /api/taxes/unified-tax-rates
```

### Обновление ставки
```http
PUT /api/taxes/unified-tax-rates
Content-Type: application/json

{
  "region": "Минск",
  "activity_type": "Торговля",
  "rate": 55.5
}
```
