# API Specification

## Base URL

```
https://your-cms.com/api/v1
```

## Authentication

All API requests require authentication via Bearer token:

```http
Authorization: Bearer {your-api-token}
```

### Generate Token

Tokens are generated in the admin panel under Settings → API Tokens.

---

## Response Format

### Success Response

```json
{
  "data": {
    // Response data
  },
  "meta": {
    "total": 100,
    "per_page": 20,
    "current_page": 1,
    "last_page": 5
  }
}
```

### Error Response

```json
{
  "error": {
    "message": "Resource not found",
    "code": "NOT_FOUND",
    "status": 404
  }
}
```

---

## HTTP Status Codes

- `200` - OK (Success)
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Rate Limiting

- **Authenticated**: 1000 requests/minute
- **Anonymous**: 60 requests/minute

Rate limit headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

---

## Endpoints

## 📄 Pages

### List All Pages

```http
GET /api/v1/pages
```

**Query Parameters:**

- `status` - Filter by status (`published`, `draft`)
- `homepage` - Get only homepage (`true`)
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 20, max: 100)

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Homepage",
      "slug": "home",
      "is_homepage": true,
      "status": "published",
      "published_at": "2024-01-15T10:30:00Z",
      "components": [
        {
          "type": "hero-section",
          "data": {
            "heading": "Welcome",
            "subheading": "To our CMS",
            "background_image": {
              "id": 123,
              "url": "https://cdn.example.com/hero.jpg",
              "alt": "Hero background"
            },
            "cta_button": {
              "text": "Get Started",
              "link": "/signup"
            }
          }
        },
        {
          "type": "feature-grid",
          "data": {
            "title": "Our Features",
            "items": [
              {
                "icon": "⚡",
                "title": "Fast",
                "description": "Lightning fast performance"
              }
            ]
          }
        }
      ],
      "seo": {
        "title": "Welcome to Our Site",
        "description": "The best CMS platform"
      }
    }
  ],
  "meta": {
    "total": 25,
    "per_page": 20,
    "current_page": 1,
    "last_page": 2
  }
}
```

---

### Get Single Page

```http
GET /api/v1/pages/{slug}
```

**Example:**

```http
GET /api/v1/pages/about-us
```

**Response:**

```json
{
  "data": {
    "id": 2,
    "title": "About Us",
    "slug": "about-us",
    "is_homepage": false,
    "status": "published",
    "published_at": "2024-01-10T14:00:00Z",
    "components": [
      {
        "type": "page-header",
        "data": {
          "title": "About Us",
          "breadcrumbs": ["Home", "About"]
        }
      },
      {
        "type": "content-section",
        "data": {
          "content": "<p>We are a company...</p>"
        }
      }
    ],
    "seo": {
      "title": "About Us - Company Name",
      "description": "Learn more about our company"
    }
  }
}
```

---

## 📚 Collections

### List Collection Items

```http
GET /api/v1/collections/{slug}
```

**Query Parameters:**

- `published` - Filter by published status (`true`, `false`)
- `sort_by` - Sort by field slug (default: `order`)
- `sort_dir` - Sort direction (`asc`, `desc`)
- `search` - Search in all fields
- `page` - Page number
- `per_page` - Items per page

**Example:**

```http
GET /api/v1/collections/blog-posts?published=true&sort_by=publish_date&sort_dir=desc&per_page=10
```

**Response:**

```json
{
  "data": {
    "collection": {
      "name": "Blog Posts",
      "slug": "blog-posts",
      "description": "All blog articles"
    },
    "items": [
      {
        "id": 1,
        "data": {
          "title": "Getting Started with Headless CMS",
          "slug": "getting-started",
          "excerpt": "Learn the basics...",
          "content": "<p>Full article content...</p>",
          "publish_date": "2024-01-15",
          "author": {
            "name": "John Doe",
            "avatar": {
              "url": "https://cdn.example.com/john.jpg"
            }
          },
          "featured_image": {
            "id": 456,
            "url": "https://cdn.example.com/article-1.jpg",
            "alt": "Article thumbnail"
          },
          "categories": ["Tutorial", "CMS"],
          "is_featured": true
        },
        "is_published": true,
        "created_at": "2024-01-14T09:00:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "meta": {
    "total": 50,
    "per_page": 10,
    "current_page": 1,
    "last_page": 5
  }
}
```

---

### Get Single Collection Item

```http
GET /api/v1/collections/{slug}/{id}
```

**Example:**

```http
GET /api/v1/collections/blog-posts/1
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "data": {
      "title": "Getting Started with Headless CMS",
      "slug": "getting-started",
      "content": "<p>Full article content...</p>",
      "publish_date": "2024-01-15",
      "author": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "featured_image": {
        "url": "https://cdn.example.com/article-1.jpg",
        "thumbnail_url": "https://cdn.example.com/article-1-thumb.jpg",
        "alt": "Article thumbnail",
        "width": 1920,
        "height": 1080
      }
    },
    "is_published": true,
    "created_at": "2024-01-14T09:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🧩 Components (Optional)

### Get Component Schema

```http
GET /api/v1/components/{slug}
```

**Example:**

```http
GET /api/v1/components/hero-section
```

**Response:**

```json
{
  "data": {
    "name": "Hero Section",
    "slug": "hero-section",
    "description": "Large hero banner for landing pages",
    "fields": [
      {
        "slug": "heading",
        "name": "Heading",
        "type": "short_text",
        "required": true,
        "config": {
          "max_length": 100
        }
      },
      {
        "slug": "subheading",
        "name": "Subheading",
        "type": "text",
        "required": false
      },
      {
        "slug": "background_image",
        "name": "Background Image",
        "type": "image",
        "required": true,
        "config": {
          "max_size": 5120,
          "formats": ["jpg", "png", "webp"]
        }
      },
      {
        "slug": "cta_button",
        "name": "Call to Action",
        "type": "list",
        "required": false,
        "config": {
          "item_types": ["short_text"],
          "max_items": 1
        }
      }
    ]
  }
}
```

---

## 🖼️ Media

### Get Media Details

```http
GET /api/v1/media/{id}
```

**Response:**

```json
{
  "data": {
    "id": 123,
    "filename": "hero-background.jpg",
    "original_filename": "My Hero Image.jpg",
    "mime_type": "image/jpeg",
    "size": 2456789,
    "formatted_size": "2.34 MB",
    "url": "https://cdn.example.com/media/hero-background.jpg",
    "thumbnail_url": "https://cdn.example.com/media/thumbs/hero-background.jpg",
    "metadata": {
      "width": 1920,
      "height": 1080,
      "alt": "Hero background image",
      "title": "Main hero banner"
    },
    "uploaded_at": "2024-01-10T12:00:00Z"
  }
}
```

---

## 🔍 Search (Optional)

### Global Search

```http
GET /api/v1/search?q={query}
```

**Query Parameters:**

- `q` - Search query
- `type` - Filter by type (`pages`, `collections`)
- `page` - Page number
- `per_page` - Results per page

**Example:**

```http
GET /api/v1/search?q=getting%20started&type=collections
```

**Response:**

```json
{
  "data": {
    "results": [
      {
        "type": "collection_item",
        "collection": "blog-posts",
        "id": 1,
        "title": "Getting Started with Headless CMS",
        "excerpt": "Learn the basics...",
        "url": "/api/v1/collections/blog-posts/1"
      },
      {
        "type": "page",
        "id": 5,
        "title": "Getting Started Guide",
        "slug": "getting-started-guide",
        "url": "/api/v1/pages/getting-started-guide"
      }
    ]
  },
  "meta": {
    "total": 12,
    "per_page": 20,
    "current_page": 1
  }
}
```

---

## 📊 Response Examples by Data Type

### Short Text

```json
{
  "title": "My Article Title"
}
```

### Text (Rich Text)

```json
{
  "content": "<p>This is <strong>rich text</strong> content.</p><ul><li>Item 1</li></ul>"
}
```

### Date

```json
{
  "publish_date": "2024-01-15"
}
```

### Boolean

```json
{
  "is_featured": true
}
```

### Image

```json
{
  "featured_image": {
    "id": 123,
    "url": "https://cdn.example.com/image.jpg",
    "thumbnail_url": "https://cdn.example.com/thumbs/image.jpg",
    "alt": "Image description",
    "width": 1920,
    "height": 1080
  }
}
```

### File

```json
{
  "document": {
    "id": 456,
    "url": "https://cdn.example.com/document.pdf",
    "filename": "whitepaper.pdf",
    "size": 2456789,
    "mime_type": "application/pdf"
  }
}
```

### List (Embedded)

```json
{
  "features": [
    {
      "title": "Fast Performance",
      "description": "Lightning quick",
      "icon": "⚡"
    },
    {
      "title": "Easy to Use",
      "description": "Intuitive interface",
      "icon": "✨"
    }
  ]
}
```

### Collection Reference

```json
{
  "related_posts": [
    {
      "id": 5,
      "title": "Related Article",
      "slug": "related-article",
      "url": "/api/v1/collections/blog-posts/5"
    }
  ]
}
```

---

## 🔐 Error Responses

### 401 Unauthorized

```json
{
  "error": {
    "message": "Invalid or expired API token",
    "code": "UNAUTHORIZED",
    "status": 401
  }
}
```

### 404 Not Found

```json
{
  "error": {
    "message": "Page not found",
    "code": "NOT_FOUND",
    "status": 404
  }
}
```

### 429 Rate Limit Exceeded

```json
{
  "error": {
    "message": "Too many requests. Please try again later.",
    "code": "RATE_LIMIT_EXCEEDED",
    "status": 429,
    "retry_after": 60
  }
}
```

### 500 Internal Server Error

```json
{
  "error": {
    "message": "An unexpected error occurred",
    "code": "INTERNAL_ERROR",
    "status": 500
  }
}
```

---

## 📝 Usage Examples

### JavaScript (Fetch API)

```javascript
const API_TOKEN = 'your-api-token-here';
const BASE_URL = 'https://your-cms.com/api/v1';

// Get all published pages
async function getPages() {
  const response = await fetch(`${BASE_URL}/pages?status=published`, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

// Get single page by slug
async function getPage(slug) {
  const response = await fetch(`${BASE_URL}/pages/${slug}`, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      Accept: 'application/json',
    },
  });

  const data = await response.json();
  return data.data;
}

// Get collection items with pagination
async function getCollectionItems(slug, page = 1) {
  const response = await fetch(
    `${BASE_URL}/collections/${slug}?page=${page}&per_page=10`,
    {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        Accept: 'application/json',
      },
    }
  );

  const data = await response.json();
  return data.data;
}
```

---

### JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-cms.com/api/v1',
  headers: {
    Authorization: `Bearer ${process.env.API_TOKEN}`,
    Accept: 'application/json',
  },
});

