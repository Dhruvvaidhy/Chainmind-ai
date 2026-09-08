-- Flyway Seed Data V2 for ChainMind AI

-- 1. Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'SUPER_ADMIN', 'Platform Administrator with system-wide privileges'),
(2, 'ORGANIZATION_ADMIN', 'Organization Administrator with full org access'),
(3, 'SUPPLY_CHAIN_MANAGER', 'Manages suppliers, products, purchase orders, and shipments'),
(4, 'WAREHOUSE_MANAGER', 'Manages warehouses, inventory, and stock adjustments'),
(5, 'ANALYST', 'Read-only access to analytics, reports, and AI insights');

-- 2. Organizations
INSERT INTO organizations (id, name, code, plan, status, created_at, updated_at) VALUES
(1, 'NovaTech Supply Solutions', 'NOVATECH', 'ENTERPRISE', 'ACTIVE', NOW(), NOW());

-- 3. Users (Password: Admin@12345 -> BCrypt hash $2a$10$e0MYzXyjpJS7Pd0RVvHwHe10B4yB9WcE2h0xW7aM5E6mP9Q0d1.2K)
-- Note: We will also handle BCrypt validation in Java Auth Service if needed or use a verified BCrypt hash.
INSERT INTO users (id, organization_id, email, password, first_name, last_name, phone, role_id, active, created_at, updated_at) VALUES
(1, 1, 'admin@novatech.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07Xd00DMxs.AQubh4a', 'Sarah', 'Jenkins', '+1 (555) 019-2834', 2, TRUE, NOW(), NOW()),
(2, 1, 'manager@novatech.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07Xd00DMxs.AQubh4a', 'David', 'Chen', '+1 (555) 019-5821', 3, TRUE, NOW(), NOW()),
(3, 1, 'warehouse@novatech.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07Xd00DMxs.AQubh4a', 'Marcus', 'Vance', '+1 (555) 019-9942', 4, TRUE, NOW(), NOW()),
(4, 1, 'analyst@novatech.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07Xd00DMxs.AQubh4a', 'Elena', 'Rostova', '+1 (555) 019-3311', 5, TRUE, NOW(), NOW());

-- 4. Product Categories
INSERT INTO product_categories (id, organization_id, name, description, created_at) VALUES
(1, 1, 'Semiconductors & Chips', 'Microcontrollers, ICs, and processing units', NOW()),
(2, 1, 'Passive Components', 'Resistors, capacitors, inductors, and transformers', NOW()),
(3, 1, 'Raw Metals & Alloys', 'Aluminum, copper wiring, and steel sheets', NOW()),
(4, 1, 'Polymers & Housing', 'Enclosures, molded plastics, and silicone gaskets', NOW()),
(5, 1, 'Optical & Displays', 'LCD panels, LED arrays, and optical sensors', NOW());

