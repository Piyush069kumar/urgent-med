
-- 1. Resource Categories
INSERT INTO resource_category (name) VALUES
  ('Blood Bank'),
  ('Beds'),
  ('Ventilators & Respiratory'),
  ('Surgical Equipment'),
  ('Diagnostic Equipment'),
  ('Emergency Medicines'),
  ('Ambulance Services'),
  ('Oxygen Supply'),
  ('Personal Protective Equipment');


-- 2. Resources

-- Blood Bank
INSERT INTO resource (resource_category_id, name) VALUES
  ((SELECT id FROM resource_category WHERE name = 'Blood Bank'), 'A+ Whole Blood'),
  ((SELECT id FROM resource_category WHERE name = 'Blood Bank'), 'A- Whole Blood'),
  ((SELECT id FROM resource_category WHERE name = 'Blood Bank'), 'B+ Whole Blood'),
  ((SELECT id FROM resource_category WHERE name = 'Blood Bank'), 'B- Whole Blood'),
  ((SELECT id FROM resource_category WHERE name = 'Blood Bank'), 'AB+ Whole Blood'),
  ((SELECT id FROM resource_category WHERE name = 'Blood Bank'), 'AB- Whole Blood'),
  ((SELECT id FROM resource_category WHERE name = 'Blood Bank'), 'O+ Whole Blood'),
  ((SELECT id FROM resource_category WHERE name = 'Blood Bank'), 'O- Whole Blood'),
  ((SELECT id FROM resource_category WHERE name = 'Blood Bank'), 'Platelet Concentrate'),
  ((SELECT id FROM resource_category WHERE name = 'Blood Bank'), 'Fresh Frozen Plasma (FFP)'),
  ((SELECT id FROM resource_category WHERE name = 'Blood Bank'), 'Packed Red Blood Cells (PRBC)');

-- Beds
INSERT INTO resource (resource_category_id, name) VALUES
  ((SELECT id FROM resource_category WHERE name = 'Beds'), 'General Ward Bed'),
  ((SELECT id FROM resource_category WHERE name = 'Beds'), 'ICU Bed'),
  ((SELECT id FROM resource_category WHERE name = 'Beds'), 'NICU Bed'),
  ((SELECT id FROM resource_category WHERE name = 'Beds'), 'PICU Bed'),
  ((SELECT id FROM resource_category WHERE name = 'Beds'), 'HDU Bed'),
  ((SELECT id FROM resource_category WHERE name = 'Beds'), 'Isolation Bed'),
  ((SELECT id FROM resource_category WHERE name = 'Beds'), 'Burn Ward Bed'),
  ((SELECT id FROM resource_category WHERE name = 'Beds'), 'Maternity Bed'),
  ((SELECT id FROM resource_category WHERE name = 'Beds'), 'Emergency / Trauma Bed');

-- Ventilators & Respiratory
INSERT INTO resource (resource_category_id, name) VALUES
  ((SELECT id FROM resource_category WHERE name = 'Ventilators & Respiratory'), 'Invasive Ventilator'),
  ((SELECT id FROM resource_category WHERE name = 'Ventilators & Respiratory'), 'Non-Invasive Ventilator (BiPAP/CPAP)'),
  ((SELECT id FROM resource_category WHERE name = 'Ventilators & Respiratory'), 'Portable Transport Ventilator'),
  ((SELECT id FROM resource_category WHERE name = 'Ventilators & Respiratory'), 'Pediatric Ventilator'),
  ((SELECT id FROM resource_category WHERE name = 'Ventilators & Respiratory'), 'High-Flow Nasal Cannula (HFNC)'),
  ((SELECT id FROM resource_category WHERE name = 'Ventilators & Respiratory'), 'Nebulizer');


