# NEXXOS - API Specification

Base URL: `/api`

All authenticated endpoints require `Authorization: Bearer <token>` header. Returns 401 on invalid/expired token.

---

## Authentication

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| POST | /api/signup | {email: string (required), password: string (required), name: string (required), firstName: string (required), lastName: string (required), phone: string (required), documentId: string (required), role: string (required, "CLIENTE" or "VENDEDOR"), vendor: {businessName: string, rif: string, stateId: UUID, municipalityId: UUID, searchRadiusKm: integer, vehicleModelIds: UUID[], partSubcategoryIds: UUID[], documentImagePath: string (optional), logoPath: string (optional)} (required if role=VENDEDOR)} | {token: string, user: {id: UUID, email: string, name: string, firstName: string, lastName: string, roles: string[]}} | No |
| POST | /api/auth/login | {email: string (required), password: string (required)} | {token: string, user: {id: UUID, email: string, name: string, firstName: string, lastName: string, roles: string[]}} | No |
| GET | /api/auth/me | — | {user: {id: UUID, email: string, name: string, firstName: string, lastName: string, phone: string, documentId: string, roles: string[], hasVendorProfile: boolean}} | Bearer |
| POST | /api/auth/forgot-password | {email: string (required)} | {success: boolean, message: string} | No |

---

## User Profile

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| GET | /api/users/profile | — | {id: UUID, email: string, firstName: string, lastName: string, phone: string, documentId: string, roles: string[]} | Bearer |
| PATCH | /api/users/profile | {firstName: string (optional), lastName: string (optional), phone: string (optional)} | {id: UUID, firstName: string, lastName: string, phone: string, updatedAt: ISO8601} | Bearer |

---

## Catalog Endpoints (Public, no auth required)

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| GET | /api/catalog/states | — | {items: {id: UUID, name: string}[]} | No |
| GET | /api/catalog/municipalities?stateId=UUID | — | {items: {id: UUID, name: string, stateId: UUID}[]} | No |
| GET | /api/catalog/vehicle-brands | — | {items: {id: UUID, name: string}[]} | No |
| GET | /api/catalog/vehicle-models?brandId=UUID | — | {items: {id: UUID, name: string, brandId: UUID}[]} | No |
| GET | /api/catalog/part-categories | — | {items: {id: UUID, name: string}[]} | No |
| GET | /api/catalog/part-subcategories?categoryId=UUID | — | {items: {id: UUID, name: string, categoryId: UUID}[]} | No |

---

## Vendor Profile

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| GET | /api/vendor/profile | — | {id: UUID, userId: UUID, businessName: string, rif: string, logoUrl: string \| null, state: {id: UUID, name: string}, municipality: {id: UUID, name: string}, searchRadiusKm: integer, isAvailable: boolean, vehicleModels: {id: UUID, name: string, brand: {id: UUID, name: string}}[], partSubcategories: {id: UUID, name: string, category: {id: UUID, name: string}}[], metrics: {totalRequestsReceived: integer, totalRequestsAnswered: integer, avgRating: number \| null, totalRatings: integer}} | Bearer |
| PATCH | /api/vendor/profile | {businessName: string (optional), rif: string (optional), logoPath: string (optional), stateId: UUID (optional), municipalityId: UUID (optional), searchRadiusKm: integer (optional), vehicleModelIds: UUID[] (optional), partSubcategoryIds: UUID[] (optional)} | {id: UUID, businessName: string, rif: string, logoUrl: string \| null, updatedAt: ISO8601} | Bearer |
| PATCH | /api/vendor/availability | {isAvailable: boolean (required)} | {isAvailable: boolean} | Bearer |

---

## Vendor Dashboard

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| GET | /api/vendor/dashboard | — | {businessName: string, isAvailable: boolean, metrics: {totalRequestsReceived: integer, totalRequestsAnswered: integer, avgRating: number \| null, totalRatings: integer}, recentRequests: {matchId: UUID, request: {id: UUID, vehicleBrand: string, vehicleModel: string, partCategory: string, partSubcategory: string \| null, municipality: string, state: string, createdAt: ISO8601}, status: string}[]} | Bearer |

---

