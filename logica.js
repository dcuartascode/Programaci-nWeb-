// Datos de ejemplo para el análisis
const sampleData = [8, 15, 22, 25, 33, 38, 41, 45, 50, 52, 58, 65, 70, 78, 85, 92];

// Función principal que se ejecuta al hacer clic en el botón
function realizarAnalisis() {
    // 1. Obtener el factor de multiplicación del input del usuario
    const factorInput = document.getElementById('multiplicationFactor');
    if (!factorInput) return; // Detener si el elemento no existe

    const factor = parseFloat(factorInput.value);
    if (isNaN(factor)) {
        alert("Por favor, ingrese un factor numérico válido.");
        return;
    }

    // 2. Calcular estadísticas básicas de los datos
    const min = Math.min(...sampleData);
    const max = Math.max(...sampleData);
    const mean = sampleData.reduce((a, b) => a + b, 0) / sampleData.length;
    const stdDev = Math.sqrt(sampleData.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / sampleData.length);

    // 3. Crear los rangos (bins) dinámicamente
    const binSize = stdDev * factor;
    const bins = [];
    if (binSize > 0) {
        for (let i = min; i <= max + 1; i += binSize) {
            const lowerBound = Math.floor(i);
            const upperBound = Math.floor(i + binSize - 1);
            bins.push({
                label: `${lowerBound} - ${upperBound}`,
                lower: lowerBound,
                upper: upperBound,
                values: []
            });
        }
    }

    // 4. Agrupar los datos en los bins correspondientes
    sampleData.forEach(value => {
        for (const bin of bins) {
            if (value >= bin.lower && value <= bin.upper) {
                bin.values.push(value);
                break;
            }
        }
    });

    // 5. Mostrar los resultados en la página web
    displayResults(bins);
}

function displayResults(bins) {
    // Mostrar datos originales
    const originalDataContainer = document.querySelector("#original-data pre");
    if (originalDataContainer) {
        originalDataContainer.textContent = JSON.stringify(sampleData, null, 2);
    }

    // Mostrar los rangos (bins) calculados
    const binsContainer = document.querySelector("#bins pre");
    if (binsContainer) {
        binsContainer.textContent = bins.map(bin => bin.label).join('\n');
    }

    // Mostrar los datos agrupados
    const binnedDataContainer = document.querySelector("#binned-data pre");
    if (binnedDataContainer) {
        let binnedText = '';
        bins.forEach(bin => {
            if (bin.values.length > 0) {
                binnedText += `Rango [${bin.label}]:\n  ${JSON.stringify(bin.values)}\n\n`;
            }
        });
        binnedDataContainer.textContent = binnedText.trim() || "No hay datos en los rangos calculados.";
    }
}

// Ejecutar el análisis una vez que el contenido de la página se haya cargado
document.addEventListener('DOMContentLoaded', realizarAnalisis);