-- 5. Suppliers (10 suppliers)
INSERT INTO suppliers (id, organization_id, name, contact_person, email, phone, address, city, country, rating, performance_score, status, created_at, updated_at) VALUES
(1, 1, 'Global Chiptech Corp', 'Hiroshi Tanaka', 'htanaka@chiptech.io', '+81 3 5555 0142', '1-2 Chiyoda', 'Tokyo', 'Japan', 4.8, 92.5, 'ACTIVE', NOW(), NOW()),
(2, 1, 'Apex Logistics & Components', 'Robert Vance', 'rvance@apexcomp.com', '+1 (415) 890-1200', '450 Tech Way', 'San Jose', 'USA', 4.2, 78.0, 'ACTIVE', NOW(), NOW()),
(3, 1, 'Precision Dynamics GmbH', 'Hans Mueller', 'h.mueller@precision-dyn.de', '+49 89 204000', 'Industriestrasse 12', 'Munich', 'Germany', 4.6, 88.0, 'ACTIVE', NOW(), NOW()),
(4, 1, 'Volt Electrical Systems', 'Claire Dubois', 'cdubois@voltelec.fr', '+33 1 40 50 60 70', '15 Rue de L Peace', 'Paris', 'France', 4.5, 84.0, 'ACTIVE', NOW(), NOW()),
(5, 1, 'NextGen Semiconductors', 'Kevin Lin', 'klin@nextgensemi.tw', '+886 3 577 8000', 'Science Park Rd 8', 'Hsinchu', 'Taiwan', 4.9, 95.0, 'ACTIVE', NOW(), NOW()),
(6, 1, 'Titan Materials Ltd', 'Arthur Pendelton', 'apendelton@titanmaterials.co.uk', '+44 20 7946 0912', '88 Industrial Estate', 'Birmingham', 'UK', 3.9, 65.0, 'ACTIVE', NOW(), NOW()),
(7, 1, 'Fusion Plastics & Molding', 'Maria Santos', 'msantos@fusionplastics.mx', '+52 81 8123 4567', 'Av Constitucion 500', 'Monterrey', 'Mexico', 4.1, 74.0, 'ACTIVE', NOW(), NOW()),
(8, 1, 'Horizon Optoelectronics', 'Li Wei', 'li.wei@horizon-opto.cn', '+86 21 6888 9999', 'Zhangjiang Hi-Tech Park', 'Shanghai', 'China', 4.3, 81.0, 'ACTIVE', NOW(), NOW()),
(9, 1, 'Nordic Precision Assemblies', 'Erik Lindqvist', 'erik@nordicassembly.se', '+46 8 123 4567', 'Hamngatan 4', 'Stockholm', 'Sweden', 4.7, 91.0, 'ACTIVE', NOW(), NOW()),
(10, 1, 'Pacific Freight & Wiring', 'Siddharth Patel', 'spatel@pacificwiring.in', '+91 22 2857 0000', 'MIDC Industrial Area', 'Mumbai', 'India', 3.8, 62.0, 'ACTIVE', NOW(), NOW());

-- 6. Warehouses (5 warehouses)
INSERT INTO warehouses (id, organization_id, name, code, location, city, country, capacity, manager_name, status, created_at, updated_at) VALUES
(1, 1, 'Main Central Warehouse', 'WH-CHI-01', '1200 Logistics Blvd', 'Chicago', 'USA', 25000, 'Marcus Vance', 'ACTIVE', NOW(), NOW()),
(2, 1, 'West Coast Fulfillment Center', 'WH-LAX-02', '890 Port Access Rd', 'Los Angeles', 'USA', 18000, 'Jenny Kim', 'ACTIVE', NOW(), NOW()),
(3, 1, 'East Coast Distribution Hub', 'WH-EWR-03', '400 Turnpike Way', 'Newark', 'USA', 20000, 'Tom Brady', 'ACTIVE', NOW(), NOW()),
(4, 1, 'European Operations Center', 'WH-RTM-04', 'Havenstraat 45', 'Rotterdam', 'Netherlands', 15000, 'Jan De Jong', 'ACTIVE', NOW(), NOW()),
(5, 1, 'Asia-Pacific Transit Depot', 'WH-SIN-05', '12 Changi South St', 'Singapore', 'Singapore', 12000, 'Tan Ah Kow', 'ACTIVE', NOW(), NOW());

