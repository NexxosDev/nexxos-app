# NEXXOS - Database Schema (Prisma)

## Entity Definitions

### User
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated (uuid) |
| email | String | Unique, required |
| password | String | bcrypt hashed, required |
| firstName | String | Required |
| lastName | String | Required |
| name | String | Required (computed: firstName + lastName) |
| phone | String | Required |
| documentId | String | Required |
| isActive | Boolean | Default true |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto-updated |

**Relations**: userRoles[], vendor?, clientRequests[], chatMessages[], requestRatingsGiven[]

---

### Role
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| name | String | Unique, required (CLIENTE, VENDEDOR, ADMIN) |

**Relations**: userRoles[]

---

### UserRole
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| userId | UUID | FK → User, required |
| roleId | UUID | FK → Role, required |

**Constraints**: Unique(userId, roleId)
**Relations**: user, role

---

### Vendor
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| userId | UUID | FK → User, Unique, required |
| businessName | String | Required |
| rif | String | Required |
| logoUrl | String? | Nullable |
| documentImageUrl | String? | Nullable |
| stateId | UUID | FK → State, required |
| municipalityId | UUID | FK → Municipality, required |
| searchRadiusKm | Int | Required, default 5 |
| isAvailable | Boolean | Default true |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto-updated |

**Relations**: user, state, municipality, vendorVehicleModels[], vendorPartSubcategories[], vendorMetrics?, requestVendorMatches[], requestResponses[], chats[], requestRatingsReceived[]

---

### VendorMetrics
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| vendorId | UUID | FK → Vendor, Unique, required |
| totalRequestsReceived | Int | Default 0 |
| totalRequestsAnswered | Int | Default 0 |
| avgRating | Float? | Nullable |
| totalRatings | Int | Default 0 |
| lastActivityAt | DateTime? | Nullable |

**Relations**: vendor

---

### VehicleBrand
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| name | String | Unique, required |

**Relations**: vehicleModels[], requests[]

---

### VehicleModel
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| brandId | UUID | FK → VehicleBrand, required |
| name | String | Required |

**Constraints**: Unique(brandId, name)
**Relations**: brand, vendorVehicleModels[], requests[]

---

### PartCategory
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| name | String | Unique, required |

**Relations**: partSubcategories[], requests[]

---

### PartSubcategory
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| categoryId | UUID | FK → PartCategory, required |
| name | String | Required |

**Constraints**: Unique(categoryId, name)
**Relations**: category, vendorPartSubcategories[], requests[]

---

### State
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| name | String | Unique, required |

**Relations**: municipalities[], vendors[], requests[]

---

### Municipality
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| stateId | UUID | FK → State, required |
| name | String | Required |

**Constraints**: Unique(stateId, name)
**Relations**: state, vendors[], requests[]

---

### VendorVehicleModel
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| vendorId | UUID | FK → Vendor, required, onDelete: Cascade |
| vehicleModelId | UUID | FK → VehicleModel, required |

**Constraints**: Unique(vendorId, vehicleModelId)
**Relations**: vendor, vehicleModel

---

### VendorPartSubcategory
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| vendorId | UUID | FK → Vendor, required, onDelete: Cascade |
| partSubcategoryId | UUID | FK → PartSubcategory, required |

**Constraints**: Unique(vendorId, partSubcategoryId)
**Relations**: vendor, partSubcategory

---

### Request
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| clientId | UUID | FK → User, required |
| vehicleBrandId | UUID | FK → VehicleBrand, required |
| vehicleModelId | UUID | FK → VehicleModel, required |
| partCategoryId | UUID | FK → PartCategory, required |
| partSubcategoryId | UUID? | FK → PartSubcategory, nullable |
| stateId | UUID | FK → State, required |
| municipalityId | UUID | FK → Municipality, required |
| searchRadiusKm | Int | Required |
| freeDescription | String | Required |
| status | String | Required, default "ABIERTA" (enum: ABIERTA, EN_PROCESO, CERRADA) |
| createdAt | DateTime | Auto |
| closedAt | DateTime? | Nullable |

**Indexes**: Index(clientId), Index(status), Index(stateId, municipalityId)
**Relations**: client, vehicleBrand, vehicleModel, partCategory, partSubcategory, state, municipality, requestVendorMatches[], requestResponses[], chats[], requestRating?

---

### RequestVendorMatch
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| requestId | UUID | FK → Request, required |
| vendorId | UUID | FK → Vendor, required |
| deliveredAt | DateTime | Auto (when match created) |
| responded | Boolean | Default false |
| declined | Boolean | Default false |
| respondedAt | DateTime? | Nullable |
| declinedAt | DateTime? | Nullable |

**Constraints**: Unique(requestId, vendorId)
**Indexes**: Index(vendorId), Index(requestId)
**Relations**: request, vendor

---

### RequestResponse
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| requestId | UUID | FK → Request, required |
| vendorId | UUID | FK → Vendor, required |
| initialMessage | String | Required |
| createdAt | DateTime | Auto |

