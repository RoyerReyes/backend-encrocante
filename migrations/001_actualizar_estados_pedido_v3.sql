-- Migración: Actualizar estados de pedidos
-- PASO 1: Modificar enum de estados
ALTER TABLE pedidos MODIFY COLUMN estado ENUM('pendiente','en_preparacion','listo','entregado','cancelado') DEFAULT 'pendiente';

-- PASO 2: Actualizar datos existentes
UPDATE pedidos SET estado = 'en_preparacion' WHERE estado = 'en cocina';
UPDATE pedidos SET estado = 'entregado' WHERE estado = 'servido';
UPDATE pedidos SET estado = 'entregado' WHERE estado = 'pagado';

-- PASO 3: Crear índices
ALTER TABLE pedidos ADD INDEX idx_pedidos_estado (estado);
ALTER TABLE pedidos ADD INDEX idx_pedidos_usuario_fecha (usuario_id, fecha DESC);
ALTER TABLE platillos ADD INDEX idx_platillos_activo (activo);
ALTER TABLE platillos ADD INDEX idx_platillos_categoria (categoria_id);
ALTER TABLE detalle_pedido ADD INDEX idx_detalle_pedido_pedido (pedido_id);
ALTER TABLE detalle_pedido ADD INDEX idx_detalle_pedido_platillo (platillo_id);

-- PASO 4: Triggers para totales automáticos
DELIMITER //

DROP TRIGGER IF EXISTS after_detalle_insert//
CREATE TRIGGER after_detalle_insert
AFTER INSERT ON detalle_pedido
FOR EACH ROW
BEGIN
    UPDATE pedidos SET total = (
        SELECT COALESCE(SUM(subtotal), 0) FROM detalle_pedido WHERE pedido_id = NEW.pedido_id
    ) WHERE id = NEW.pedido_id;
END//

DROP TRIGGER IF EXISTS after_detalle_update//
CREATE TRIGGER after_detalle_update
AFTER UPDATE ON detalle_pedido
FOR EACH ROW
BEGIN
    UPDATE pedidos SET total = (
        SELECT COALESCE(SUM(subtotal), 0) FROM detalle_pedido WHERE pedido_id = NEW.pedido_id
    ) WHERE id = NEW.pedido_id;
END//

DROP TRIGGER IF EXISTS after_detalle_delete//
CREATE TRIGGER after_detalle_delete
AFTER DELETE ON detalle_pedido
FOR EACH ROW
BEGIN
    UPDATE pedidos SET total = (
        SELECT COALESCE(SUM(subtotal), 0) FROM detalle_pedido WHERE pedido_id = OLD.pedido_id
    ) WHERE id = OLD.pedido_id;
END//

DELIMITER ;

SELECT 'Migración completada exitosamente' AS status;
