# 🚀 Migration Plan: Tags to Relational Categories

## 📊 Current State Analysis

```json
// Current practice structure
{
  "practice_category": ["Incident Response", "Crisis Management", "Data Breach"]
}
```

## 🎯 Target State

```json
// New relational structure  
{
  "practice_category": [
    {
      "practice_categories_id": {
        "id": "incident-response",
        "name": "Incident Response", 
        "icon": "🚨",
        "color": "#ef4444"
      }
    }
  ]
}
```

## 📝 Migration Steps

### 1. **Create Categories Collection in Directus**
```bash
# Import the schema
curl -X POST "http://localhost:8055/schema/apply" \
  -H "Content-Type: application/json" \
  -d @practice_categories_schema.json
```

### 2. **Populate Categories**
```bash
# Import initial categories  
curl -X POST "http://localhost:8055/items/practice_categories" \
  -H "Content-Type: application/json" \
  -d @practice_categories_collection.json
```

### 3. **Create Junction Table**
- Directus will auto-create `practices_practice_categories` junction table
- Contains: `id`, `practices_id`, `practice_categories_id`

### 4. **Data Migration Script**
```javascript
// migration-script.js
const practices = await directus.items('practices').readByQuery({
  limit: -1,
  fields: ['id', 'practice_category']
})

for (const practice of practices.data) {
  if (practice.practice_category?.length > 0) {
    // Map string categories to category IDs
    const categoryIds = practice.practice_category.map(catName => {
      return getCategoryIdByName(catName) // Helper function
    }).filter(Boolean)
    
    // Update practice with new relationship
    await directus.items('practices').updateOne(practice.id, {
      practice_category: categoryIds.map(id => ({ practice_categories_id: id }))
    })
  }
}
```

## 🎨 Frontend Benefits

### Before (Tags)
```typescript
// Uncontrolled filters - any string possible
const categories = [...new Set(
  practices.flatMap(p => p.practice_category || [])
)]
```

### After (Relational)  
```typescript
// Controlled filters from API
const categories = await fetch('/api/practice-categories?featured=true')
```

## 💡 Implementation Advantages

✅ **Consistency**: No more "Email Security" vs "email-security"  
✅ **Theming**: Icons and colors for better UX  
✅ **Control**: Admin manages category catalog  
✅ **Metadata**: Descriptions, sort order, featured status  
✅ **Performance**: Indexed relationships vs string matching  
✅ **Future-proof**: Easy to add category-specific features

## 🔄 Rollback Plan

If needed, can export relational data back to string arrays:
```javascript
practice.practice_category = practice.practice_category.map(
  rel => rel.practice_categories_id.name
)
```

## 📈 Next Phase Features

- **Category Analytics**: Track popular categories
- **Personalized Filters**: Remember user preferences  
- **Category Recommendations**: Suggest related practices
- **Category Progress**: Track completion by category
- **Advanced Filtering**: Multi-category AND/OR logic