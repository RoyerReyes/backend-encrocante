const socket = io();

// Elementos del DOM
const cookingList = document.getElementById('cooking-list');
const readyList = document.getElementById('ready-list');
const statusIndicator = document.getElementById('status-indicator');

// Estados relevantes
const STATE_COOKING = 'en_preparacion';
const STATE_READY = 'listo';

// Audio Context para notificaciones
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playNotificationSound() {
    // Generar un sonido "Ding-Dong" sintético agradable
    if (!audioCtx) initAudio();
    if (!audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Configuración del tono
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // Do (C5)
    oscillator.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.1); // Mi (E5)

    // Configuración del volumen (envelope)
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1.5);
}

// Renderizar tarjeta de pedido
function renderOrderCard(pedido, container) {
    // Evitar duplicados
    const existingCard = document.getElementById(`order-${pedido.id}`);
    if (existingCard) existingCard.remove();

    // Solo renderizar si el estado corresponde a la columna
    if (container.id === 'cooking-list' && pedido.estado !== STATE_COOKING) return;
    if (container.id === 'ready-list' && pedido.estado !== STATE_READY) return;

    const card = document.createElement('div');
    card.className = 'order-card';
    card.id = `order-${pedido.id}`;

    // Si es "Listo", añadir animación de highlight
    if (pedido.estado === STATE_READY) {
        card.classList.add('highlight');
    }

    // Usar número de mesa si existe, sino ID (últimos 3 dígitos)
    // Usar número de mesa si existe, sino ID (últimos 3 dígitos)
    let displayNum = `P-${String(pedido.id).slice(-3)}`;

    if (pedido.mesa) {
        // Si ya incluye "Mesa" (insensitive), se usa tal cual. Si no, se agrega el prefijo.
        if (pedido.mesa.toString().toLowerCase().includes('mesa')) {
            displayNum = pedido.mesa;
        } else {
            displayNum = `Mesa ${pedido.mesa}`;
        }
    }

    card.innerHTML = `
        <span class="order-number">${displayNum}</span>
        <span class="customer-name">${pedido.nombre_cliente || 'Cliente'}</span>
    `;

    container.appendChild(card);
}

// Eliminar tarjeta (cuando pasa a entregado/pagado)
function removeOrderCard(pedidoId) {
    const card = document.getElementById(`order-${pedidoId}`);
    if (card) {
        card.style.opacity = '0';
        setTimeout(() => card.remove(), 500);
    }
}

// Actualizar indicador de conexión
function updateConnectionStatus(connected) {
    if (statusIndicator) {
        statusIndicator.className = connected ? 'connected' : 'disconnected';
        statusIndicator.title = connected ? 'Conectado al sistema' : 'Desconectado - Reintentando...';
    }
}

// ----- SOCKET EVENTS -----

socket.on('connect', () => {
    console.log('Conectado al servidor de pedidos');
    updateConnectionStatus(true);
});

socket.on('disconnect', () => {
    console.warn('Desconectado del servidor');
    updateConnectionStatus(false);
});

// Datos Iniciales (Robustez: Carga al refrescar)
socket.on('initial_data', (pedidos) => {
    console.log('Recibidos datos iniciales:', pedidos.length);
    // Limpiar listas
    cookingList.innerHTML = '';
    readyList.innerHTML = '';

    // Renderizar
    pedidos.forEach(p => {
        if (p.estado === STATE_COOKING) renderOrderCard(p, cookingList);
        else if (p.estado === STATE_READY) renderOrderCard(p, readyList);
    });
});

// Pedido Creado
socket.on('pedido_creado', (pedido) => {
    console.log('Nuevo pedido:', pedido);
    if (pedido.estado === STATE_COOKING) {
        renderOrderCard(pedido, cookingList);
    }
});

// Estado Actualizado
socket.on('estado_actualizado', ({ id, estado, pedido }) => {
    console.log(`Pedido ${id} cambio a ${estado}`);

    removeOrderCard(id);

    if (estado === STATE_COOKING) {
        renderOrderCard(pedido, cookingList);
    } else if (estado === STATE_READY) {
        renderOrderCard(pedido, readyList);
        playNotificationSound(); // 🔔 Ding!
    }
});

// Activar audio al primer click (política de navegadores)
document.addEventListener('click', initAudio, { once: true });
