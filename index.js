
// function checkCalculateButton() {
//     const btn = document.getElementById("calculateBtn");
//     if (!btn) return;

//     const inputs = [
//         { id: "aat1", min: 0, max: 10 },
//         { id: "aat2", min: 0, max: 10 },
//         { id: "mid1", min: 0, max: 35 },
//         { id: "mid2", min: 0, max: 35 }
//     ];

//     for (let input of inputs) {
//         const el = document.getElementById(input.id);
//         if (!el) return btn.disabled = true;

//         const valRaw = el.value;
//         const val = Number(valRaw);

//         if (valRaw === "" || isNaN(val) || val < input.min || val > input.max) {
//             btn.disabled = true;
//             return;
//         }
//         if ((input.id.startsWith("aat") && val > 10) || (input.id.startsWith("mid") && val > 35)) {
//             btn.disabled = true;
//             return;
//         }
//     }

//     btn.disabled = false;
// }


function checkCalculateButton() {
    const btn = document.getElementById("calculateBtn");
    if (!btn) return;

    const inputs = [
        { id: "aat1", min: 0, max: 10 },
        { id: "aat2", min: 0, max: 10 },
        { id: "mid1", min: 0, max: 35 },
        { id: "mid2", min: 0, max: 35 }
    ];

    for (let input of inputs) {
        const el = document.getElementById(input.id);
        if (!el) {
            btn.disabled = true;
            return;
        }

        const valRaw = el.value;
        const val = Number(valRaw);

        // ❌ Empty OR invalid OR negative OR beyond range → disable
        if (
            valRaw === "" ||
            isNaN(val) ||
            val < input.min ||      // catches negative values
            val > input.max         // catches overflow
        ) {
            btn.disabled = true;
            return;
        }
    }

    // ✔ All values valid
    btn.disabled = false;
}













function validate(id, min, max, errId) {
    const el = document.getElementById(id);
    const raw = el.value;
    const num = Number(raw);

    const errEl = document.getElementById(errId);

    // invalid when empty, not a number, or out of range
    if (raw === "" || isNaN(num) || num < min || num > max) {
        errEl.style.display = "block";
        el.classList.add("invalid");
        return false;
    }

    errEl.style.display = "none";
    el.classList.remove("invalid");
    return true;
}

// Attach real-time validation listeners after DOM ready
document.addEventListener("DOMContentLoaded", function () {
    const inputs = [
        { id: "aat1", min: 0, max: 10, err: "err1" },
        { id: "aat2", min: 0, max: 10, err: "err2" },
        { id: "mid1", min: 0, max: 35, err: "err3" },
        { id: "mid2", min: 0, max: 35, err: "err4" },
    ];

    inputs.forEach(cfg => {
        const el = document.getElementById(cfg.id);
        if (!el) return;

        // validate on every input change (typing/paste) and on blur
        el.addEventListener("input", () => {
            validate(cfg.id, cfg.min, cfg.max, cfg.err);
            checkCalculateButton();
        });
        el.addEventListener("blur", () => {
            validate(cfg.id, cfg.min, cfg.max, cfg.err);
            checkCalculateButton();
        });
    });

    checkCalculateButton();
});