## Client Requests

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| POST | /api/requests | {stateId: UUID (required), municipalityId: UUID (required), searchRadiusKm: integer (required, 5-30), vehicleBrandId: UUID (required), vehicleModelId: UUID (required), partCategoryId: UUID (required), partSubcategoryId: UUID (optional), freeDescription: string (required)} | {id: UUID, status: string, matchedVendorsCount: integer, createdAt: ISO8601} | Bearer |
| GET | /api/requests | query: ?status=string (optional, ABIERTA\|EN_PROCESO\|CERRADA)&hasResponses=boolean (optional)&limit=integer (optional)&offset=integer (optional) | {items: {id: UUID, vehicleBrand: string, vehicleModel: string, partCategory: string, partSubcategory: string \| null, status: string, responseCount: integer, state: string, municipality: string, createdAt: ISO8601}[], total: integer} | Bearer |
| GET | /api/requests/:id | — | {id: UUID, vehicleBrand: {id: UUID, name: string}, vehicleModel: {id: UUID, name: string}, partCategory: {id: UUID, name: string}, partSubcategory: {id: UUID, name: string} \| null, state: {id: UUID, name: string}, municipality: {id: UUID, name: string}, searchRadiusKm: integer, freeDescription: string, status: string, responseCount: integer, createdAt: ISO8601, closedAt: ISO8601 \| null} | Bearer |
| GET | /api/requests/:id/responses | — | {items: {id: UUID, vendor: {id: UUID, businessName: string, logoUrl: string \| null, avgRating: number \| null}, initialMessage: string, chatId: UUID, createdAt: ISO8601}[]} | Bearer |
| PATCH | /api/requests/:id/close | {resolved: boolean (required), vendorId: UUID (optional, required if resolved=true), rating: integer (optional, 1-5, required if resolved=true), comment: string (optional)} | {id: UUID, status: string, closedAt: ISO8601} | Bearer |

---

## Vendor Requests (Matched)

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| GET | /api/vendor/requests | query: ?status=string (optional, PENDING\|RESPONDED\|DECLINED)&limit=integer&offset=integer | {items: {matchId: UUID, request: {id: UUID, vehicleBrand: string, vehicleModel: string, partCategory: string, partSubcategory: string \| null, freeDescription: string, municipality: string, state: string, searchRadiusKm: integer, createdAt: ISO8601, clientFirstName: string}, status: string, respondedAt: ISO8601 \| null, declinedAt: ISO8601 \| null}[], total: integer} | Bearer |
| GET | /api/vendor/requests/:matchId | — | {matchId: UUID, request: {id: UUID, vehicleBrand: string, vehicleModel: string, partCategory: string, partSubcategory: string \| null, freeDescription: string, municipality: string, state: string, searchRadiusKm: integer, createdAt: ISO8601, clientFirstName: string, status: string}, status: string, chatId: UUID \| null} | Bearer |
| POST | /api/vendor/requests/:matchId/respond | {message: string (required, min 10)} | {responseId: UUID, chatId: UUID, createdAt: ISO8601} | Bearer |
| POST | /api/vendor/requests/:matchId/decline | — | {success: boolean} | Bearer |

---

## Chat

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| GET | /api/chats/:chatId/messages | query: ?limit=integer (default 50)&before=ISO8601 (optional, for pagination) | {items: {id: UUID, senderId: UUID, senderName: string, messageText: string, createdAt: ISO8601}[], hasMore: boolean} | Bearer |
| POST | /api/chats/:chatId/messages | {messageText: string (required)} | {id: UUID, senderId: UUID, senderName: string, messageText: string, createdAt: ISO8601} | Bearer |
| GET | /api/chats/:chatId | — | {id: UUID, requestId: UUID, vendorId: UUID, clientId: UUID, requestSummary: string, otherUserName: string, createdAt: ISO8601} | Bearer |

---

## File Upload (for vendor document ID and logo)

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| POST | /api/upload/presigned | {fileName: string (required), contentType: string (required), isPublic: boolean (required)} | {uploadUrl: string, cloud_storage_path: string} | Yes |
| POST | /api/upload/complete | {cloud_storage_path: string (required), fileName: string (required), contentType: string (required)} | {id: UUID, cloud_storage_path: string, url: string} | Yes |
| GET | /api/files/:id/url?mode=view | — | {url: string} | Yes |

---

## Seed Data Endpoint (Development)

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| POST | /api/seed | — | {success: boolean, message: string} | No |

This endpoint seeds: roles, vehicle brands/models, part categories/subcategories, states/municipalities, and the test account (john@doe.com / johndoe123 with ADMIN role + both CLIENTE and VENDEDOR roles with a vendor profile).

---

## Error Response Format

All errors return:
```json
{
  "statusCode": integer,
  "message": string | string[],
  "error": string
}
```

Common codes: 400 (validation), 401 (unauthorized), 403 (forbidden), 404 (not found), 409 (conflict, e.g. duplicate email)
