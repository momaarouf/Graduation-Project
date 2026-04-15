# Soft Delete Strategy

## Why Soft Delete?

In a travel marketplace, data never truly disappears. A deleted tour still anchors booking history, a deleted payment method is still referenced by past charges, and a deleted review may be cited in a dispute. Hard-deleting these rows breaks referential integrity and destroys the audit trail needed for financial reconciliation, legal compliance, and debugging.

**Soft delete replaces:**
```sql
DELETE FROM table WHERE id = ?
```

**With:**
```sql
UPDATE table SET deleted_at_utc = NOW() WHERE id = ?
```

The row stays in the database. All normal read queries filter it out.

---

## Fields Added Per Entity

Each soft-deletable entity follows the same pattern — a single nullable timestamp column:

| Entity | Table | Column | Migration |
|--------|-------|--------|-----------|
| `TourTemplate` | `tour_templates` | `deleted_at_utc` | V17 (original) |
| `TourOccurrence` | `tour_occurrences` | `deleted_at_utc` | V17 (original) |
| `Booking` | `bookings` | `deleted_at_utc` | V38 (original) |
| `WaitlistEntry` | `waitlist_entries` | `deleted_at_utc` | V39 (original) |
| `TourMedia` | `tour_media` | `deleted_at_utc` | **V55** (this sprint) |
| `TravelerPaymentMethod` | `traveler_payment_methods` | `deleted_at_utc` | **V56** (this sprint) |
| `Review` | `reviews` | `deleted_at_utc` | **V57** (this sprint) |

**Java field declaration (standard pattern):**
```java
/** Soft delete timestamp. Set to mark this record as deleted. Never hard-delete. */
@Column(name = "deleted_at_utc")
private Instant deletedAtUtc;
```

**NULL = active.  Non-NULL = deleted.**

---

## How It Works

### Setting a Soft Delete

```java
// ✅ Correct — soft delete
entity.setDeletedAtUtc(Instant.now());
repository.save(entity);

// ❌ Never do this for business entities
repository.delete(entity);
```

### Reading Data (Filtering Deleted Records)

All JPQL queries that return data to callers MUST include:

```jpql
AND entity.deletedAtUtc IS NULL
```

**Example:**
```jpql
SELECT m FROM TourMedia m
WHERE m.template.id = :templateId
  AND m.deletedAtUtc IS NULL
ORDER BY m.displayOrder ASC
```

> [!IMPORTANT]
> Do NOT use Spring Data derived query names like `findByTemplateId()` for soft-deletable entities — they do not include the filter. Always write explicit `@Query` JPQL.

---

## Query Filtering Strategy

We use **explicit JPQL `WHERE` clauses** rather than Hibernate `@Where` or `@SQLRestriction` for the following reasons:

| Approach | Why rejected |
|----------|-------------|
| `@Where(clause = "deleted_at_utc IS NULL")` | Silently applies to ALL queries including admin "show deleted" views. Hard to override when needed. |
| `@SQLRestriction` (Hibernate 6+) | Same problem as `@Where`. |
| **Explicit JPQL filter** ✅ | Transparent, per-query control. Admin can query without filter when needed. No magic. |

---

## Partial Indexes (for Performance)

Each new soft-delete column has a matching partial index that only indexes active (non-deleted) rows:

```sql
-- V55 — TourMedia
CREATE INDEX idx_tour_media_not_deleted
    ON tour_media (tour_template_id, display_order)
    WHERE deleted_at_utc IS NULL;

-- V56 — TravelerPaymentMethod
CREATE INDEX idx_payment_methods_not_deleted
    ON traveler_payment_methods (traveler_profile_id)
    WHERE deleted_at_utc IS NULL;

-- V57 — Review
CREATE INDEX idx_reviews_not_deleted
    ON reviews (guide_id, created_at)
    WHERE deleted_at_utc IS NULL AND is_hidden = FALSE;
```

These keep the filtered read queries fast even after many soft-deleted rows accumulate.

---

## Review: isHidden vs deletedAtUtc

The `Review` entity has TWO moderation mechanisms with different semantics:

| Field | When to use | Visible in... |
|-------|------------|--------------|
| `isHidden = true` | Admin hides for moderation (spam, offensive content) | Admin queue only |
| `deletedAtUtc = now()` | GDPR erasure, legal hold, platform purge | **Nowhere** — completely invisible |

**Rule:** Use `isHidden` for routine content moderation. Reserve `deletedAtUtc` for permanent, irreversible removal.

---

## Edge Cases Handled

### Deleting the Default Payment Card
When a traveler deletes their default card, the next active card is **automatically promoted to default**:

```java
if (wasDefault) {
    List<TravelerPaymentMethod> remaining = paymentMethodRepository.findByTravelerProfileId(profileId);
    if (!remaining.isEmpty()) {
        remaining.get(0).setIsDefault(true);
        paymentMethodRepository.save(remaining.get(0));
    }
}
```

### Double-Delete Guard
Soft-deleting an already-deleted entity throws an error instead of silently no-op:

```java
if (media.getDeletedAtUtc() != null) {
    throw new ResponseStatusException(HttpStatus.GONE, "Media has already been deleted");
}
```

### Occurrence Deletion with Bookings
`TourOccurrenceService.deleteOccurrence()` is blocked by the service layer if the occurrence has `seatsReserved > 0`. Occurrences with active travelers are never deleted (even softly) — the guide must cancel or complete them first.

### Review Re-submission After Purge
`ReviewRepository.existsByBookingId()` filters `AND deletedAtUtc IS NULL`. If an admin purges a review, the traveler's booking is no longer "reviewed" from the system's perspective — they can re-submit.

---

## Intentional Hard Deletes (By Design)

These operations are **kept as hard deletes** because they are reversible user preferences, not audit-critical business events:

| Entity | Operation | Reason |
|--------|-----------|--------|
| `WishlistItem` | Remove from wishlist | User preference; no financial/legal significance |
| `ReviewHelpfulVote` | Toggle helpful | Binary toggle; removing the vote IS the action |
| `GuideLanguage` | Language update | Replace-all semantics on every profile save |
| `TourMapPoint` | Route update | Replace-all semantics on every route save |

---

## Future Enhancements

- **Admin "Trash Bin" UI** — query `WHERE deletedAtUtc IS NOT NULL` to list soft-deleted records
- **Restore endpoint** — `PATCH /api/admin/{entity}/{id}/restore` sets `deletedAtUtc = null`
- **Scheduled Cleanup Job** — permanently purge records deleted more than N years ago (GDPR retention policy)
- **`deletedBy` field** — add `Long deletedByUserId` to capture audit WHO deleted, not just WHEN
