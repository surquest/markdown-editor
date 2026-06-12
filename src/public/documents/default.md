# Markdown Showcase

This page demonstrates common Markdown features and extended components.

## Text Formatting

This is **bold text**, this is *italic text*, and this is ***bold italic text***.

You can also use:

- ~~strikethrough~~
- `inline code`
- <u>underlined text</u>

---

## Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4

---

## Lists

### Unordered List

- Data Platform
- Analytics Layer
  - BigQuery
  - Data Warehouse
- Reporting Tools

### Ordered List

1. Define requirements
2. Build architecture
3. Deploy solution

### Task List

- [x] Create data model
- [x] Configure pipelines
- [ ] Add monitoring

---

## Quotes

> Markdown allows you to create structured documents quickly.
>
> — Documentation Example

---

## Code Examples

### JavaScript

```javascript
function calculateRevenue(sales) {
  return sales.reduce(
    (total, item) => total + item.amount,
    0
  );
}

console.log(calculateRevenue(data));
````

### SQL

```sql
SELECT
  customer_id,
  SUM(amount) AS revenue
FROM transactions
GROUP BY customer_id
ORDER BY revenue DESC;
```

### JSON

```json
{
  "customer": "ACME",
  "orders": 25,
  "active": true
}
```

---

## Tables

| Component | Technology | Status      |
| --------- | ---------- | ----------- |
| Data Lake | GCS        | Done        |
| Warehouse | BigQuery   | Done        |
| Dashboard | Looker     | In Progress |

---

## Links

Visit [OpenAI](https://openai.com) for more information.

---

## Images

![Architecture Diagram](https://fastly.picsum.photos/id/49/200/300.jpg?grayscale&hmac=cKNavZu169kzIb5dYCES0LIOcbtacp082EC1qvjbYFs)

---

## Horizontal Rules

Section separator:

---

## Mathematical Expressions

Inline formula:

`Revenue = Price × Quantity`

Block formula:

```
Total Cost = Fixed Cost + Variable Cost
```

---


## Callouts

> **Note:** This is an important message.

> **Warning:** Validate production changes before deployment.

