document.addEventListener('DOMContentLoaded', function() {
    let points = [];

    const pointForm = document.getElementById('pointForm');
    const aoeForm = document.getElementById('aoeForm');
    const distanceForm = document.getElementById('distanceForm');
    const deletePointButton = document.getElementById('deletePoint');

    pointForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addOrUpdatePoint();
    });

    aoeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateAoE();
    });

    distanceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateDistance();
    });

    deletePointButton.addEventListener('click', deletePoint);

    function addOrUpdatePoint() {
        const name = document.getElementById('pointName').value;
        const x = parseFloat(document.getElementById('xCoord').value);
        const y = parseFloat(document.getElementById('yCoord').value);
        const type = document.getElementById('pointType').value;

        if (name && !isNaN(x) && !isNaN(y)) {
            const existingPointIndex = points.findIndex(p => p.name === name);
            if (existingPointIndex !== -1) {
                points[existingPointIndex] = { name, x, y, type };
            } else {
                points.push({ name, x, y, type });
            }
            updatePointList();
            pointForm.reset();
        } else {
            alert('Vui lòng nhập đầy đủ thông tin điểm.');
        }
    }

    function deletePoint() {
        const name = document.getElementById('pointName').value;
        const index = points.findIndex(p => p.name === name);
        if (index !== -1) {
            points.splice(index, 1);
            updatePointList();
            pointForm.reset();
        } else {
            alert('Không tìm thấy điểm để xóa.');
        }
    }

    function calculateAoE() {
        const x = parseFloat(document.getElementById('aoeX').value);
        const y = parseFloat(document.getElementById('aoeY').value);
        const radius = parseFloat(document.getElementById('aoeRadius').value);
        const type = document.getElementById('aoeType').value;

        if (isNaN(x) || isNaN(y) || isNaN(radius)) {
            alert('Vui lòng nhập đầy đủ thông tin AoE.');
            return;
        }

        let affectedAllies = [];
        let affectedEnemies = [];
        points.forEach(point => {
            const distance = Math.sqrt((point.x - x)**2 + (point.y - y)**2);
            if (distance <= radius) {
                if (point.type === 'ally') {
                    affectedAllies.push(point.name);
                } else {
                    affectedEnemies.push(point.name);
                }
            }
        });

        let resultHTML = `
            <p>Tọa độ tâm AoE: (${x}, ${y})</p>
            <p>Bán kính AoE: ${radius}</p>
            <p>Loại AoE: ${type === 'damage' ? 'Sát thương' : 'Buff'}</p>
        `;

        if (type === 'damage') {
            if (affectedAllies.length > 0) {
                resultHTML += `
                    <div class="friendly-fire-alert">
                        <p>CẢNH BÁO: Có friendly fire!</p>
                        <p>Đồng minh bị ảnh hưởng: ${affectedAllies.join(', ')}</p>
                    </div>
                `;
            }
            resultHTML += `<p>Số kẻ địch bị sát thương: ${affectedEnemies.length}</p>`;
        } else { // Buff
            if (affectedEnemies.length > 0) {
                resultHTML += `
                    <div class="enemy-buff-alert">
                        <p>CẢNH BÁO: Có kẻ địch được buff!</p>
                        <p>Kẻ địch được buff: ${affectedEnemies.join(', ')}</p>
                    </div>
                `;
            }
            resultHTML += `<p>Số đồng minh được buff: ${affectedAllies.length}</p>`;
        }

        document.getElementById('aoeResult').innerHTML = resultHTML;
    }

    function calculateDistance() {
        const point1Name = document.getElementById('point1').value;
        const point2Name = document.getElementById('point2').value;
        
        const point1 = points.find(p => p.name === point1Name);
        const point2 = points.find(p => p.name === point2Name);
        
        if (point1 && point2) {
            const distance = Math.sqrt((point1.x - point2.x)**2 + (point1.y - point2.y)**2);
            document.getElementById('distanceResult').innerHTML = `
                <p>Khoảng cách giữa ${point1.name} và ${point2.name}: ${distance.toFixed(2)} đơn vị</p>
            `;
        } else {
            alert('Vui lòng chọn hai điểm khác nhau.');
        }
    }

    function updatePointList() {
        const list = document.getElementById('pointList');
        list.innerHTML = '';
        points.forEach(point => {
            const li = document.createElement('li');
            li.textContent = `${point.name}: (${point.x}, ${point.y}) - ${point.type === 'ally' ? 'Đồng minh' : 'Kẻ địch'}`;
            li.addEventListener('click', () => fillPointForm(point));
            list.appendChild(li);
        });
        updatePointDropdowns();
        savePointsToCookie();
    }

    function fillPointForm(point) {
        document.getElementById('pointName').value = point.name;
        document.getElementById('xCoord').value = point.x;
        document.getElementById('yCoord').value = point.y;
        document.getElementById('pointType').value = point.type;
    }

    function updatePointDropdowns() {
        const point1Select = document.getElementById('point1');
        const point2Select = document.getElementById('point2');
        
        [point1Select, point2Select].forEach(select => {
            select.innerHTML = '<option value="">Chọn điểm</option>';
            points.forEach(point => {
                const option = document.createElement('option');
                option.value = point.name;
                option.textContent = `${point.name} (${point.x}, ${point.y})`;
                select.appendChild(option);
            });
        });
    }

    function savePointsToCookie() {
        document.cookie = `points=${JSON.stringify(points)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    }

    function loadPointsFromCookie() {
        const cookie = document.cookie.split('; ').find(row => row.startsWith('points='));
        if (cookie) {
            points = JSON.parse(cookie.split('=')[1]);
            updatePointList();
        }
    }

    // Thêm nút xóa dữ liệu
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Xóa tất cả dữ liệu';
    clearButton.classList.add('btn-secondary');
    clearButton.addEventListener('click', clearAllData);
    document.querySelector('.container').appendChild(clearButton);

    function clearAllData() {
        if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu?')) {
            points = [];
            updatePointList();
            document.cookie = 'points=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
            pointForm.reset();
            aoeForm.reset();
            distanceForm.reset();
            document.getElementById('aoeResult').innerHTML = '';
            document.getElementById('distanceResult').innerHTML = '';
        }
    }

    // Khởi tạo dữ liệu từ cookie khi trang tải
    loadPointsFromCookie();
});