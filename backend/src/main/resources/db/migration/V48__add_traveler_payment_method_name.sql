-- Add cardholder_name column to traveler_payment_methods
ALTER TABLE traveler_payment_methods ADD COLUMN cardholder_name VARCHAR(255);

-- Make it NOT NULL after population if necessary, but for now allow nulls for legacy if any (though this table was just created)
UPDATE traveler_payment_methods SET cardholder_name = 'Unknown' WHERE cardholder_name IS NULL;
ALTER TABLE traveler_payment_methods ALTER COLUMN cardholder_name SET NOT NULL;
