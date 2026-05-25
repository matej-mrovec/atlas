const countriesList = document.getElementById("countries-list");
const continent = document.getElementById("continent");
const modalBody = document.getElementById("modal-body-content");
const modalTitle = document.getElementById("modal-country-title");
const modal = new bootstrap.Modal(document.getElementById("one-country"));

function loadCountries(region) {
    // Zobrazení načítacího indikátoru před stažením dat
    countriesList.innerHTML = `<div class="text-center w-100 my-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Načítám státy...</p></div>`;
    
    fetch(`https://restcountries.com/v3.1/region/${region}`)
    .then(res => res.json())
    .then(data => {
        // Seřadíme státy abecedně podle českého názvu
        data.sort((a, b) => {
            const nameA = a.translations?.ces?.common || a.name.common;
            const nameB = b.translations?.ces?.common || b.name.common;
            return nameA.localeCompare(nameB, 'cs');
        });

        countriesList.innerHTML = "";
        
        data.forEach((country) => {
            // Ošetření případu, kdy stát nemá hlavní město
            const capital = country.capital ? country.capital[0] : "Není definováno";
            const czechName = country.translations?.ces?.common || country.name.common;

            let blockCountry = `
                <div class="col-xxl-2 col-xl-3 col-lg-4 col-md-6 col-sm-6 d-flex align-items-stretch">
                    <div class="card w-100">
                        <img class="card-img-top" src="${country.flags.png}" alt="Vlajka ${czechName}" />
                        <div class="card-body d-flex flex-column justify-content-between">
                            <div>
                                <h5 class="card-title fw-bold text-truncate">${czechName}</h5>
                                <p class="card-text text-muted small mb-3">Hlavní město: <b>${capital}</b></p>
                            </div>
                            <button class="btn btn-primary btn-sm w-100 mt-2 btn-detail" 
                                    data-name="${country.name.common}">
                                Více informací
                            </button>
                        </div>
                    </div>                                       
                </div>            
            `;
            countriesList.innerHTML += blockCountry;
        });

        // Přidání event listenerů pro tlačítka "Více informací"
        document.querySelectorAll('.btn-detail').forEach(button => {
            button.addEventListener('click', () => {
                const countryName = button.getAttribute('data-name');
                
                // Nastavení načítacího textu do modálu před otevřením
                modalTitle.textContent = "Načítám...";
                modalBody.innerHTML = `<div class="text-center p-3"><div class="spinner-border text-secondary" role="status"></div></div>`;
                modal.show();

                // Opravený překlep: fullText=true s rovnítkem
                fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`)
                .then(res => res.json())
                .then(data => {
                    const country = data[0];
                    const czechName = country.translations?.ces?.common || country.name.common;
                    const officialName = country.translations?.ces?.official || country.name.official;
                    const capital = country.capital ? country.capital[0] : "Není";
                    const population = country.population.toLocaleString('cs-CZ');
                    const area = country.area ? `${country.area.toLocaleString('cs-CZ')} km²` : "Neznámá";
                    
                    // Získání jazyků
                    const languages = country.languages ? Object.values(country.languages).join(', ') : "Neznámé";
                    
                    // Získání měn
                    const currencies = country.currencies 
                        ? Object.values(country.currencies).map(curr => `${curr.name} (${curr.symbol || ''})`).join(', ')
                        : "Neznámá";

                    // Výplň modálního okna daty
                    modalTitle.textContent = czechName;
                    modalBody.innerHTML = `
                        <div class="text-center mb-3">
                            <img src="${country.flags.png}" class="img-fluid border rounded shadow-sm mb-2" style="max-height: 120px;" alt="Vlajka">
                            <h6 class="text-muted italic">${officialName}</h6>
                        </div>
                        <hr>
                        <table class="table table-sm table-borderless">
                            <tr>
                                <td><strong>Hlavní město:</strong></td>
                                <td>${capital}</td>
                            </tr>
                            <tr>
                                <td><strong>Počet obyvatel:</strong></td>
                                <td>${population}</td>
                            </tr>
                            <tr>
                                <td><strong>Rozloha:</strong></td>
                                <td>${area}</td>
                            </tr>
                            <tr>
                                <td><strong>Jazyky:</strong></td>
                                <td>${languages}</td>
                            </tr>
                            <tr>
                                <td><strong>Měna:</strong></td>
                                <td>${currencies}</td>
                            </tr>
                            <tr>
                                <td><strong>Subregion:</strong></td>
                                <td>${country.subregion || "Není"}</td>
                            </tr>
                        </table>
                    `;
                })
                .catch(error => {
                    modalTitle.textContent = "Chyba";
                    modalBody.innerHTML = `<div class="alert alert-danger">Nepodařilo se načíst detaily o státu.</div>`;
                    console.error(`Nastala chyba: ${error}`);
                });
            });
        });                
    })
    .catch(error => {
        countriesList.innerHTML = `<div class="alert alert-danger w-100 text-center">Chyba při načítání dat z API.</div>`;
        console.error(error);
    });
}

// Prvotní načtení Evropy
loadCountries("europe");

// Reakce na změnu kontinentu v selectu
continent.addEventListener("change", function(event) {
    loadCountries(event.target.value);
});