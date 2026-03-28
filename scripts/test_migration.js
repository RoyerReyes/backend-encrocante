const poll = async () => {
    try {
        console.log(new Date().toISOString() + " - Polling /pedidos/run-migration...");
        const r = await fetch('https://backend-encrocante.onrender.com/pedidos/run-migration');
        const text = await r.text();
        console.log("Status:", r.status, "Body:", text);
        if (r.status === 200 && text.includes("success")) {
            console.log("✅ EXITITO!");
            process.exit(0);
        }
    } catch(e) {
        console.error(e);
    }
    setTimeout(poll, 10000);
};
poll();
