let rankData = {};

// JSON 파일에서 데이터 로드
async function loadRankData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        rankData = data.ranks;
        displayRanks();
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
}

// 변경사항을 localStorage에 임시 저장
function saveToLocalStorage() {
    localStorage.setItem('rankDataTemp', JSON.stringify(rankData));
}

// localStorage에서 임시 데이터 로드
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('rankDataTemp');
    if (savedData) {
        rankData = JSON.parse(savedData);
        displayRanks();
    } else {
        loadRankData(); // 저장된 데이터가 없으면 JSON에서 로드
    }
}

// 폼 제출 이벤트 수정
document.getElementById('editForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const actionType = document.getElementById('actionType').value;
    const rank = document.getElementById('rankSelect').value;
    const newName = document.getElementById('nameInput').value;
    
    if (!newName) {
        alert('이름을 입력해주세요.');
        return;
    }

    if (actionType === 'edit') {
        if (rankData[rank]) {
            rankData[rank].members[0].name = newName;
            saveToLocalStorage();
            displayRanks();
            alert('랭킹이 수정되었습니다!');
        }
    } else {
        if (rankData[rank]) {
            const newMember = {
                name: newName,
                icon: rankData[rank].members[0].icon,
                benefits: [...rankData[rank].members[0].benefits]
            };
            rankData[rank].members.push(newMember);
            saveToLocalStorage();
            displayRanks();
            alert('새 멤버가 추가되었습니다!');
        }
    }
    
    document.getElementById('nameInput').value = '';
});

// 페이지 로드시 데이터 불러오기
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
});

// 랭킹 표시 함수 수정
function displayRanks() {
    const rankingSection = document.querySelector('.ranking-section');
    rankingSection.innerHTML = '<h2 class="section-title"><i class="fas fa-crown"></i> 계급 현황</h2>';

    Object.entries(rankData).forEach(([rankName, data]) => {
        const rankCategory = document.createElement('div');
        rankCategory.className = 'rank-category';
        
        // 계급 제목 추가
        rankCategory.innerHTML = `
            <h3 class="rank-category-title">${rankName}</h3>
            <div class="rank-row">
                ${data.members.map(member => `
                    <div class="rank-box ${rankName.toLowerCase()}">
                        <div class="rank-icon">
                            <i class="fas ${member.icon}"></i>
                        </div>
                        <div class="rank-content">
                            <h3>${rankName}</h3>
                            <p class="rank-name">${member.name}</p>
                            <button class="view-privileges">클릭하여 권한 보기</button>
                        </div>
                        <div class="privileges-modal">
                            <div class="modal-content">
                                <h4>${rankName}의 권한</h4>
                                <ul>
                                    ${member.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                                </ul>
                                <button class="close-modal">닫기</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        rankingSection.appendChild(rankCategory);
    });

    // 모달 이벤트 리스너 다시 설정
    setupModalListeners();
}

// 모달 이벤트 리스너 설정 함수
function setupModalListeners() {
    document.querySelectorAll('.view-privileges').forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.target.closest('.rank-box').querySelector('.privileges-modal');
            modal.classList.add('active');
        });
    });

    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.target.closest('.privileges-modal');
            modal.classList.remove('active');
        });
    });

    document.querySelectorAll('.privileges-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// 작업 타입 변경시 버튼 텍스트 변경
document.getElementById('actionType').addEventListener('change', (e) => {
    const submitBtn = document.querySelector('.edit-button');
    submitBtn.textContent = e.target.value === 'edit' ? '수정하기' : '추가하기';
});
  