-- 7. Products (30 products)
INSERT INTO products (id, organization_id, supplier_id, category_id, name, sku, description, unit, purchase_price, lead_time_days, reorder_level, safety_stock, status, created_at, updated_at) VALUES
(1, 1, 1, 1, 'ARM Cortex-M4 Microcontroller IC', 'PRD-MCU-001', '32-bit ARM Cortex-M4 120MHz MCU with 512KB Flash', 'PCS', 4.85, 14, 500, 200, 'ACTIVE', NOW(), NOW()),
(2, 1, 1, 1, 'Ultra-Low Power Wi-Fi SoC', 'PRD-WIFI-002', 'Dual-band Wi-Fi 6 + Bluetooth 5.2 SoC chip', 'PCS', 6.20, 21, 400, 150, 'ACTIVE', NOW(), NOW()),
(3, 1, 5, 1, 'AI Edge Neural Processing Unit', 'PRD-NPU-003', '5 TOPS AI acceleration chip for edge devices', 'PCS', 18.50, 28, 250, 100, 'ACTIVE', NOW(), NOW()),
(4, 1, 5, 1, 'Power Management IC (PMIC)', 'PRD-PMIC-004', 'High-efficiency multi-channel power IC', 'PCS', 2.10, 10, 800, 300, 'ACTIVE', NOW(), NOW()),
(5, 1, 2, 2, 'Surface Mount Ceramic Capacitor 10uF', 'PRD-CAP-005', '0805 10uF 25V X7R ceramic SMT capacitor', 'REEL', 12.50, 5, 100, 30, 'ACTIVE', NOW(), NOW()),
(6, 1, 2, 2, 'Precision Thin Film Resistor Kit', 'PRD-RES-006', '0603 0.1% tolerance precision resistor set', 'KIT', 45.00, 7, 50, 15, 'ACTIVE', NOW(), NOW()),
(7, 1, 4, 2, 'High Current Power Inductor 4.7uH', 'PRD-IND-007', 'Shielded power inductor 15A saturation current', 'PCS', 1.45, 12, 600, 200, 'ACTIVE', NOW(), NOW()),
(8, 1, 4, 2, 'Schottky Barrier Diode Array', 'PRD-DIO-008', '40V 2A dual Schottky diode SOT-23', 'REEL', 18.00, 7, 80, 25, 'ACTIVE', NOW(), NOW()),
(9, 1, 3, 3, 'Extruded Aluminum Enclosure Frame', 'PRD-ALU-009', 'Anodized 6063-T5 aluminum housing profile', 'PCS', 14.20, 14, 300, 100, 'ACTIVE', NOW(), NOW()),
(10, 1, 6, 3, 'High Conductivity Copper Busbar', 'PRD-COP-010', '99.9% pure C11000 copper busbar strip', 'MTR', 8.90, 10, 400, 150, 'ACTIVE', NOW(), NOW()),
(11, 1, 6, 3, 'Stainless Steel Mounting Fasteners', 'PRD-FAS-011', 'M3x8mm 316 stainless steel hex socket screw set', 'BOX', 9.50, 5, 200, 50, 'ACTIVE', NOW(), NOW()),
(12, 1, 7, 4, 'Injection Molded Polymer Chassis', 'PRD-ENG-012', 'ABS/PC flame-retardant V0 molded top cover', 'PCS', 5.60, 18, 500, 200, 'ACTIVE', NOW(), NOW()),
(13, 1, 7, 4, 'IP67 Silicone Gasket Seal', 'PRD-GSK-013', 'Precision molded silicone waterproof seal ring', 'PCS', 0.85, 14, 1000, 400, 'ACTIVE', NOW(), NOW()),
(14, 1, 8, 5, '3.5-inch IPS TFT LCD Display', 'PRD-DSP-014', '320x480 capacitive touch LCD module with SPI', 'PCS', 15.80, 21, 200, 80, 'ACTIVE', NOW(), NOW()),
(15, 1, 8, 5, 'RGB Status LED Matrix Panel', 'PRD-LED-015', 'Addressable RGB LED array module 8x8', 'PCS', 3.75, 10, 400, 150, 'ACTIVE', NOW(), NOW()),
(16, 1, 9, 1, 'Industrial Gateway Motherboard PCB', 'PRD-PCB-016', '6-layer ENIG high-speed PCB assembly', 'PCS', 32.00, 25, 150, 50, 'ACTIVE', NOW(), NOW()),
(17, 1, 9, 2, 'Toroidal Transformer 100VA', 'PRD-TRN-017', '115V/230V to 24V dual output power transformer', 'PCS', 22.50, 20, 100, 40, 'ACTIVE', NOW(), NOW()),
(18, 1, 10, 3, 'Multi-Core Shielded Cable Assembly', 'PRD-CBL-018', '24AWG 8-core industrial Ethernet cable 5m', 'PCS', 7.40, 14, 350, 120, 'ACTIVE', NOW(), NOW()),
(19, 1, 10, 2, 'DIN Rail Power Supply 24V 5A', 'PRD-PWR-019', '120W slim DIN rail AC-DC power module', 'PCS', 28.00, 14, 120, 40, 'ACTIVE', NOW(), NOW()),
(20, 1, 3, 4, 'Thermal Interface Pad 3W/mK', 'PRD-THM-020', 'High-performance silicone thermal gap pad', 'PACK', 11.20, 7, 150, 50, 'ACTIVE', NOW(), NOW()),
(21, 1, 1, 1, 'Flash Memory IC 128Mb NOR SPI', 'PRD-MEM-021', '128Mbit SPI NOR Flash memory 104MHz', 'PCS', 1.85, 10, 600, 250, 'ACTIVE', NOW(), NOW()),
(22, 1, 5, 1, 'Gigabit Ethernet PHY Transceiver', 'PRD-ETH-022', '10/100/1000Mbps Ethernet PHY Chip', 'PCS', 3.40, 14, 400, 150, 'ACTIVE', NOW(), NOW()),
(23, 1, 2, 2, 'Solid Tantalum Capacitor 100uF', 'PRD-TAN-023', 'Size D 100uF 16V low ESR capacitor', 'REEL', 35.00, 10, 60, 20, 'ACTIVE', NOW(), NOW()),
(24, 1, 8, 5, 'Time-of-Flight Distance Sensor', 'PRD-TOF-024', 'Laser ToF range sensor module up to 4m', 'PCS', 8.20, 18, 250, 100, 'ACTIVE', NOW(), NOW()),
(25, 1, 4, 2, 'MEMS 6-Axis Motion Tracking IMU', 'PRD-IMU-025', '3-axis Gyroscope + 3-axis Accelerometer IC', 'PCS', 4.10, 12, 500, 200, 'ACTIVE', NOW(), NOW()),
(26, 1, 7, 4, 'Polycarbonate Front Bezel Panel', 'PRD-BZL-026', 'UV resistant printed PC front panel overlay', 'PCS', 2.90, 15, 800, 300, 'ACTIVE', NOW(), NOW()),
(27, 1, 6, 3, 'Heatsink Aluminum Profile 50mm', 'PRD-HSK-027', 'Black anodized TO-220 aluminum heatsink', 'PCS', 1.15, 7, 1200, 400, 'ACTIVE', NOW(), NOW()),
(28, 1, 9, 1, 'Bluetooth 5.3 Low Energy Module', 'PRD-BLE-028', 'Pre-certified BLE module with integrated antenna', 'PCS', 5.90, 14, 300, 100, 'ACTIVE', NOW(), NOW()),
(29, 1, 3, 3, 'Rugged Waterproof Enclosure Box', 'PRD-ENC-029', 'NEMA 4X / IP66 cast aluminum junction box', 'PCS', 42.00, 21, 80, 25, 'ACTIVE', NOW(), NOW()),
(30, 1, 10, 2, 'Relay Module 4-Channel 10A 24V', 'PRD-RLY-030', 'Optocoupler isolated relay control board', 'PCS', 6.50, 10, 200, 75, 'ACTIVE', NOW(), NOW());

