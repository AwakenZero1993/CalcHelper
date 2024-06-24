document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    const forms = {
        statCalc: document.getElementById('stat-calc-form'),
        damageDealt: document.getElementById('damage-dealt-form'),
        damageReceived: document.getElementById('damage-received-form')
    };

    forms.statCalc.addEventListener('input', calculateStats);
    forms.damageDealt.addEventListener('input', calculateDamageDealt);
    forms.damageReceived.addEventListener('input', calculateDamageReceived);

    ['buff', 'debuff'].forEach(type => {
		    document.getElementById('stat-calc-form').addEventListener('input', calculateStats);
        document.getElementById(`${type}-count`).addEventListener('input', e => updateStatBuffDebuffInputs(e.target, type));
    });

    document.getElementById('attack-count').addEventListener('input', updateAttackInputs);

    updateAttackInputs();
}

function toggleSection(sectionId) {
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(s => s.style.display = s.id === sectionId ? (s.style.display === 'none' ? 'block' : 'none') : 'none');
}

function updateStatBuffDebuffInputs(countInput, type) {
    const count = parseInt(countInput.value) || 0;
    const container = document.getElementById(`${type}-inputs`);
    container.innerHTML = Array.from({length: count}, (_, i) => createBuffDebuffInput(type, i)).join('');

    container.querySelectorAll(`.${type}-input`).forEach(input => input.addEventListener('input', calculateStats));
    calculateStats();
}

function createBuffDebuffInput(type, index) {
    const label = `${type.charAt(0).toUpperCase() + type.slice(1)} chỉ số ${index + 1}`;
    return `
        <div class="form-group">
            <label for="${type}-${index}">${label} (%):</label>
            <input type="number" id="${type}-${index}" class="${type}-input" min="0" max="100" required placeholder="Nhập giá trị của ${type}">
        </div>
    `;
}

function updateAttackInputs() {
    const attackCount = parseInt(document.getElementById('attack-count').value) || 1;
    const attacksContainer = document.getElementById('attacks-container');
    attacksContainer.innerHTML = Array.from({length: attackCount}, (_, i) => createAttackInput(i)).join('');

    ['buff', 'debuff'].forEach(type => {
        document.querySelectorAll(`.${type}-count-input`).forEach(input => {
            input.addEventListener('input', e => updateBuffDebuffInputs(e.target, type, 'attack'));
        });
    });

    document.querySelectorAll('.copy-previous-button').forEach(button => {
        button.addEventListener('click', copyPreviousAttack);
    });

    calculateDamageDealt();
}

function createAttackInput(index) {
    const copyButton = index > 0 ? `<button type="button" class="copy-previous-button" data-attack-index="${index}">Sao chép từ đòn trước</button>` : '';
    return `
        <div class="attack-input" id="attack-${index}">
            <h3>Đòn tấn công ${index + 1}</h3>
            ${copyButton}
            <label for="power-${index}">Sát thương (Pow):</label>
            <input type="number" id="power-${index}" class="power-input" min="0" required placeholder="Nhập chỉ số Pow sau khi tính qua buff và debuff.">
            
            <label for="buff-count-${index}">Số lượng buff sát thương:</label>
            <input type="number" id="buff-count-${index}" class="buff-count-input" value="0" min="0">
            <div id="buff-inputs-${index}" class="buff-inputs"></div>
            
            <label for="debuff-count-${index}">Số lượng debuff giảm sát thương:</label>
            <input type="number" id="debuff-count-${index}" class="debuff-count-input" value="0" min="0">
            <div id="debuff-inputs-${index}" class="debuff-inputs"></div>
            
            <label>
                <input type="checkbox" id="true-damage-${index}" class="effect-checkbox"> True Damage
            </label>
            <label>
                <input type="checkbox" id="piercing-${index}" class="effect-checkbox"> Piercing
            </label>
        </div>
    `;
}

function updateBuffDebuffInputs(countInput, type, context) {
    const count = parseInt(countInput.value) || 0;
    const container = countInput.nextElementSibling;
    container.innerHTML = Array.from({length: count}, (_, i) => createBuffDebuffInput(type, i)).join('');

    container.querySelectorAll(`.${type}-input`).forEach(input => {
        input.addEventListener('input', () => context === 'attack' && calculateDamageDealt());
    });

    if (context === 'attack') calculateDamageDealt();
}

function copyPreviousAttack(event) {
    const currentIndex = parseInt(event.target.getAttribute('data-attack-index'));
    const previousIndex = currentIndex - 1;

    ['power', 'buff-count', 'debuff-count', 'true-damage', 'piercing'].forEach(field => {
        const currentElement = document.getElementById(`${field}-${currentIndex}`);
        const previousElement = document.getElementById(`${field}-${previousIndex}`);
        if (currentElement.type === 'checkbox') {
            currentElement.checked = previousElement.checked;
        } else {
            currentElement.value = previousElement.value;
        }
    });

    ['buff', 'debuff'].forEach(type => {
        updateBuffDebuffInputs(document.getElementById(`${type}-count-${currentIndex}`), type, 'attack');
        const count = parseInt(document.getElementById(`${type}-count-${previousIndex}`).value) || 0;
        for (let i = 0; i < count; i++) {
            const prevValue = document.getElementById(`${type}-${type}-count-${previousIndex}-${i}`).value;
            document.getElementById(`${type}-${type}-count-${currentIndex}-${i}`).value = prevValue;
        }
    });

    calculateDamageDealt();
}