**Constraints**: Unique(requestId, vendorId)
**Relations**: request, vendor

---

### Chat
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| requestId | UUID | FK → Request, required |
| vendorId | UUID | FK → Vendor, required |
| clientId | UUID | FK → User, required |
| createdAt | DateTime | Auto |

**Constraints**: Unique(requestId, vendorId, clientId)
**Indexes**: Index(clientId), Index(vendorId)
**Relations**: request, vendor, client, chatMessages[]

---

### ChatMessage
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| chatId | UUID | FK → Chat, required, onDelete: Cascade |
| senderId | UUID | FK → User, required |
| messageText | String | Required |
| createdAt | DateTime | Auto |

**Indexes**: Index(chatId, createdAt)
**Relations**: chat, sender

---

### RequestRating
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| requestId | UUID | FK → Request, Unique, required |
| clientId | UUID | FK → User, required |
| vendorId | UUID | FK → Vendor, required |
| rating | Int | Required (1-5) |
| comment | String? | Nullable |
| createdAt | DateTime | Auto |

**Indexes**: Index(vendorId)
**Relations**: request, client, vendor

---

### File
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| userId | UUID | FK → User, required |
| fileName | String | Required |
| cloud_storage_path | String | Required |
| isPublic | Boolean | Default false |
| contentType | String | Required |
| createdAt | DateTime | Auto |

**Relations**: user

---

### Plan (prepared structure, seeded but not actively used in MVP)
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| name | String | Required |
| description | String? | Nullable |
| price | Float | Required |
| billingCycle | String | Required |
| isActive | Boolean | Default true |

**Relations**: vendorSubscriptions[]

---

### VendorSubscription (prepared structure)
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| vendorId | UUID | FK → Vendor, required |
| planId | UUID | FK → Plan, required |
| startDate | DateTime | Required |
| endDate | DateTime | Required |
| status | String | Required (ACTIVE, EXPIRED, CANCELLED) |

**Relations**: vendor, plan

---

## Seed Data

The seed script must populate:

1. **Roles**: CLIENTE, VENDEDOR, ADMIN

2. **Test User** (john@doe.com / johndoe123):
   - User with all 3 roles (ADMIN, CLIENTE, VENDEDOR)
   - Vendor profile: businessName="NEXXOS Test", rif="J-12345678-9", state=Distrito Capital, municipality=Libertador, searchRadiusKm=15, isAvailable=true
   - VendorMetrics initialized
   - Assigned to a few vehicle models and part subcategories

3. **Vehicle Brands & Models**:
   - Toyota: Corolla, Camry, RAV4, Hilux, Yaris
   - Ford: F-150, Explorer, Mustang, Fiesta, Focus
   - Chevrolet: Silverado, Cruze, Spark, Aveo, Captiva
   - Nissan: Sentra, Versa, Frontier, Pathfinder, March
   - Honda: Civic, Accord, CR-V, Fit, HR-V
   - Hyundai: Tucson, Elantra, Accent, Santa Fe, Creta
   - Kia: Sportage, Rio, Cerato, Sorento, Picanto
   - Mazda: 3, 6, CX-5, CX-3, 2
   - Volkswagen: Gol, Jetta, Tiguan, Polo, Amarok
   - Renault: Logan, Sandero, Duster, Captur, Kwid

4. **Part Categories & Subcategories**:
   - Motor: Pistones, Bielas, Cigüeñal, Válvulas, Bujías, Empaques
   - Transmisión: Caja de cambios, Embrague, Cardán, Diferencial
   - Suspensión: Amortiguadores, Resortes, Rótulas, Bujes, Barras
   - Frenos: Pastillas, Discos, Tambores, Líquido de frenos, Calibradores
   - Eléctrico: Alternador, Motor de arranque, Batería, Bobinas, Sensores
   - Carrocería: Parachoques, Guardafangos, Capó, Puertas, Espejos
   - Iluminación: Faros, Stops, Bombillos, Exploradoras
   - Interior: Tapicería, Tablero, Alfombras, Manillas
   - Neumáticos: Cauchos, Rines, Válvulas de aire
   - Filtros: Filtro de aceite, Filtro de aire, Filtro de combustible, Filtro de cabina

5. **States & Municipalities**:
   - Distrito Capital: Libertador
   - Miranda: Sucre, Baruta, Chacao, El Hatillo, Plaza
   - Carabobo: Valencia, Naguanagua, San Diego, Libertador
   - Zulia: Maracaibo, San Francisco, Cabimas, Lagunillas
   - Aragua: Girardot, Santiago Mariño, Libertador, Zamora
   - Lara: Iribarren, Palavecino, Cabudare
   - Táchira: San Cristóbal, Cárdenas, Junín
   - Anzoátegui: Sotillo, Urbaneja, Bolívar, Simón Rodríguez
   - Bolívar: Caroní, Heres, Piar
   - Mérida: Libertador, Campo Elías, Sucre

6. **Plans** (prepared): Plan Básico (free), Plan Premium ($9.99/month)