-- 8. Inventory (Stock levels across warehouses)
INSERT INTO inventory (id, organization_id, product_id, warehouse_id, current_stock, reserved_stock, available_stock, incoming_stock, damaged_stock, reorder_level, safety_stock, created_at, updated_at) VALUES
(1, 1, 1, 1, 1200, 200, 1000, 500, 10, 500, 200, NOW(), NOW()),
(2, 1, 1, 2, 350, 50, 300, 0, 0, 500, 200, NOW(), NOW()),
(3, 1, 2, 1, 250, 100, 150, 300, 5, 400, 150, NOW(), NOW()),
(4, 1, 3, 1, 80, 30, 50, 200, 0, 250, 100, NOW(), NOW()), -- Low stock / Stockout risk
(5, 1, 4, 1, 1500, 300, 1200, 0, 12, 800, 300, NOW(), NOW()),
(6, 1, 5, 2, 180, 20, 160, 50, 0, 100, 30, NOW(), NOW()),
(7, 1, 6, 3, 90, 10, 80, 0, 2, 50, 15, NOW(), NOW()),
(8, 1, 7, 1, 450, 150, 300, 400, 8, 600, 200, NOW(), NOW()), -- Low stock
(9, 1, 8, 3, 120, 20, 100, 0, 0, 80, 25, NOW(), NOW()),
(10, 1, 9, 1, 220, 70, 150, 100, 4, 300, 100, NOW(), NOW()),
(11, 1, 10, 4, 600, 100, 500, 0, 15, 400, 150, NOW(), NOW()),
(12, 1, 12, 1, 180, 60, 120, 500, 0, 500, 200, NOW(), NOW()), -- High Stockout risk
(13, 1, 14, 5, 140, 40, 100, 150, 2, 200, 80, NOW(), NOW()),
(14, 1, 16, 4, 300, 50, 250, 0, 0, 150, 50, NOW(), NOW()),
(15, 1, 19, 1, 85, 25, 60, 100, 0, 120, 40, NOW(), NOW()),
(16, 1, 22, 2, 550, 100, 450, 0, 5, 400, 150, NOW(), NOW()),
(17, 1, 25, 1, 400, 100, 300, 200, 0, 500, 200, NOW(), NOW()),
(18, 1, 29, 3, 40, 15, 25, 50, 1, 80, 25, NOW(), NOW());

