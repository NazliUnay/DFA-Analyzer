import DFAAnalyzer from './dfa_core.js';

// JSON DFA'sını Vis.js grafiğine dönüştüren fonksiyon
function drawDFA(dfa, containerId) {
    const container = document.getElementById(containerId);
    
    const nodes = [];
    const edges = [];

    // Durumları (Nodes) oluştur
    dfa.states.forEach(state => {
        let isStart = (state === dfa.start_state);
        let isAccept = dfa.accept_states.includes(state);

        nodes.push({
            id: state,
            label: state,
            shape: 'circle',
            // Başlangıç durumu mavi, kabul durumu yeşil, normal durumlar gri olsun
            color: {
                background: isStart ? '#bbdefb' : (isAccept ? '#c8e6c9' : '#f5f5f5'),
                border: isAccept ? '#2e7d32' : '#9e9e9e'
            },
            borderWidth: isAccept ? 3 : 1, // Kabul durumu kalın kenarlı (Çift çizgi efekti)
            font: { size: 16, bold: isStart || isAccept }
        });
    });

    // Geçişleri (Edges/Oklar) oluştur
    for (const [fromState, transitions] of Object.entries(dfa.transitions)) {
        for (const [symbol, toState] of Object.entries(transitions)) {
            edges.push({
                from: fromState,
                to: toState,
                label: symbol,
                arrows: 'to',
                font: { align: 'top' },
                smooth: { type: 'curvedCW', roundness: 0.2 } // Okların birbirine karışmaması
            });
        }
    }

    const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
    const options = {
        physics: { stabilization: true }, 
        interaction: { hover: true }
    };

    // Grafiği çiz
    new vis.Network(container, data, options);
}

function readJSONFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                resolve(JSON.parse(e.target.result));
            } catch (error) {
                reject("Dosya okunamadı veya JSON formatı tamamen hatalı.");
            }
        };
        reader.readAsText(file);
    });
}

async function handleAnalysis(action) {
    const file1 = document.getElementById('dfa1-file').files[0];
    const file2 = document.getElementById('dfa2-file').files[0];
    const resultBox = document.getElementById('result-box');

    if (!file1 || !file2) {
        resultBox.innerHTML = "<span class='error'>Lütfen iki DFA dosyasını da sisteme yükleyin.</span>";
        return;
    }

    try {
        resultBox.innerHTML = "<div class='loading'>Analiz yapılıyor, lütfen bekleyin...</div>";
        
        const dfa1 = await readJSONFile(file1);
        const dfa2 = await readJSONFile(file2);
        
        drawDFA(dfa1, 'dfa1-network');
        drawDFA(dfa2, 'dfa2-network');
        
        const analyzer = new DFAAnalyzer(dfa1, dfa2);
        let mainResultHtml = "";
        let stepsArray = [];

        if (action === 'intersect') {
            const result = analyzer.analyzeIntersection();
            stepsArray = result.steps || [];
            if (result.isEmpty) {
                mainResultHtml = `
                    <div class='success'>
                        <strong>✓ Kesişim Durumu: BOŞ</strong><br>
                        <small>${result.reason || "İki otomatın ortak kabul ettiği hiçbir kelime bulunamadı."}</small>
                    </div>`;
            } else {
                mainResultHtml = `
                    <div class='error'>
                        <strong>✗ Kesişim Durumu: BOŞ DEĞİL (ÇAKIŞMA VAR)</strong><br>
                        <span class='details'>Ortak kabul edilen en kısa örnek kelime: <code>${result.sampleString}</code></span>
                    </div>`;
            }
        } else if (action === 'equiv') {
            const result = analyzer.analyzeEquivalence();
            stepsArray = result.steps || [];
            if (result.isEquivalent) {
                mainResultHtml = `
                    <div class='success'>
                        <strong>✓ Eşdeğerlik Durumu: TAMAMEN EŞDEĞER</strong><br>
                        <small>İki otomat da istisnasız tamamen aynı dilleri tanımaktadır.</small>
                    </div>`;
            } else {
                mainResultHtml = `
                    <div class='error'>
                        <strong>✗ Eşdeğerlik Durumu: EŞDEĞER DEĞİL</strong><br>
                        <span class='details'><strong>Kanıt (Karşı Örnek):</strong> ${result.reason}</span>
                    </div>`;
            }
        }

        // ADIM ADIM LOG ALANINI OLUŞTURMA
        let stepsHtml = "";
        if (stepsArray.length > 0) {
            stepsHtml = `
                <div class='steps-container'>
                    <h4>Adım Adım Analiz İzleme Günlüğü (BFS Matrisi)</h4>
                    <div class='steps-list'>
                        ${stepsArray.map((step, index) => `<div class='step-item'><span class='step-number'>[Adım ${index + 1}]:</span> ${step}</div>`).join('')}
                    </div>
                </div>`;
        }

        // İki yapıyı birleştirip tek seferde ekrana basıyoruz
        resultBox.innerHTML = mainResultHtml + stepsHtml;

    } catch (validationError) {
        resultBox.innerHTML = `
            <div class='error-box'>
                <strong> Format / Doğrulama Hatası</strong><br>
                <small>${validationError}</small>
            </div>`;
    }
}

document.getElementById('btn-intersect').addEventListener('click', () => handleAnalysis('intersect'));
document.getElementById('btn-equiv').addEventListener('click', () => handleAnalysis('equiv'));