function calculate() {
    // Run validation for side-effects (show/hide errors) but only require AAT-1 and MID-1
    const ok1 = validate("aat1", 0, 10, "err1");
    validate("aat2", 0, 10, "err2"); // validate for UI feedback but don't block
    const ok3 = validate("mid1", 0, 35, "err3");
    validate("mid2", 0, 35, "err4"); // validate for UI feedback but don't block

    // Require at least AAT-1 and MID-1 to be valid numbers in range
    if (!(ok1 && ok3)) return;

    // Read values; if optional fields are missing/invalid, treat them as 0
    const a1 = Number(document.getElementById('aat1').value) || 0;
    const a2Raw = document.getElementById('aat2').value;
    const a2 = (!a2Raw || isNaN(Number(a2Raw))) ? 0 : Number(a2Raw);
    const m1 = Number(document.getElementById('mid1').value) || 0;
    const m2Raw = document.getElementById('mid2').value;
    const m2 = (!m2Raw || isNaN(Number(m2Raw))) ? 0 : Number(m2Raw);



    // FINAL RANGE VALIDATION BEFORE CALCULATION
if (
    a1 < 0 || a1 > 10 ||
    a2 < 0 || a2 > 10 ||
    m1 < 0 || m1 > 35 ||
    m2 < 0 || m2 > 35
) {
    document.getElementById("result").innerHTML =
        "<span style='color:#ff4d4d;'>❗ Invalid Marks Entered</span><br>" +
        "AAT must be between 0–10 and MID must be between 0–35.";
    return;
}

    const avgAAT = (a1 + a2) / 2;

    let bestMid = 0, secondMid = 0;
    if (m1 >= m2) {
        bestMid = m1 * 0.43;
        secondMid = m2 * 0.14;
    } else {
        bestMid = m2 * 0.43;
        secondMid = m1 * 0.14;
    }

    const internal = Math.ceil(avgAAT + bestMid + secondMid);
// FINAL VALIDATION BEFORE DISPLAYING RESULT
// internal must be between 0 and 30

   // PASS / FAIL CHECK
    const minPass = 15;

    if (internal >= minPass) {
        document.getElementById("result").innerHTML =
            "Total Internal Marks: " + internal +
            "<br><span style='color:#00ff99;'>✔ Qualified for End Semester Exam</span>";
    } else {
        const needed = minPass - internal;
        document.getElementById("result").innerHTML =
            "Total Internal Marks: " + internal +
            "<br><span style='color:#ff4d4d;'>✘ Not Qualified</span>" +
            "<br>You need <b>" + needed + "</b> more marks to pass.";
}

// ---------------------------------------------------
// MINIMUM REQUIREMENT LOGIC (ACCURATE MATCHING FORMULA)
// ---------------------------------------------------
if (internal < minPass) {

    const userA2exists = a2Raw !== "" && !isNaN(a2);
    const userM2exists = m2Raw !== "" && !isNaN(m2);

    // RULE 3: If user entered both AAT-2 and MID-2 → no suggestions
    if (userA2exists && userM2exists) return;

    let bestA = null, bestM = null;
    let minTotal = Infinity; // for combination comparison

    // Try all combinations
    for (let A = 0; A <= 10; A++) {
        for (let M = 0; M <= 35; M++) {

            // RULE 1: If user entered AAT-2 → A is fixed
            if (userA2exists && A !== a2) continue;

            // RULE 2: If user did NOT enter AAT-2 → allow the loop
            // (no need to change anything)

            // ---- Simulate the correct formula ----
            const avgSim = (a1 + A) / 2;

            let bestSim, secondSim;
            if (m1 >= M) {
                bestSim = m1 * 0.43;
                secondSim = M * 0.14;
            } else {
                bestSim = M * 0.43;
                secondSim = m1 * 0.14;
            }

            const simInternal = Math.ceil(avgSim + bestSim + secondSim);

            if (simInternal >= minPass) {
                let totalMarks = A + M;

                if (totalMarks < minTotal) {
                    minTotal = totalMarks;
                    bestA = A;
                    bestM = M;
                }
            }
        }
    }

    // Display results
    if (bestA !== null && bestM !== null) {

        // RULE 1: User did NOT enter AAT-2 → show both
        if (!userA2exists) {
            document.getElementById("result").innerHTML += `
                <br><br><span style="color:#79cfff;">Minimum Marks Needed:</span><br>
                AAT-2 Required: <b>${bestA}</b> marks<br>
                MID-2 Required: <b>${bestM}</b> marks
            `;
        }

        // RULE 2: User entered AAT-2 → show only MID-2
        else {
            document.getElementById("result").innerHTML += `
                <br><br><span style="color:#79cfff;">Minimum Marks Needed:</span><br>
                MID-2 Required: <b>${bestM}</b> marks`;
        }
    }
}


}
const canvas = document.getElementById("tech-bg");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let particles = [];

for (let i = 0; i < 95; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Glow effect
    ctx.fillStyle = "#00d4ff";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00e5ff";

    // Draw particles
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw connecting lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0, 200, 255, 0.18)";
    ctx.shadowBlur = 0;

    particles.forEach((p1, i) => {
        particles.forEach((p2, j) => {
            if (i !== j) {
                let dx = p1.x - p2.x;
                let dy = p1.y - p2.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        });
    });

    // Update positions
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });

    requestAnimationFrame(draw);
}

draw();
