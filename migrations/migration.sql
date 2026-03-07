ALTER TABLE pedidos MODIFY COLUMN estado ENUM('pendiente','en_preparacion','listo','entregado','cancelado') DEFAULT 'pendiente';
UPDATE pedidos SET estado = 'en_preparacion' WHERE estado = 'en cocina';
UPDATE pedidos SET estado = 'entregado' WHERE estado = 'servido';
UPDATE pedidos SET estado = 'entregado' WHERE estado = 'pagado';
DELIMITER //
DROP TRIGGER IF EXISTS after_detalle_insert//
CREATE TRIGGER after_detalle_insert AFTER INSERT ON detalle_pedido FOR EACH ROW BEGIN UPDATE pedidos SET total = (SELECT COALESCE(SUM(subtotal), 0) FROM detalle_pedido WHERE pedido_id = NEW.pedido_id) WHERE id = NEW.pedido_id; END//
DROP TRIGGER IF EXISTS after_detalle_update//
CREATE TRIGGER after_detalle_update AFTER UPDATE ON detalle_pedido FOR EACH ROW BEGIN UPDATE pedidos SET total = (SELECT COALESCE(SUM(subtotal), 0) FROM detalle_pedido WHERE pedido_id = NEW.pedido_id) WHERE id = NEW.pedido_id; END//
DROP TRIGGER IF EXISTS after_detalle_delete//
CREATE TRIGGER after_detalle_delete AFTER DELETE ON detalle_pedido FOR EACH ROW BEGIN UPDATE pedidos SET total = (SELECT COALESCE(SUM(subtotal), 0) FROM detalle_pedido WHERE pedido_id = OLD.pedido_id) WHERE id = OLD.pedido_id; END//
DELIMITER ;
SELECT 'Migracion completada' AS status;