// Get homepage
const homepage = await api.get('/pages?homepage=true');

// Get blog posts
const posts = await api.get('/collections/blog-posts', {
  params: {
    published: true,
    sort_by: 'publish_date',
    sort_dir: 'desc',
    per_page: 10,
  },
});

// Handle errors
try {
  const page = await api.get('/pages/non-existent');
} catch (error) {
  if (error.response?.status === 404) {
    console.log('Page not found');
  }
}
```

---

### PHP (Laravel HTTP Client)

```php
use Illuminate\Support\Facades\Http;

$apiToken = env('CMS_API_TOKEN');
$baseUrl = 'https://your-cms.com/api/v1';

// Get all pages
$response = Http::withToken($apiToken)
    ->get("{$baseUrl}/pages");

$pages = $response->json('data');

// Get single page
$response = Http::withToken($apiToken)
    ->get("{$baseUrl}/pages/about-us");

$page = $response->json('data');

// Get collection items
$response = Http::withToken($apiToken)
    ->get("{$baseUrl}/collections/blog-posts", [
        'published' => true,
        'per_page' => 20,
        'page' => 1
    ]);

$items = $response->json('data.items');
```

---

### cURL

```bash
# Get all pages
curl -X GET "https://your-cms.com/api/v1/pages" \
  -H "Authorization: Bearer your-api-token" \
  -H "Accept: application/json"

