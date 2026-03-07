-- Migración: Actualizar estados de pedidos
-- PASO 1: Modificar enum de estados
ALTER TABLE pedidos MODIFY COLUMN estado ENUM('pendiente','en_preparacion','listo','entregado','cancelado') DEFAULT 'pendiente';

-- PASO 2: Actualizar datos existentes
UPDATE pedidos SET estado = 'en_preparacion' WHERE estado = 'en cocina';
UPDATE pedidos SET estado = 'entregado' WHERE estado = 'servido';
UPDATE pedidos SET estado = 'entregado' WHERE estado = 'pagado';

-- PASO 3: Crear índices (DROP IF EXISTS primero)
DROP INDEX IF EXISTS idx_pedidos_estado ON pedidos;
CREATE INDEX idx_pedidos_estado ON pedidos(estado);

DROP INDEX IF EXISTS idx_pedidos_usuario_fecha ON pedidos;
CREATE INDEX idx_pedidos_usuario_fecha ON pedidos(usuario_id, fecha DESC);

DROP INDEX IF EXISTS idx_platillos_activo ON platillos;
CREATE INDEX idx_platillos_activo ON platillos(activo);

DROP INDEX IF EXISTS idx_platillos_categoria ON platillos;
CREATE INDEX idx_platillos_categoria ON platillos(categoria_id);

DROP INDEX IF EXISTS idx_detalle_pedido_pedido ON detalle_pedido;
CREATE INDEX idx_detalle_pedido_pedido ON detalle_pedido(pedido_id);

DROP INDEX IF EXISTS idx_detalle_pedido_platillo ON detalle_pedido;
CREATE INDEX idx_detalle_pedido_platillo ON detalle_pedido(platillo_id);

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

SELECT 'Migración completada' AS status;
