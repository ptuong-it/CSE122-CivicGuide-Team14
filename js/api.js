const API = {
    cache: {},
    async load(base = '', file = 'assets/data/procedures.json') {
        if (this.cache[file]) return this.cache[file];
        await new Promise(r => setTimeout(r, 150)); /* fake delay */
        const res = await fetch(base + file);
        if (!res.ok) throw new Error(`HTTP ${res.status} khi tải ${base + file}`);
        this.cache[file] = await res.json();
        return this.cache[file];
    },
    async fetchJSON(file, base = '') {
        return this.load(base, file);
    }
};
window.API = API;