-- Diagnostic Equipment
INSERT INTO resource (resource_category_id, name) VALUES
  ((SELECT id FROM resource_category WHERE name = 'Diagnostic Equipment'), 'CT Scan'),
  ((SELECT id FROM resource_category WHERE name = 'Diagnostic Equipment'), 'MRI'),
  ((SELECT id FROM resource_category WHERE name = 'Diagnostic Equipment'), 'X-Ray'),
  ((SELECT id FROM resource_category WHERE name = 'Diagnostic Equipment'), 'Ultrasound'),
  ((SELECT id FROM resource_category WHERE name = 'Diagnostic Equipment'), 'ECG Machine'),
  ((SELECT id FROM resource_category WHERE name = 'Diagnostic Equipment'), 'Echocardiogram'),
  ((SELECT id FROM resource_category WHERE name = 'Diagnostic Equipment'), 'Endoscopy Unit'),
  ((SELECT id FROM resource_category WHERE name = 'Diagnostic Equipment'), 'Dialysis Machine'),
  ((SELECT id FROM resource_category WHERE name = 'Diagnostic Equipment'), 'ABG Analyzer'),
  ((SELECT id FROM resource_category WHERE name = 'Diagnostic Equipment'), 'Pulse Oximeter');

-- Emergency Medicines
INSERT INTO resource (resource_category_id, name) VALUES
  ((SELECT id FROM resource_category WHERE name = 'Emergency Medicines'), 'Anti-Snake Venom (ASV)'),
  ((SELECT id FROM resource_category WHERE name = 'Emergency Medicines'), 'Anti-Rabies Vaccine'),
  ((SELECT id FROM resource_category WHERE name = 'Emergency Medicines'), 'Adrenaline (Epinephrine)'),
  ((SELECT id FROM resource_category WHERE name = 'Emergency Medicines'), 'Atropine'),
  ((SELECT id FROM resource_category WHERE name = 'Emergency Medicines'), 'Insulin (Emergency Stock)'),
  ((SELECT id FROM resource_category WHERE name = 'Emergency Medicines'), 'Tetanus Immunoglobulin (TIG)'),
  ((SELECT id FROM resource_category WHERE name = 'Emergency Medicines'), 'Thrombolytic Agents (Streptokinase)'),
  ((SELECT id FROM resource_category WHERE name = 'Emergency Medicines'), 'Naloxone (Opioid Reversal)');

-- Ambulance Services
INSERT INTO resource (resource_category_id, name) VALUES
  ((SELECT id FROM resource_category WHERE name = 'Ambulance Services'), 'Basic Life Support (BLS) Ambulance'),
  ((SELECT id FROM resource_category WHERE name = 'Ambulance Services'), 'Advanced Life Support (ALS) Ambulance'),
  ((SELECT id FROM resource_category WHERE name = 'Ambulance Services'), 'Cardiac Ambulance');

-- Oxygen Supply
INSERT INTO resource (resource_category_id, name) VALUES
  ((SELECT id FROM resource_category WHERE name = 'Oxygen Supply'), 'Liquid Medical Oxygen (LMO) Tank'),
  ((SELECT id FROM resource_category WHERE name = 'Oxygen Supply'), 'Oxygen Cylinder (Jumbo D-Type)'),
  ((SELECT id FROM resource_category WHERE name = 'Oxygen Supply'), 'Oxygen Cylinder (B-Type Portable)'),
  ((SELECT id FROM resource_category WHERE name = 'Oxygen Supply'), 'Oxygen Concentrator'),
  ((SELECT id FROM resource_category WHERE name = 'Oxygen Supply'), 'PSA Oxygen Plant (On-Site)');

-- Personal Protective Equipment
INSERT INTO resource (resource_category_id, name) VALUES
  ((SELECT id FROM resource_category WHERE name = 'Personal Protective Equipment'), 'PPE Kit'),
  ((SELECT id FROM resource_category WHERE name = 'Personal Protective Equipment'), 'N95 Mask'),
  ((SELECT id FROM resource_category WHERE name = 'Personal Protective Equipment'), 'Surgical Mask'),
  ((SELECT id FROM resource_category WHERE name = 'Personal Protective Equipment'), 'Face Shield'),
  ((SELECT id FROM resource_category WHERE name = 'Personal Protective Equipment'), 'Surgical Gloves (Sterile)');

