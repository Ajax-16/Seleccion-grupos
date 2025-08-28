// ---- Pantalla inicial ----
function changeSection() {
    const groupAmount = parseInt(document.getElementById("group-amount").value) || 0;
    const maxTotal = parseInt(document.getElementById("max-money").value) || 2000;

    if (groupAmount <= 0) { 
        alert("Introduce un número válido de grupos."); 
        return; 
    }

    const groups = [];
    for (let i = 0; i < groupAmount; i++) {
        groups.push({ id: i + 1, name: `Grupo ${i + 1}`, points: 0 });
    }

    localStorage.setItem("groups", JSON.stringify(groups));
    localStorage.setItem("maxPoints", maxTotal); 

    window.location.href = "orden.html";
}

// ---- Ranking ----
let currentGroupId = null;

function renderGroups() {
    const groups = JSON.parse(localStorage.getItem("groups")) || [];
    const container = document.getElementById("group-list");
    if (!container) return;

    const sortedGroups = [...groups].sort((a, b) => a.points - b.points);
    container.innerHTML = "";

    sortedGroups.forEach((g, i) => {
        let icon = "fa-users";
        let extraClass = "";
        let badge = "";

        if (i === 0) {
            extraClass = "border-2 border-yellow-400 shadow-yellow-400 shadow-lg";
            badge = `<span class="ml-3 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">PRIORITARIO</span>`;
        }

        const div = document.createElement("div");
        div.className = `fade-in bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transform transition hover:scale-105 hover:bg-white/20 ${extraClass}`;
        div.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <i class="fa ${icon} text-3xl ${i===0?"text-yellow-400":"text-yellow-300"}"></i>
            <div class="flex items-center">
                <h3 class="text-xl font-semibold">${g.name}</h3>
            </div>
            <p class="text-sm opacity-80 sm:ml-3">${i+1}º posición</p>
            ${badge}
        </div>
        <div class="flex flex-col items-end gap-4">
            <p class="text-lg font-bold text-yellow-300">${g.points} exo$</p>
            <button class="assign-btn cursor-pointer bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-lg text-sm font-semibold shadow" data-id="${g.id}">
                Asignar respuesta
            </button>
        </div>
        `;
        container.appendChild(div);

        const btn = div.querySelector(".assign-btn");
        btn.addEventListener("click", () => openModal(g.id));
    });

    updateTotalMoney();
}

// ---- Modal ----
function openModal(id) {
    const max = parseInt(localStorage.getItem("maxPoints")) || 0;
    const groups = JSON.parse(localStorage.getItem("groups")) || [];
    const total = groups.reduce((acc, g) => acc + g.points, 0);
    if (total >= max) return; // bloquear si ya se llegó al máximo

    currentGroupId = id;
    document.getElementById("response-modal").classList.remove("hidden");
    document.getElementById("modal-title").innerText = `Asignar respuesta a Grupo ${id}`;
}

function closeModal() {
    document.getElementById("response-modal").classList.add("hidden");
    currentGroupId = null;
}

// ---- Añadir puntos ----
function addPointsModal(points) {
    const groups = JSON.parse(localStorage.getItem("groups")) || [];
    const max = parseInt(localStorage.getItem("maxPoints")) || 0;
    const total = groups.reduce((acc, g) => acc + g.points, 0);

    if (currentGroupId !== null && total < max) {
        const group = groups.find(g => g.id === currentGroupId);
        if (group) {
            group.points += points;

            // si excede el máximo, ajustamos al máximo
            const newTotal = groups.reduce((acc, g) => acc + g.points, 0);
            if (newTotal > max) {
                group.points -= (newTotal - max);
            }

            localStorage.setItem("groups", JSON.stringify(groups));
            renderGroups();

            // si ya llegamos al máximo, mostrar estadísticas
            const finalTotal = groups.reduce((acc, g) => acc + g.points, 0);
            if (finalTotal >= max) showFinalStats();
        }
    }

    closeModal();
}

// ---- Mostrar estadísticas finales ----
function showFinalStats() {
    const groups = JSON.parse(localStorage.getItem("groups")) || [];
    const total = groups.reduce((acc, g) => acc + g.points, 0);

    // Ordenar de mayor a menor
    const sortedGroups = [...groups].sort((a, b) => b.points - a.points);

    const container = document.createElement("div");
    container.className = "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4";

    const modal = document.createElement("div");
    modal.className = "bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-6";

    const title = document.createElement("h2");
    title.className = "text-2xl font-bold text-center text-black";
    title.innerHTML = '<i class="fa fa-line-chart mr-2"></i> Estadísticas finales';
    modal.appendChild(title);

    sortedGroups.forEach((g, idx) => {
        const wrapper = document.createElement("div");
        wrapper.className = "flex flex-col gap-1";

        const label = document.createElement("div");
        label.className = "flex justify-between text-sm font-semibold text-gray-800";
        label.innerHTML = `<span>${g.name}</span><span>${g.points} exo$</span>`;

        const barWrapper = document.createElement("div");
        barWrapper.className = "w-full bg-gray-300 rounded-full h-6 relative";

        const bar = document.createElement("div");
        const percent = total === 0 ? 0 : Math.round((g.points / total) * 100);
        bar.className = "h-6 rounded-full transition-all duration-700";

        // Colores distintos por grupo
        const colors = ["bg-yellow-500", "bg-orange-400", "bg-red-500", "bg-green-500", "bg-blue-500", "bg-purple-500"];
        bar.classList.add(colors[idx % colors.length]);
        bar.style.width = percent + "%";

        const percentLabel = document.createElement("span");
        percentLabel.className = "absolute right-2 top-0 text-sm font-bold text-black";
        percentLabel.innerText = percent + "%";

        barWrapper.appendChild(bar);
        barWrapper.appendChild(percentLabel);

        wrapper.appendChild(label);
        wrapper.appendChild(barWrapper);
        modal.appendChild(wrapper);
    });

    const closeBtn = document.createElement("button");
    closeBtn.className = "mt-4 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg transition";
    closeBtn.innerText = "Cerrar";
    closeBtn.addEventListener("click", () => container.remove());
    modal.appendChild(closeBtn);

    container.appendChild(modal);
    document.body.appendChild(container);

    // Bloquear todos los botones de asignar
    document.querySelectorAll(".assign-btn").forEach(b => b.disabled = true);
}

// ---- HUD de dinero total ----
function updateTotalMoney() {
    const groups = JSON.parse(localStorage.getItem("groups")) || [];
    const total = groups.reduce((acc, g) => acc + g.points, 0);
    const max = parseInt(localStorage.getItem("maxPoints")) || 0;

    const el = document.getElementById("money-value");
    if (el) el.innerText = `${total} / ${max} exo$`;
}

// ---- Detectar pantalla y reinicio ----
window.addEventListener("DOMContentLoaded", () => {
    renderGroups();

    const resetBtn = document.getElementById("reset-btn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            localStorage.removeItem("groups");
            localStorage.removeItem("maxPoints");
            window.location.href = "index.html";
        });
    }
});
