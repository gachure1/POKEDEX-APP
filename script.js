$(document).ready(function () {
    let offset = 0;
  
    $('#search-button').click(function () {
      const query = $('#search-input').val().toLowerCase();
      fetchPokemon(query);
    });
  
    $('#type-filter').change(function () {
      const type = $(this).val();
      fetchPokemonByType(type);
    });
  
    $('#next').click(function () {
      offset += 20;
      fetchPokemonList();
    });
  
    $('#prev').click(function () {
      if (offset > 0) offset -= 20;
      fetchPokemonList();
    });
  
    function fetchPokemon(query) {
      $.ajax({
        url: `https://pokeapi.co/api/v2/pokemon/${query}`,
        method: 'GET',
        success: function (data) {
          displayPokemon(data);
          fetchEvolutionChain(data.id);
          displayRelatedPokemon(data);
        },
        error: function () {
          alert('Pokémon not found!');
        }
      });
    }
  
    function fetchPokemonByType(type) {
      if (!type) {
        fetchPokemonList();
        return;
      }
  
      $.ajax({
        url: `https://pokeapi.co/api/v2/type/${type}`,
        method: 'GET',
        success: function (data) {
          displayPokemonList(data.pokemon.map(p => p.pokemon));
        }
      });
    }
  
    function fetchPokemonList() {
      $.ajax({
        url: `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=20`,
        method: 'GET',
        success: function (data) {
          displayPokemonList(data.results);
        }
      });
    }
  
    function displayPokemonList(pokemonList) {
      const pokemonCards = pokemonList.map(pokemon => `
        <div class="bg-white p-4 rounded shadow-md">
          <h2 class="text-xl font-bold">${pokemon.name}</h2>
        </div>
      `).join('');
      $('#pokemon-list').html(pokemonCards);
    }
  
    function displayPokemon(pokemon) {
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`)
        .then(response => response.json())
        .then(speciesData => {
          const description = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en').flavor_text;
  
          const abilities = pokemon.abilities.map(ability => ability.ability.name).join(', ');
          const stats = pokemon.stats.map(stat => `${stat.stat.name}: ${stat.base_stat}`).join(', ');
  
          const pokemonCard = `
            <div class="bg-white p-4 rounded shadow-md">
              <h2 class="text-2xl font-bold">${pokemon.name}</h2>
              <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
              <p><strong>ID:</strong> ${pokemon.id}</p>
              <p><strong>Type:</strong> ${pokemon.types.map(type => type.type.name).join(', ')}</p>
              <p><strong>Abilities:</strong> ${abilities}</p>
              <p><strong>Stats:</strong> ${stats}</p>
              <p><strong>Description:</strong> ${description}</p>
            </div>
          `;
          $('#pokemon-list').html(pokemonCard);
        });
    }
  
    function fetchEvolutionChain(id) {
      $.ajax({
        url: `https://pokeapi.co/api/v2/pokemon-species/${id}`,
        method: 'GET',
        success: function (data) {
          $.ajax({
            url: data.evolution_chain.url,
            method: 'GET',
            success: function (evolutionData) {
              displayEvolutionChain(evolutionData.chain);
            }
          });
        }
      });
    }
  
    function displayEvolutionChain(chain) {
      let chainHtml = '';
      let current = chain;
  
      while (current) {
        chainHtml += `<p>${current.species.name}</p>`;
        current = current.evolves_to[0];
      }
  
      $('#evolution-chain').html(chainHtml);
    }
  
    function displayRelatedPokemon(pokemon) {
      const relatedPokemonHtml = pokemon.types.map(type => {
        fetch(`https://pokeapi.co/api/v2/type/${type.type.name}`)
          .then(response => response.json())
          .then(data => {
            const relatedPokemon = data.pokemon.slice(0, 5).map(p => `<p>${p.pokemon.name}</p>`).join('');
            $('#related-pokemon').append(`
              <div>
                <h3 class="text-xl font-bold">${type.type.name} Type Pokémon</h3>
                ${relatedPokemon}
              </div>
            `);
          });
      }).join('');
  
      $('#related-pokemon').html(relatedPokemonHtml);
    }
  
    fetchPokemonList();
  });
  