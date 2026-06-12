# Special Components

This page documents the **special Markdown components** that can be embedded into a page.

Unlike standard Markdown elements (headings, lists, tables, links, etc.), these components are rendered as interactive UI elements.

Available special components:

- **Accordion** — collapsible content sections
- **Iframe** — embedded external pages or applications
- **Carousel** — image/content slider
- **Cards Collection** - collection of clickable cards with title, thumbnail, description and link

---

## Accordion Component

The Accordion component allows you to hide or show additional content inside a collapsible section.

::accordion{title="Advanced Configuration" description="Learn how to configure the **database settings**, including changing the default connection string and `poolSize` limit."}

### Syntax

```markdown
::accordion{title="Advanced Configuration" icon="⚙️" description="Learn how to configure..."}
```

### Attributes

| Attribute | Required | Description |
|---|---|---|
| `title` | Yes | Title displayed in the accordion header |
| `icon` | No | Icon displayed next to the title |
| `description` | No | Short description shown in the header |


### Supported features

- Expand / collapse behavior
- Markdown content inside

---

## Iframe Component

The Iframe component allows embedding external web content directly inside the page.

Typical use cases:

- dashboards
- external applications
- documentation pages
- videos
- interactive tools


::iframe{src="https://www.youtube.com/embed/dQw4w9WgXcQ"}

```markdown
::iframe{src="https://www.youtube.com/embed/dQw4w9WgXcQ"}
```

### Attributes

| Attribute | Required | Description |
|---|---|---|
| `src` | Yes | URL of the embedded content |


---

## Carousel Component

The Carousel component displays multiple images or media items as a rotating slider.

:::carousel{autorotate="true" speed="3"}

* https://fastly.picsum.photos/id/7/4728/3168.jpg?hmac=c5B5tfYFM9blHHMhuu4UKmhnbZoJqrzNOP9xjkV4w3o
* https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU
* https://fastly.picsum.photos/id/20/3670/2462.jpg?hmac=CmQ0ln-k5ZqkdtLvVO23LjVAEabZQx2wOaT4pyeG10I

:::


### Syntax

```markdown
:::carousel{autorotate="true" speed="5"}

* https://fastly.picsum.photos/id/7/4728/3168.jpg?hmac=c5B5tfYFM9blHHMhuu4UKmhnbZoJqrzNOP9xjkV4w3o
* https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU
* https://fastly.picsum.photos/id/20/3670/2462.jpg?hmac=CmQ0ln-k5ZqkdtLvVO23LjVAEabZQx2wOaT4pyeG10I

:::
```

### Attributes

| Attribute | Required | Description |
|---|---|---|
| `autorotate` | No | Enables automatic slide rotation |
| `speed` | No | Rotation interval in seconds |

This creates:

- automatic rotation enabled
- one image change every 3 seconds
- three images in the carousel

---

## Cards Collection Component

The Cards Collection component displays a grid of clickable cards, each featuring an image, title, description, and link.

:::cards{columns="3" target="_blank"}

  ::card{title="Mountain Retreat" image="https://fastly.picsum.photos/id/20/3670/2462.jpg?hmac=CmQ0ln-k5ZqkdtLvVO23LjVAEabZQx2wOaT4pyeG10I" description="A highly beautiful alpine **mountain** landscape." link="https://en.wikipedia.org/wiki/Mountain"}

  ::card{title="Serene Beach" image="https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU" description="A calming view of the *ocean* waves." link="https://en.wikipedia.org/wiki/Beach"}

  ::card{title="Deep Forest" image="https://fastly.picsum.photos/id/7/4728/3168.jpg?hmac=c5B5tfYFM9blHHMhuu4UKmhnbZoJqrzNOP9xjkV4w3o" description="Explore the dense woodland trails." link="https://en.wikipedia.org/wiki/Forest"}

:::

### Syntax

```markdown
:::cards{columns="3" target="_blank"}

  ::card{title="Mountain Retreat" image="https://images.example.com/mountain.jpg" description="A highly beautiful alpine **mountain** landscape." link="/locations/mountains"}
  ::card{title="Serene Beach" image="https://images.example.com/beach.jpg" description="A calming view of the *ocean* waves." link="https://example.com/destinations"}

:::
```

### Attributes

**Collection Attributes (`:::cards`)**

| Attribute | Required | Description |
|---|---|---|
| `columns` | No | Number of columns to display the grid in (e.g. 1-4) |
| `target` | No | Specifies where to open links (`_blank` or `_self`) |

**Card Attributes (`::card`)**

| Attribute | Required | Description |
|---|---|---|
| `title` | Yes | The title of the card |
| `image` | Yes | The thumbnail image URL |
| `description` | No | Optional markdown text for the card body |
| `link` | Yes | The URL to navigate to when the card is clicked |

---
