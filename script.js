// 請將此處替換為您在 Google Apps Script 部署後取得的「網頁應用程式網址」
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbxrgw-yLQ045-Ur8N-4hxDZxYHdW_eyDzo349ZJ-odxT4zjMURWghdvc0WS_aYwpzIq9Q/exec";

// 驗證密碼並向外部 API 請求報價數據
async function verifyPassword() {
    const inputPassword = document.getElementById("password-input").value;
    const errorMsg = document.getElementById("error-msg");
    const button = document.querySelector(".auth-card button");

    if (!inputPassword) {
        errorMsg.innerText = "請輸入密碼";
        errorMsg.style.display = "block";
        return;
    }

    try {
        errorMsg.style.display = "none";
        button.innerText = "驗證中...";
        button.disabled = true;

        // 向後端 API 發送驗證請求
        const response = await fetch(GAS_API_URL, {
            method: "POST",
            body: JSON.stringify({ password: inputPassword })
        });

        const result = await response.json();

        if (result.status === "success") {
            // 驗證成功：隱藏密碼登入遮罩，顯示主內容
            document.getElementById("auth-overlay").style.display = "none";
            document.getElementById("secure-container").style.display = "block";
            
            // 動態渲染從後端抓取回來的項目與金額
            renderQuotation(result.data);
            
            // 啟用防護機制
            enableSecurityFeatures();
        } else {
            // 密碼錯誤
            errorMsg.innerText = result.message || "密碼錯誤，請重新輸入";
            errorMsg.style.display = "block";
            button.innerText = "解鎖檢視報價";
            button.disabled = false;
        }
    } catch (err) {
        errorMsg.innerText = "連線驗證失敗，請檢查網路或 API 設定";
        errorMsg.style.display = "block";
        button.innerText = "解鎖檢視報價";
        button.disabled = false;
    }
}

// 支援在輸入框按下 Enter 鍵直接登入
document.getElementById("password-input").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        verifyPassword();
    }
});

// 動態生成表格內容與總計
function renderQuotation(dataArray) {
    const tbody = document.getElementById("pricing-tbody");
    let html = "";
    let subtotal = 0;

    dataArray.forEach(item => {
        subtotal += item.price;
        html += `
            <tr>
                <td class="item-num">${item.num}</td>
                <td><strong>${item.title}</strong><br><span style="font-size: 13px; color: var(--text-muted);">${item.desc}</span></td>
                <td class="price">$ ${item.price.toLocaleString()}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    document.getElementById("subtotal-display").innerText = `$ ${subtotal.toLocaleString()}`;
}

// 啟用前端防護（防右鍵、防 F12 快速鍵）
function enableSecurityFeatures() {
    // 1. 禁用右鍵選單
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // 2. 禁用常用開發者工具快捷鍵
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && e.key.toUpperCase() === 'U') {
            e.preventDefault();
            return false;
        }
    });
}