-- 9. Stock Movements
INSERT INTO stock_movements (id, organization_id, inventory_id, product_id, warehouse_id, type, quantity, previous_quantity, new_quantity, reference_type, reference_id, notes, created_at, created_by) VALUES
(1, 1, 1, 1, 1, 'PURCHASE_RECEIPT', 500, 700, 1200, 'PURCHASE_ORDER', 1, 'Received initial shipment from Global Chiptech', NOW(), 1),
(2, 1, 4, 3, 1, 'DECREASE', -50, 130, 80, 'PRODUCTION_ORDER', 101, 'Allocated for IoT Gateway Assembly Line', NOW(), 2),
(3, 1, 8, 7, 1, 'CORRECTION', 50, 400, 450, 'INVENTORY_AUDIT', 201, 'Quarterly audit inventory reconciliation', NOW(), 3);

-- 10. Purchase Orders (20 orders)
INSERT INTO purchase_orders (id, organization_id, supplier_id, po_number, order_date, expected_delivery_date, actual_delivery_date, status, subtotal, tax, total_amount, notes, created_by, created_at, updated_at) VALUES
(1, 1, 1, 'PO-2026-001', '2026-08-01', '2026-08-15', '2026-08-14', 'COMPLETED', 4850.00, 485.00, 5335.00, 'Priority MCU chips for Q3 production', 1, NOW(), NOW()),
(2, 1, 2, 'PO-2026-002', '2026-08-05', '2026-08-12', '2026-08-13', 'COMPLETED', 2250.00, 225.00, 2475.00, 'Capacitor reels and resistor sets', 2, NOW(), NOW()),
(3, 1, 5, 'PO-2026-003', '2026-08-10', '2026-09-07', NULL, 'IN_TRANSIT', 9250.00, 925.00, 10175.00, 'AI Edge Neural processing units', 2, NOW(), NOW()),
(4, 1, 3, 'PO-2026-004', '2026-08-15', '2026-08-29', NULL, 'CONFIRMED', 4260.00, 426.00, 4686.00, 'Aluminum enclosures & power pads', 1, NOW(), NOW()),
(5, 1, 4, 'PO-2026-005', '2026-08-20', '2026-09-01', NULL, 'APPROVED', 1450.00, 145.00, 1595.00, 'Power inductors & Schottky diodes', 2, NOW(), NOW()),
(6, 1, 6, 'PO-2026-006', '2026-08-22', '2026-09-02', NULL, 'PARTIALLY_RECEIVED', 5340.00, 534.00, 5874.00, 'Copper busbars and SS fasteners', 1, NOW(), NOW()),
(7, 1, 7, 'PO-2026-007', '2026-08-25', '2026-09-12', NULL, 'SUBMITTED', 3650.00, 365.00, 4015.00, 'Polymer chassis molding batch 2', 2, NOW(), NOW()),
(8, 1, 8, 'PO-2026-008', '2026-08-28', '2026-09-18', NULL, 'DRAFT', 4660.00, 466.00, 5126.00, 'IPS TFT displays & LED panels', 1, NOW(), NOW());