# Get single page
curl -X GET "https://your-cms.com/api/v1/pages/home" \
  -H "Authorization: Bearer your-api-token" \
  -H "Accept: application/json"

# Get collection items with filters
curl -X GET "https://your-cms.com/api/v1/collections/blog-posts?published=true&per_page=10" \
  -H "Authorization: Bearer your-api-token" \
  -H "Accept: application/json"
```

---

### Python (Requests)

```python
import requests

API_TOKEN = 'your-api-token-here'
BASE_URL = 'https://your-cms.com/api/v1'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Accept': 'application/json'
}

# Get all pages
response = requests.get(f'{BASE_URL}/pages', headers=headers)
pages = response.json()['data']

# Get collection items
response = requests.get(
    f'{BASE_URL}/collections/blog-posts',
    headers=headers,
    params={
        'published': True,
        'per_page': 10,
        'sort_by': 'publish_date',
        'sort_dir': 'desc'
    }
)
items = response.json()['data']['items']
```

---

## 🪝 Webhooks

### Configure Webhooks

Webhooks are configured in the admin panel under Settings → Webhooks.

### Available Events

- `page.published` - When a page is published
- `page.unpublished` - When a page is unpublished
- `page.deleted` - When a page is deleted
- `collection.item.created` - When a collection item is created
- `collection.item.updated` - When a collection item is updated
- `collection.item.deleted` - When a collection item is deleted

### Webhook Payload

```json
{
  "event": "page.published",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": 1,
    "title": "Homepage",
    "slug": "home",
    "url": "https://your-cms.com/api/v1/pages/home"
  }
}
```

### Webhook Signature

Webhooks are signed with HMAC-SHA256. Verify the signature:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return signature === digest;
}

// In your webhook endpoint
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);

  if (verifyWebhook(payload, signature, process.env.WEBHOOK_SECRET)) {
    // Process webhook
    console.log('Event:', req.body.event);
    res.status(200).send('OK');
  } else {
    res.status(401).send('Invalid signature');
  }
});
```

