-- Migración: Actualizar estados de pedidos para consistencia
-- Fecha: 2024-12-01
-- Descripción: Cambia los estados de pedidos a la nueva nomenclatura estándar

-- PASO 1: Modificar el enum de la tabla pedidos
ALTER TABLE pedidos
MODIFY COLUMN estado ENUM(
  'pendiente',
  'en_preparacion',
  'listo',
  'entregado',
  'cancelado'
) DEFAULT 'pendiente';

-- PASO 2: Actualizar registros existentes con estados antiguos (si existen)
UPDATE pedidos SET estado = 'en_preparacion' WHERE estado = 'en cocina';
UPDATE pedidos SET estado = 'entregado' WHERE estado = 'servido';
UPDATE pedidos SET estado = 'entregado' WHERE estado = 'pagado';

-- PASO 3: Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario_fecha ON pedidos(usuario_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_platillos_activo ON platillos(activo);
CREATE INDEX IF NOT EXISTS idx_platillos_categoria ON platillos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_detalle_pedido_pedido ON detalle_pedido(pedido_id);
CREATE INDEX IF NOT EXISTS idx_detalle_pedido_platillo ON detalle_pedido(platillo_id);

-- PASO 4: Agregar trigger para mantener total actualizado
DELIMITER //

DROP TRIGGER IF EXISTS after_detalle_insert//
CREATE TRIGGER after_detalle_insert
AFTER INSERT ON detalle_pedido
FOR EACH ROW
BEGIN
    UPDATE pedidos
    SET total = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM detalle_pedido
        WHERE pedido_id = NEW.pedido_id
    )
    WHERE id = NEW.pedido_id;
END//

DROP TRIGGER IF EXISTS after_detalle_update//
CREATE TRIGGER after_detalle_update
AFTER UPDATE ON detalle_pedido
FOR EACH ROW
BEGIN
    UPDATE pedidos
    SET total = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM detalle_pedido
        WHERE pedido_id = NEW.pedido_id
    )
    WHERE id = NEW.pedido_id;
END//

DROP TRIGGER IF EXISTS after_detalle_delete//
CREATE TRIGGER after_detalle_delete
AFTER DELETE ON detalle_pedido
FOR EACH ROW
BEGIN
    UPDATE pedidos
    SET total = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM detalle_pedido
        WHERE pedido_id = OLD.pedido_id
    )
    WHERE id = OLD.pedido_id;
END//

DELIMITER ;

-- PASO 5: Verificación
SELECT 'Migración completada exitosamente' AS status;
SELECT COUNT(*) AS total_pedidos, estado
FROM pedidos
GROUP BY estado;