-- 11. Purchase Order Items
INSERT INTO purchase_order_items (id, purchase_order_id, product_id, quantity, received_quantity, unit_price, tax, total_price) VALUES
(1, 1, 1, 1000, 1000, 4.85, 485.00, 5335.00),
(2, 2, 5, 100, 100, 12.50, 125.00, 1375.00),
(3, 2, 6, 20, 20, 45.00, 90.00, 990.00),
(4, 3, 3, 500, 0, 18.50, 925.00, 10175.00),
(5, 4, 9, 300, 0, 14.20, 426.00, 4686.00),
(6, 5, 7, 1000, 0, 1.45, 145.00, 1595.00),
(7, 6, 10, 400, 200, 8.90, 356.00, 3916.00),
(8, 6, 11, 200, 200, 9.50, 190.00, 2090.00);

-- 12. Shipments (15 shipments)
INSERT INTO shipments (id, organization_id, purchase_order_id, shipment_number, origin, destination, carrier, tracking_number, status, expected_delivery_date, actual_delivery_date, delay_risk_score, risk_level, created_at, updated_at) VALUES
(1, 1, 1, 'SHP-2026-001', 'Tokyo, Japan', 'Chicago, USA', 'DHL Express', 'DHL-987123412', 'DELIVERED', '2026-08-15 14:00:00', '2026-08-14 11:30:00', 12.5, 'LOW', NOW(), NOW()),
(2, 1, 2, 'SHP-2026-002', 'San Jose, CA', 'Los Angeles, CA', 'FedEx Freight', 'FDX-551982734', 'DELIVERED', '2026-08-12 17:00:00', '2026-08-13 09:15:00', 35.0, 'LOW', NOW(), NOW()),
(3, 1, 3, 'SHP-2026-003', 'Hsinchu, Taiwan', 'Chicago, USA', 'Maersk Line', 'MAE-882736192', 'IN_TRANSIT', '2026-09-07 18:00:00', NULL, 78.5, 'HIGH', NOW(), NOW()),
(4, 1, 4, 'SHP-2026-004', 'Munich, Germany', 'Newark, NJ', 'Kuehne + Nagel', 'KN-441209381', 'PICKED_UP', '2026-08-29 12:00:00', NULL, 22.0, 'LOW', NOW(), NOW()),
(5, 1, 6, 'SHP-2026-005', 'Birmingham, UK', 'Rotterdam, NL', 'DB Schenker', 'DBS-991283741', 'DELAYED', '2026-09-02 16:00:00', NULL, 85.0, 'CRITICAL', NOW(), NOW()),
(6, 1, 5, 'SHP-2026-006', 'Paris, France', 'Chicago, USA', 'Air France Cargo', 'AF-301928374', 'OUT_FOR_DELIVERY', '2026-09-05 15:00:00', NULL, 45.0, 'MEDIUM', NOW(), NOW());

-- 13. Shipment Events
INSERT INTO shipment_events (id, shipment_id, status, location, description, event_time) VALUES
(1, 1, 'CREATED', 'Tokyo, Japan', 'Shipment booking confirmed by Global Chiptech', '2026-08-02 09:00:00'),
(2, 1, 'PICKED_UP', 'Tokyo Haneda Airport', 'Cargo picked up by DHL Express', '2026-08-03 14:30:00'),
(3, 1, 'IN_TRANSIT', 'O''Hare Airport, Chicago', 'Cleared customs and arrived at hub', '2026-08-13 18:45:00'),
(4, 1, 'DELIVERED', 'Chicago Warehouse', 'Successfully delivered and signed by Marcus Vance', '2026-08-14 11:30:00'),
(5, 3, 'CREATED', 'Hsinchu Science Park', 'Export documentation completed', '2026-08-11 10:00:00'),
(6, 3, 'PICKED_UP', 'Port of Kaohsiung', 'Loaded onto container vessel Vessel-Voyage 402E', '2026-08-14 16:20:00'),
(7, 3, 'DELAYED', 'Pacific Ocean En-Route', 'Port congestion at Long Beach causing 4-day berth delay', '2026-08-28 08:00:00'),
(8, 5, 'DELAYED', 'English Channel Maritime', 'Customs clearance audit hold at UK export border', '2026-08-29 11:15:00');

