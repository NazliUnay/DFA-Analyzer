class DFAAnalyzer {
    constructor(dfa1, dfa2) {
        this.dfa1 = dfa1;
        this.dfa2 = dfa2;
    }

    validateDFA(dfa, name) {
        if (!dfa.states || !dfa.alphabet || !dfa.start_state || !dfa.accept_states || !dfa.transitions) {
            throw `${name} dosyasında eksik alanlar var (states, alphabet, start_state, accept_states veya transitions).`;
        }
        if (!dfa.states.includes(dfa.start_state)) {
            throw `${name}: Başlangıç durumu (${dfa.start_state}) durumlar listesinde bulunamadı.`;
        }
        for (const acceptState of dfa.accept_states) {
            if (!dfa.states.includes(acceptState)) {
                throw `${name}: Kabul durumu (${acceptState}) durumlar listesinde bulunamadı.`;
            }
        }
        for (const state of dfa.states) {
            if (!dfa.transitions[state]) {
                throw `${name}: '${state}' durumu için hiçbir geçiş tanımlanmamış.`;
            }
            for (const symbol of dfa.alphabet) {
                const target = dfa.transitions[state][symbol];
                if (target === undefined) {
                    throw `${name}: '${state}' durumunun '${symbol}' sembolü için geçişi eksik.`;
                }
                if (!dfa.states.includes(target)) {
                    throw `${name}: '${state}' durumundan '${symbol}' ile gidilen '${target}' durumu tanımlı değil.`;
                }
            }
        }
        return true;
    }

    // Kesişim analizi yapar ve ortak kabul edilen en kısa kelimeyi döner
    analyzeIntersection() {
        this.validateDFA(this.dfa1, "DFA-1");
        this.validateDFA(this.dfa2, "DFA-2");

        const steps = [];

        const set1 = new Set(this.dfa1.alphabet);
        const commonAlphabet = this.dfa2.alphabet.filter(symbol => set1.has(symbol));
        if (commonAlphabet.length === 0) {
            return { 
                isEmpty: true, 
                reason: "Otomatların ortak bir alfabesi yok, kesişim zorunlu olarak boştur.",
                steps: ["Ortak alfabe bulunamadığı için işlem doğrudan sonlandırıldı."]
            };
        }

        const queue = [[this.dfa1.start_state, this.dfa2.start_state, ""]];
        const visited = new Set();
        visited.add(`${this.dfa1.start_state},${this.dfa2.start_state}`);

        steps.push(` <b>Kesişim Araması Başlıyor:</b> Her iki otomatı da başlangıç noktalarına koyduk. İlk durumumuz: <b>(${this.dfa1.start_state}, ${this.dfa2.start_state})</b>`);

        while (queue.length > 0) {
            const [state1, state2, path] = queue.shift();
            const currentWord = path === "" ? "λ (Hiçbir harf okunmadı)" : `"${path}"`;
            
            steps.push(`<br> <b>Şu an incelenen durum:</b> (${state1}, ${state2}) | <b>Buraya gelene kadar okunan kelime:</b> ${currentWord}`);

            // İkisi de aynı anda kabul durumunda mı?
            const isAccept1 = this.dfa1.accept_states.includes(state1);
            const isAccept2 = this.dfa2.accept_states.includes(state2);

            if (isAccept1 && isAccept2) {
                steps.push(`&nbsp;&nbsp;&nbsp;&nbsp;<span class='success-text'> HARİKA! Hem DFA-1 (${state1}) hem de DFA-2 (${state2}) bu kelimeyi kabul ediyor. Ortak kelime bulundu!</span>`);
                return { 
                    isEmpty: false, 
                    sampleString: path === "" ? "λ (Boş Kelime)" : path,
                    steps 
                };
            } else {
                 steps.push(`&nbsp;&nbsp;&nbsp;&nbsp;<i>Durum analizi: DFA-1 (${isAccept1 ? 'Kabul' : 'Ret'}), DFA-2 (${isAccept2 ? 'Kabul' : 'Ret'}) - Ortak kabul değil, aramaya devam...</i>`);
            }

            for (const symbol of commonAlphabet) {
                const next1 = this.dfa1.transitions[state1][symbol];
                const next2 = this.dfa2.transitions[state2][symbol];
                const pair = `${next1},${next2}`;

                if (!visited.has(pair)) {
                    visited.add(pair);
                    queue.push([next1, next2, path + symbol]);
                    steps.push(`&nbsp;&nbsp;&nbsp;&nbsp;➔ Eğer '<b>${symbol}</b>' okursak yeni durumumuz <b>(${next1}, ${next2})</b> olacak. (Daha sonra incelemek üzere sıraya eklendi)`);
                } else {
                    steps.push(`&nbsp;&nbsp;&nbsp;&nbsp;➔ Eğer '<b>${symbol}</b>' okursak <b>(${next1}, ${next2})</b> durumuna gidiyoruz. (Bu durumu daha önce incelediğimiz için sonsuz döngüye girmemek adına atlıyoruz)`);
                }
            }
        }

        steps.push("<br><span class='success-text'> Gidilebilecek tüm yollar bitti. İki otomatın aynı anda kabul ettiği hiçbir kelime yok (Kesişim BOŞ).</span>");
        return { isEmpty: true, steps };
    }

    // Eşdeğerlik analizi yapar, uyuşmazlık varsa karşı örnek türetir
    analyzeEquivalence() {
        this.validateDFA(this.dfa1, "DFA-1");
        this.validateDFA(this.dfa2, "DFA-2");

        const steps = [];

        const sortedAlphabet1 = [...this.dfa1.alphabet].sort().join(',');
        const sortedAlphabet2 = [...this.dfa2.alphabet].sort().join(',');
        if (sortedAlphabet1 !== sortedAlphabet2) {
            return { 
                isEquivalent: false, 
                reason: "Alfabeler farklı olduğu için otomatlar eşdeğer olamaz.",
                steps: ["Alfabeler uyuşmadığı için eşdeğerlik testi doğrudan iptal edildi."]
            };
        }

        const queue = [[this.dfa1.start_state, this.dfa2.start_state, ""]];
        const visited = new Set();
        visited.add(`${this.dfa1.start_state},${this.dfa2.start_state}`);

        steps.push(`<b>Eşdeğerlik Kontrolü Başlıyor:</b> Başlangıç durumlarından <b>(${this.dfa1.start_state}, ${this.dfa2.start_state})</b> aramaya başlıyoruz. Amacımız birinin kabul edip diğerinin reddettiği bir "çelişki" bulmak.`);

        while (queue.length > 0) {
            const [state1, state2, path] = queue.shift();
            const currentWord = path === "" ? "λ (Hiçbir harf okunmadı)" : `"${path}"`;

            const isAccept1 = this.dfa1.accept_states.includes(state1);
            const isAccept2 = this.dfa2.accept_states.includes(state2);

            steps.push(`<br> <b>İncelenen Durum:</b> (${state1}, ${state2}) | <b>Okunan Kelime:</b> ${currentWord}`);
            steps.push(`&nbsp;&nbsp;&nbsp;&nbsp;<i>DFA-1 bu noktada: <b>${isAccept1?'KABUL EDİYOR':'REDDEDİYOR'}</b> | DFA-2 bu noktada: <b>${isAccept2?'KABUL EDİYOR':'REDDEDİYOR'}</b></i>`);

            // Durumlardan biri kabul, diğeri ret ise eşdeğerlik bozulur!
            if (isAccept1 !== isAccept2) {
                steps.push(`&nbsp;&nbsp;&nbsp;&nbsp;<span class='error-text'>💥 ÇELİŞKİ YAKALANDI! Otomatlardan biri bu kelimeyi kabul ederken diğeri etmiyor. Eşdeğerlik bozuldu.</span>`);
                return {
                    isEquivalent: false,
                    counterexample: path === "" ? "λ (Boş Kelime)" : path,
                    reason: isAccept1 
                        ? `"${path}" dizisini DFA-1 kabul ederken, DFA-2 reddediyor.` 
                        : `"${path}" dizisini DFA-1 reddederken, DFA-2 kabul ediyor.`,
                    steps
                };
            }

            for (const symbol of this.dfa1.alphabet) {
                const next1 = this.dfa1.transitions[state1][symbol];
                const next2 = this.dfa2.transitions[state2][symbol];
                const pair = `${next1},${next2}`;

                if (!visited.has(pair)) {
                    visited.add(pair);
                    queue.push([next1, next2, path + symbol]);
                    steps.push(`&nbsp;&nbsp;&nbsp;&nbsp;➔ '<b>${symbol}</b>' harfi okursak yeni gideceğimiz yer: <b>(${next1}, ${next2})</b> (Sıraya eklendi).`);
                } else {
                    steps.push(`&nbsp;&nbsp;&nbsp;&nbsp;➔ '<b>${symbol}</b>' harfi okursak <b>(${next1}, ${next2})</b> noktasına dönüyoruz. (Önceden kontrol ettiğimiz için atlanıyor).`);
                }
            }
        }

        steps.push("<br><span class='success-text'> Bütün ihtimaller denendi. İki otomat her durumda aynı kararı veriyor. Bu otomatlar tamamen EŞDEĞERDİR!</span>");
        return { isEquivalent: true, steps };
    }

    static simulateDFA(dfa, inputString) {
        let currentState = dfa.start_state;
        let path = [currentState];

        for (const char of inputString) {
            if (!dfa.alphabet.includes(char)) {
                return { accepted: false, reason: `'${char}' sembolü alfabede yok.`, path };
            }
            currentState = dfa.transitions[currentState][char];
            path.push(currentState);
        }

        const isAccepted = dfa.accept_states.includes(currentState);
        return { 
            accepted: isAccepted, 
            reason: isAccepted ? "Kelime kabul edildi." : "Kelime reddedildi (Bitiş durumuna ulaşılamadı).",
            path 
        };
    }
}

export default DFAAnalyzer;