---

## 🔄 Caching

API responses are cached for better performance.

### Cache Headers

```
Cache-Control: public, max-age=3600
ETag: "abc123def456"
Last-Modified: Mon, 15 Jan 2024 10:30:00 GMT
```

### Conditional Requests

Use `If-None-Match` or `If-Modified-Since` headers:

```http
GET /api/v1/pages/home
If-None-Match: "abc123def456"
```

If content hasn't changed:

```http
HTTP/1.1 304 Not Modified
```

---

## 🎯 Best Practices

1. **Cache responses** - Store API responses client-side
2. **Use ETags** - Implement conditional requests
3. **Paginate large collections** - Don't fetch all items at once
4. **Handle rate limits** - Implement backoff strategies
5. **Secure your tokens** - Store in environment variables
6. **Use webhooks** - For real-time updates instead of polling
7. **Filter published only** - Always use `published=true` in production
8. **Handle errors gracefully** - Check status codes and error messages

---

## 📚 Additional Resources

- **Admin Panel**: `https://your-cms.com/bo`
- **API Documentation UI**: `https://your-cms.com/api/documentation`
- **OpenAPI Spec**: `https://your-cms.com/api/openapi.json`
- **Support**: support@your-cms.com

---

## 🆕 Versioning

Current version: **v1**

The API uses URL versioning (`/api/v1/`). Breaking changes will result in a new version (`/api/v2/`).

### Deprecation Policy

- Old versions supported for 12 months after new version release
- Deprecation notices sent via email
- `X-API-Deprecated` header added to responses

---

## 📊 Rate Limit Details

### Limits by Plan

- **Free**: 100 requests/minute
- **Basic**: 500 requests/minute
- **Pro**: 1000 requests/minute
- **Enterprise**: Custom limits

### Increase Limits

Contact sales for higher rate limits: sales@your-cms.com