function calculateStats() {
    const baseStat = parseFloat(document.getElementById('base-stat').value) || 0;
    const { total: totalBuff, details: buffDetails } = calculateBuffDebuff('#buff-inputs .buff-input', 'Buff chỉ số');
    const { total: totalDebuff, details: debuffDetails } = calculateBuffDebuff('#debuff-inputs .debuff-input', 'Debuff chỉ số', true);

    const finalStat = baseStat * (1 + totalBuff / 100) * totalDebuff;

    document.getElementById('stat-calc-result').innerHTML = `
        <p>Base Stat: ${baseStat}</p>
        <p>Tổng buff: ${buffDetails.length > 0 ? buffDetails.join(' + ') : '0%'} = <span style="color: red;">${totalBuff}%</span></p>
        <p>Tổng debuff: 1 - ${debuffDetails.length > 0 ? debuffDetails.join(' * ') : '100'}% / 100 = <span style="color: red;">${((1 - totalDebuff) * 100).toFixed(2)}%</span></p>
        <p><strong>Stat cuối cùng: ${finalStat.toFixed(2)}</strong></p>
    `;
}

function calculateBuffDebuff(selector, label, isDebuff = false) {
    const inputs = document.querySelectorAll(selector);
    let total = isDebuff ? 1 : 0;
    const details = [];
    inputs.forEach((input, index) => {
        const value = parseFloat(input.value) || 0;
        if (value !== 0) {
            if (isDebuff) {
                total *= (100 - value) / 100;
            } else {
                total += value;
            }
            details.push(`${label} ${index + 1}: ${value}%`);
        }
    });
    return { total: isDebuff ? total : total, details };
}

function calculateBuffDebuff(selector, label, isDebuff = false) {
    const inputs = document.querySelectorAll(selector);
    let total = isDebuff ? 1 : 0;
    const details = [];
    inputs.forEach((input, index) => {
        const value = parseFloat(input.value) || 0;
        if (value !== 0) {
            if (isDebuff) {
                total *= (100 - value) / 100;
            } else {
                total += value;
            }
            details.push(`${label} ${index + 1}: ${value}%`);
        }
    });
    return { total: isDebuff ? total : total, details };
}

function calculateDamageDealt() {
    const attackCount = parseInt(document.getElementById('attack-count').value) || 1;
    let damageDetails = [];
    let attackSummary = [];

    for (let i = 0; i < attackCount; i++) {
        const { damage, effects, details } = calculateSingleAttack(i);
        attackSummary.push(`Đòn tấn công ${i + 1}: ${damage.toFixed(2)}${effects.length > 0 ? `, có hiệu ứng ${effects.join(', ')}` : ''}`);
        damageDetails.push(details);
    }

    document.getElementById('damage-dealt-result').innerHTML = `
        <h3>Tóm tắt sát thương:</h3>
        <ul>${attackSummary.map(summary => `<li>${summary}</li>`).join('')}</ul>
        <h3>Chi tiết tính toán:</h3>
        ${damageDetails.join('<hr>')}
    `;
}

function calculateSingleAttack(index) {
    const power = parseFloat(document.getElementById(`power-${index}`).value) || 0;
    const { total: totalBuff } = calculateBuffDebuff(`#buff-inputs-${index} .buff-input`);
    const { total: totalDebuff } = calculateBuffDebuff(`#debuff-inputs-${index} .debuff-input`, '', true);

    const damage = power * (1 + totalBuff / 100) * totalDebuff;

    const trueDamage = document.getElementById(`true-damage-${index}`).checked;
    const piercing = document.getElementById(`piercing-${index}`).checked;

    const effects = [trueDamage && 'true damage', piercing && 'piercing'].filter(Boolean);

    const details = `
        <h4>Đòn tấn công ${index + 1}:</h4>
        <p>Sát thương cơ bản: ${power}</p>
        <p>Tổng buff sát thương: ${totalBuff}% = <span style="color: red;">${totalBuff}%</span></p>
        <p>Tổng debuff giảm sát thương: 1 - ${((1 - totalDebuff) * 100).toFixed(2)}% / 100 = <span style="color: red;">${((1 - totalDebuff) * 100).toFixed(2)}%</span></p>
        <p>Sát thương cuối cùng: <strong>${damage.toFixed(2)}</strong></p>
        <p>Hiệu ứng: ${effects.length > 0 ? effects.join(', ') : 'Không có'}</p>
    `;

    return { damage, effects, details };
}

function calculateDamageReceived() {
    const defenderHp = parseFloat(document.getElementById('defender-hp-received').value) || 0;
    const defenderShielding = parseFloat(document.getElementById('defender-shielding-received').value) || 0;
    const incomingDamage = parseFloat(document.getElementById('incoming-damage').value) || 0;

    const actualDamage = Math.max(0, incomingDamage - defenderShielding);
    const remainingHp = Math.max(0, defenderHp - actualDamage);

    document.getElementById('damage-received-result').innerHTML = `
        <p>Sát thương thực tế nhận vào: ${actualDamage}</p>
        <p>HP còn lại: ${remainingHp}</p>
    `;
}