async function getModels() {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    const data = await res.json();
    const freeModels = data.data.filter(m => m.pricing.prompt === "0" && m.pricing.completion === "0");
    console.log("Free models:");
    freeModels.slice(0, 10).forEach(m => console.log(m.id));
}
getModels();