-- 14. AI Insights
INSERT INTO ai_insights (id, organization_id, type, title, description, severity, recommended_action, confidence, entity_type, entity_id, created_at) VALUES
(1, 1, 'INVENTORY_RISK', 'Critical Stockout Alert: AI Edge NPU Chip', 'Available stock for ARM Cortex NPU (PRD-NPU-003) is at 50 units, which is 50% below the safety stock threshold of 100 units. High risk of line stoppage within 5 days.', 'CRITICAL', 'Expedite Purchase Order PO-2026-003 via air freight or issue secondary PO to alternative Taiwan supplier.', 0.94, 'PRODUCT', 3, NOW()),
(2, 1, 'SHIPMENT_RISK', 'Shipment Delay Alert: SHP-2026-005 (Copper Busbars)', 'Shipment SHP-2026-005 from Titan Materials is currently flagged for customs hold. Historical supplier delay rate is 35%. Predicted delay is 4-6 business days.', 'HIGH', 'Contact UK logistics broker to submit supplemental customs declaration docs.', 0.88, 'SHIPMENT', 5, NOW()),
(3, 1, 'SUPPLIER_PERFORMANCE', 'Supplier Degradation: Titan Materials Ltd', 'Titan Materials on-time delivery rate has dropped from 85% to 65% over the past 60 days with average delay of 5.2 days.', 'MEDIUM', 'Initiate quarterly vendor review meeting and reallocate 20% order volume to Nordic Precision.', 0.82, 'SUPPLIER', 6, NOW()),
(4, 1, 'DEMAND_TREND', 'Surge Demand Detected: Wireless Wi-Fi SoC', 'Monthly demand trend for Wi-Fi SoC (PRD-WIFI-002) is projecting a 28% increase next month based on recent order velocity.', 'INFO', 'Increase reorder level from 400 to 550 units for WH-CHI-01.', 0.91, 'PRODUCT', 2, NOW());

-- 15. Notifications
INSERT INTO notifications (id, organization_id, user_id, type, title, message, `read`, reference_type, reference_id, created_at) VALUES
(1, 1, 1, 'LOW_STOCK', 'Low Stock Warning', 'Product ARM Cortex Microcontroller (PRD-MCU-001) is approaching reorder level.', FALSE, 'PRODUCT', 1, NOW()),
(2, 1, 1, 'HIGH_RISK_SHIPMENT', 'High Delay Risk Detected', 'Shipment SHP-2026-003 delay risk score increased to 78.5 (HIGH).', FALSE, 'SHIPMENT', 3, NOW()),
(3, 1, 1, 'PURCHASE_ORDER_UPDATE', 'PO Status Changed', 'Purchase Order PO-2026-006 status updated to PARTIALLY_RECEIVED.', TRUE, 'PURCHASE_ORDER', 6, NOW()),
(4, 1, 2, 'AI_INSIGHT', 'New AI Risk Insight Generated', 'Critical Stockout Alert for AI Edge NPU Chip requiring immediate action.', FALSE, 'AI_INSIGHT', 1, NOW());

-- 16. Audit Logs
INSERT INTO audit_logs (id, organization_id, user_id, user_email, action, entity, entity_id, details, timestamp) VALUES
(1, 1, 1, 'admin@novatech.com', 'LOGIN', 'USER', 1, 'User logged in successfully from IP 192.168.1.50', NOW()),
(2, 1, 1, 'admin@novatech.com', 'CREATE', 'PURCHASE_ORDER', 1, 'Created purchase order PO-2026-001 for Global Chiptech', NOW()),
(3, 1, 3, 'warehouse@novatech.com', 'STATUS_CHANGE', 'SHIPMENT', 1, 'Updated shipment SHP-2026-001 status to DELIVERED', NOW());
