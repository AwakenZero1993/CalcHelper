const STAT_CONSTANTS = Object.freeze({
    MIN_HP_RATIO: 0.2,
    MIN_SPEED_RATIO: 0.05,
    MAX_SPEED_RATIO: 0.6
});

const formatNumber = num => num % 1 === 0 ? num.toString() : num.toFixed(2);

const displayError = (elementId, message) => {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = message ? 'block' : 'none';
    }
};

const updateStatInputs = function() {
    const total = parseFloat(this.value) || 0;
    const statInputs = document.getElementById('stat-inputs');
    const statSummary = document.getElementById('stat-summary');
    const remainingTotal = document.getElementById('remaining-total');
    const hpInput = document.getElementById('hp');
    const speedInput = document.getElementById('speed');

    ['hp', 'power', 'speed', 'shielding', 'recovery'].forEach(id => {
        const input = document.getElementById(id);
        input.value = '';
        input.placeholder = '';
    });

    displayError('total-error', '');

    if (total > 0) {
        statInputs.style.display = 'block';
        statSummary.style.display = 'flex';
        remainingTotal.textContent = formatNumber(total);

        const requiredHp = formatNumber(total * STAT_CONSTANTS.MIN_HP_RATIO);
        hpInput.placeholder = `Min HP = ${requiredHp}`;

        const minSpeed = formatNumber(total * STAT_CONSTANTS.MIN_SPEED_RATIO);
        const maxSpeed = formatNumber(total * STAT_CONSTANTS.MAX_SPEED_RATIO);
        speedInput.placeholder = `Speed range: ${minSpeed} - ${maxSpeed}`;
    } else {
        statInputs.style.display = 'none';
        statSummary.style.display = 'none';
    }

    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });

    document.getElementById('copy-values').style.display = 'none';
    document.getElementById('input-values').style.display = 'none';
};

const validateStats = event => {
    const total = parseFloat(document.getElementById('total').value) || 0;
    const hp = parseFloat(document.getElementById('hp').value) || 0;
    const power = parseFloat(document.getElementById('power').value) || 0;
    const speed = parseFloat(document.getElementById('speed').value) || 0;
    const shielding = parseFloat(document.getElementById('shielding').value) || 0;
    const recovery = parseFloat(document.getElementById('recovery').value) || 0;

    let isValid = true;
    let errorMessage = '';

    // Xóa tất cả các thông báo lỗi
    ['hp', 'power', 'speed', 'shielding', 'recovery', 'total'].forEach(id => {
        displayError(`${id}-error`, '');
    });

    // Kiểm tra HP
    const requiredHp = total * STAT_CONSTANTS.MIN_HP_RATIO;
    if (hp < requiredHp) {
        errorMessage = `HP must be at least ${formatNumber(requiredHp)}.`;
        displayError('hp-error', errorMessage);
        isValid = false;
    }

    // Kiểm tra Speed
    const minSpeed = total * STAT_CONSTANTS.MIN_SPEED_RATIO;
    const maxSpeed = total * STAT_CONSTANTS.MAX_SPEED_RATIO;
    if (speed < minSpeed || speed > maxSpeed) {
        errorMessage = `Speed must be between ${formatNumber(minSpeed)} and ${formatNumber(maxSpeed)}.`;
        displayError('speed-error', errorMessage);
        isValid = false;
    }

    const totalStats = hp + power + speed + shielding + recovery;
    const remainingStat = total - totalStats;

    document.getElementById('remaining-total').textContent = formatNumber(remainingStat);

    if (totalStats > total) {
        errorMessage = `Total stats exceed Base Stat (${formatNumber(totalStats)}/${formatNumber(total)})`;
        displayError('total-error', errorMessage);
        isValid = false;
    }

    updateInputValues(total, hp, power, speed, shielding, recovery);

    // Kiểm tra điều kiện để hiển thị nút Copy và Input Values
    const showCopyAndValues = isValid && (remainingStat === 0) && (total > 0);
    document.getElementById('copy-values').style.display = showCopyAndValues ? 'block' : 'none';
    document.getElementById('input-values').style.display = showCopyAndValues ? 'block' : 'none';
};

const updateInputValues = (total, hp, power, speed, shielding, recovery) => {
    document.getElementById('input-total').textContent = formatNumber(total);
    document.getElementById('input-hp').textContent = `${formatNumber(hp)}*10 = ${formatNumber(hp * 10)}`;
    document.getElementById('input-power').textContent = formatNumber(power);
    document.getElementById('input-speed').textContent = formatNumber(speed);
    document.getElementById('input-shielding').textContent = formatNumber(shielding);
    document.getElementById('input-recovery').textContent = formatNumber(recovery);
};

const copyValues = () => {
    const inputValues = Array.from(document.querySelectorAll('#input-values p'))
                             .map(p => p.textContent)
                             .join('\n');

    navigator.clipboard.writeText(inputValues)
        .then(() => {
            const successMessage = document.createElement('p');
            successMessage.classList.add('success-message');
            successMessage.textContent = 'Đã sao chép thông tin thành công! Bạn có thể dán vào profile.';
            document.getElementById('success-message').appendChild(successMessage);

            setTimeout(() => successMessage.remove(), 3000);
        })
        .catch(err => console.error('Failed to copy text: ', err));
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('total').addEventListener('input', updateStatInputs);
    ['hp', 'power', 'speed', 'shielding', 'recovery'].forEach(id => {
        document.getElementById(id).addEventListener('input', validateStats);
    });
    document.getElementById('copy-values').addEventListener('click', copyValues);

    document.getElementById('stat-inputs').style.display = 'none';
    document.getElementById('stat-summary').style.display = 'none';
    document.getElementById('input-values').style.display = 'none';
    document.getElementById('copy-values').style.display = 'none';
});

