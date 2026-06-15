<template>
  <div class="bg-white rounded-xl shadow-md p-4">
    <div class="mb-2 text-sm text-gray-600 font-medium">Map view</div>
    
    <div v-if="loading" class="w-full h-[500px] rounded-md border flex items-center justify-center bg-gray-50">
      <span class="text-blue-600 font-semibold animate-pulse">Loading map data...</span>
    </div>
    
    <div v-else ref="mapContainer" class="w-full h-[500px] rounded-md border overflow-hidden"></div>

    <div class="mt-3 text-sm text-gray-600 flex flex-wrap gap-4 items-center">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 bg-blue-600 rounded-full inline-block"></span>
        <span>Listings: <strong class="text-gray-700">{{ totalListings }}</strong></span>
      </div>
      
      <div v-if="anomalies && anomalies.length > 0" class="flex items-center gap-2">
        <span class="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
        <span>Anomalies: <strong class="text-red-600">{{ anomalies.reduce((sum, a) => sum + a.value, 0) }}</strong></span>
      </div>
      
      <div class="ml-auto text-xs text-gray-400">
        Showing: <strong class="text-gray-700">{{ displayLocation }}</strong>
      </div>
    </div>

    <div v-if="anomalies && anomalies.length > 0" class="mt-3 pt-3 border-t border-gray-200">
      <div class="text-xs font-semibold text-gray-500 mb-2">Anomalies Found:</div>
      <div class="flex flex-wrap gap-2">
        <span 
          v-for="(anomaly, index) in anomalies" 
          :key="index"
          class="px-2 py-1 rounded text-xs font-medium"
          :class="{
            'bg-red-100 text-red-700': anomaly.color === 'red',
            'bg-orange-100 text-orange-700': anomaly.color === 'orange',
            'bg-yellow-100 text-yellow-700': anomaly.color === 'yellow',
            'bg-gray-100 text-gray-700': anomaly.color === 'gray'
          }"
        >
          {{ anomaly.name }}: {{ anomaly.value }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Componente de visualização de mapa interativo usando Leaflet
 * Exibe marcadores coloridos baseados em anomalias dos listings
 * Cores: vermelho (preço em falta), laranja (preço alto), amarelo (licença), cinza (sem reviews), azul (normal)
 */
export default {
  name: "MapDisplay",
  props: {
    listings: {
      type: Array,
      required: true
    },
    city: {
      type: String,
      default: 'ALL'
    },
    country: {
      type: String,
      default: ''
    },
    neighbourhood: {
      type: String,
      default: 'ALL'
    },
    totalListings: {
      type: Number,
      default: 0
    },
    anomalies: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      map: null, // Instância do mapa Leaflet
      markers: [], // Array de marcadores criados
      markerLayer: null, // Layer group do Leaflet para agrupar marcadores
      lastListingIds: null // Cache dos IDs dos listings para evitar atualizações desnecessárias
    }
  },
  computed: {
    displayLocation() {
      if (this.city === 'All') {
        return `All ${this.country} Cities`
      }
      let location = this.city
      if (this.neighbourhood && this.neighbourhood !== 'All') {
        location += `, ${this.neighbourhood}`
      }
      return location
    }
  },
  watch: {
    // Destrói o mapa quando loading=true para evitar instâncias "fantasmas" do Leaflet
    // Re-inicializa quando loading=false e o container volta ao DOM
    loading: {
      handler(isLoading) {
        if (isLoading) {
          if (this.map) {
            this.map.remove()
            this.map = null
            this.markerLayer = null
            this.markers = []
          }
        } else {
          this.$nextTick(() => {
            if (!this.map && this.$refs.mapContainer) {
              this.initMap()
              this.$nextTick(() => {
                this.updateMarkers(this.listings)
              })
            }
          })
        }
      },
      immediate: true
    },
    // Otimização: só atualiza marcadores se realmente mudou (evita fechar popups abertos)
    // Compara: comprimento → IDs → coordenadas (em ordem de eficiência)
    listings: {
      handler(newListings, oldListings) {
        if (!this.map || !this.markerLayer) return

        if (oldListings && newListings) {
          // Comparação rápida: comprimento diferente = precisa atualizar
          if (oldListings.length !== newListings.length) {
            this.$nextTick(() => {
              newListings?.length > 0 ? this.updateMarkers(newListings) : this.clearMarkers()
            })
            return
          }

          // Comparação de IDs usando Sets (mais eficiente)
          const oldIds = new Set(oldListings.map(l => l?.id).filter(Boolean))
          const newIds = new Set(newListings.map(l => l?.id).filter(Boolean))
          
          if (oldIds.size !== newIds.size) {
            this.$nextTick(() => this.updateMarkers(newListings))
            return
          }

          // Verificar se algum ID foi removido
          let idsChanged = false
          for (const id of oldIds) {
            if (!newIds.has(id)) {
              idsChanged = true
              break
            }
          }

          // Se IDs são os mesmos, verificar se coordenadas mudaram
          if (!idsChanged) {
            const coordsChanged = oldListings.some((old, idx) => {
              const newItem = newListings[idx]
              if (!newItem || old.id !== newItem.id) return true
              return old.coordinates?.lat !== newItem.coordinates?.lat ||
                     old.coordinates?.lng !== newItem.coordinates?.lng
            })

            if (!coordsChanged) return // Nada mudou, não atualizar
          }
        }
        
        this.$nextTick(() => {
          newListings?.length > 0 ? this.updateMarkers(newListings) : this.clearMarkers()
        })
      },
      immediate: false,
      deep: false // false para evitar detecção profunda desnecessária
    },
    city() {
      if (this.map) {
        this.updateMapView()
      }
    },
    country() {
      if (this.map) {
        this.updateMapView()
      }
    }
  },
  /**
   * Lifecycle hook executado quando o componente é montado
   * Inicializa o mapa e adiciona marcadores se os dados já estiverem carregados
   */
  mounted() {
    this.$nextTick(() => {
      if (!this.loading && !this.map && this.$refs.mapContainer) {
        this.initMap()
        this.$nextTick(() => this.updateMarkers(this.listings))
      }
    })
  },
  /**
   * Lifecycle hook executado antes do componente ser desmontado
   * Limpa todos os marcadores e remove o mapa para evitar memory leaks
   */
  beforeUnmount() {
    if (this.markerLayer) {
      this.markerLayer.clearLayers()
      this.markers = []
      this.markerLayer = null
    }
    if (this.map) {
      this.map.remove()
      this.map = null
    }
    this.lastListingIds = null
  },
  methods: {
    /**
     * Remove todos os marcadores do mapa
     * Limpa o layer group e o array de marcadores
     */
    clearMarkers() {
      this.markerLayer.clearLayers()
      this.markers = []
    },
    /**
     * Inicializa o mapa Leaflet no container
     * Define centro e zoom baseado na cidade/país selecionado
     * Adiciona tile layer do OpenStreetMap e cria layer group para marcadores
     */
    initMap() {
      if (!this.$refs.mapContainer) {
        console.warn('Map container not found')
        return
      }

      if (this.map) {
        this.map.remove()
        this.map = null
      }

      // Coordenadas padrão (centro de Portugal)
      let center = [39.5, -8.0]
      let zoom = 6

      if (this.city === 'All' && this.country) {
        const countryCenters = {
          Portugal: [39.5, -8.0],
          Spain: [40.0, -3.0],
          France: [46.0, 2.0],
          Italy: [41.9, 12.5]
        }
        center = countryCenters[this.country] || center
        zoom = 6
      } else if (this.city !== 'All') {
        const cityListing = this.listings.find(l => l.coordinates?.lat && l.coordinates?.lng)
        if (cityListing) {
          center = [cityListing.coordinates.lat, cityListing.coordinates.lng]
          zoom = 12
        } else {
          const cityCenters = {
            Lisbon: [38.7223, -9.1393],
            Porto: [41.1579, -8.6291],
            Braga: [41.5518, -8.4229],
            Coimbra: [40.2033, -8.4103],
            Faro: [37.0194, -7.9322],
            Madrid: [40.4168, -3.7038],
            Barcelona: [41.3851, 2.1734],
            Seville: [37.3891, -5.9845],
            Paris: [48.8566, 2.3522],
            Lyon: [45.7640, 4.8357],
            Marseille: [43.2965, 5.3698],
            Rome: [41.9028, 12.4964],
            Milan: [45.4642, 9.1900],
            Florence: [43.7696, 11.2558]
          }
          if (cityCenters[this.city]) {
            center = cityCenters[this.city]
            zoom = 12
          }
        }
      }

      this.map = L.map(this.$refs.mapContainer, {
        center: center,
        zoom: zoom,
        zoomControl: true
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map)

      this.markerLayer = L.layerGroup().addTo(this.map)

      this.$nextTick(() => {
        if (this.map) this.map.invalidateSize()
      })
    },

    /**
     * Determina o tipo de anomalia de maior prioridade para definir a cor do marcador
     * Prioridade: Missing Price > High Price > License Issues > No Reviews
     * @param {Object} listing - Listing a verificar
     * @param {number} highPriceThreshold - Threshold dinâmico (percentil 90)
     * @returns {string|null} Tipo de anomalia ou null se não houver
     */
    getAnomalyType(listing, highPriceThreshold) {
      // Prioridade 1: Preço em falta (mais crítico)
      if (listing.price === null || listing.price === undefined) {
        return 'missing-price'
      }
      
      // Prioridade 2: Preço alto (acima do percentil 90)
      if (typeof listing.price === 'number' && listing.price > highPriceThreshold) {
        return 'high-price'
      }
      
      // Prioridade 3: Problemas com licença
      const license = listing.license
      if (license === null || license === undefined || license === '' || 
          license === 'Exempt' || String(license).toLowerCase() === 'null') {
        return 'license-issues'
      }
      
      // Prioridade 4: Sem reviews (menos crítico)
      if (!listing.last_review) {
        return 'no-reviews'
      }
      
      return null // Listing normal, sem anomalias
    },

    /**
     * Detecta TODAS as anomalias de um listing (não apenas a de maior prioridade)
     * Usado para exibir todas as anomalias no popup do marcador
     * @param {Object} listing - Listing a verificar
     * @param {number} highPriceThreshold - Threshold dinâmico (percentil 90)
     * @returns {Array} Array de objetos { type, label, color } para cada anomalia encontrada
     */
    getAllAnomalies(listing, highPriceThreshold) {
      const anomalies = []
      
      if (listing.price === null || listing.price === undefined) {
        anomalies.push({ type: 'missing-price', label: 'Missing Price', color: '#ef4444' })
      }
      
      if (typeof listing.price === 'number' && listing.price > highPriceThreshold) {
        anomalies.push({ type: 'high-price', label: `High Price (> ${highPriceThreshold}€)`, color: '#f97316' })
      }
      
      const license = listing.license
      if (license === null || license === undefined || license === '' || 
          license === 'Exempt' || String(license).toLowerCase() === 'null') {
        anomalies.push({ type: 'license-issues', label: 'License Issues', color: '#eab308' })
      }
      
      if (!listing.last_review) {
        anomalies.push({ type: 'no-reviews', label: 'No Reviews', color: '#6b7280' })
      }
      
      return anomalies
    },

    /**
     * Retorna a cor do marcador baseado no tipo de anomalia
     * Cores: vermelho (preço em falta), laranja (preço alto), amarelo (licença), cinza (sem reviews), azul (normal)
     * @param {string|null} anomalyType - Tipo de anomalia ou null se não houver
     * @returns {string} Código hexadecimal da cor
     */
    getMarkerColor(anomalyType) {
      const colors = {
        'missing-price': '#ef4444',
        'high-price': '#f97316',
        'license-issues': '#eab308',
        'no-reviews': '#6b7280',
        null: '#3b82f6'
      }
      return colors[anomalyType] || colors[null]
    },

    /**
     * Atualiza os marcadores no mapa baseado nos listings filtrados
     * Remove marcadores antigos e cria novos com cores baseadas em anomalias
     * Evita atualizações desnecessárias comparando IDs em cache
     */
    updateMarkers(listings) {
      if (!this.map || !this.markerLayer) return
      if (!listings || !Array.isArray(listings)) return

      // Cache: se os IDs são os mesmos, não atualizar (evita fechar popups abertos)
      const currentIds = listings.map(l => l?.id).filter(Boolean).sort().join(',')
      if (this.lastListingIds === currentIds && this.markers.length > 0) {
        return
      }

      this.lastListingIds = currentIds
      this.clearMarkers()

      // Filtrar listings com coordenadas válidas e remover duplicados por ID
      const seenIds = new Set()
      const listingsWithCoords = listings.filter(l => {
        if (!l?.coordinates) return false
        
        // Evitar duplicados por ID
        const listingId = l.id
        if (listingId && seenIds.has(listingId)) return false
        if (listingId) seenIds.add(listingId)
        
        // Validação rigorosa de coordenadas
        const { lat, lng } = l.coordinates
        return typeof lat === 'number' && typeof lng === 'number' &&
               !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng) &&
               lat !== 0 && lng !== 0 && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
      })

      if (listingsWithCoords.length === 0) return

      // Calcular threshold dinâmico para "High Price" usando percentil 90
      // Mesma lógica do MapContent.vue para garantir consistência
      const validPrices = listingsWithCoords
        .filter(l => typeof l.price === 'number' && l.price !== null && l.price > 0)
        .map(l => l.price)
        .sort((a, b) => a - b)
      
      let highPriceThreshold = 100 // Valor padrão
      if (validPrices.length > 0) {
        // Percentil 90: índice = ceil(length * 0.9) - 1
        const index = Math.ceil(validPrices.length * 0.9) - 1
        highPriceThreshold = validPrices[Math.max(0, Math.min(index, validPrices.length - 1))]
        highPriceThreshold = Math.ceil(highPriceThreshold / 10) * 10 // Arredondar para múltiplo de 10
      }

      // Criar marcadores para cada listing válido
      listingsWithCoords.forEach(listing => {
        try {
          const { lat, lng } = listing.coordinates
          if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) return

          // Determinar cor do marcador baseado na anomalia de maior prioridade
          const anomalyType = this.getAnomalyType(listing, highPriceThreshold)
          const markerColor = this.getMarkerColor(anomalyType)
          
          // Detectar todas as anomalias para exibir no popup
          const allAnomalies = this.getAllAnomalies(listing, highPriceThreshold)

          // Criar ícone customizado (círculo colorido)
          const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
          })

          const marker = L.marker([lat, lng], { icon: icon })

          // Construir HTML do popup com informações do listing e todas as anomalias
          let anomaliesHtml = ''
          if (allAnomalies.length > 0) {
            anomaliesHtml = '<br><div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;"><strong style="font-size: 12px; color: #374151;">Anomalies:</strong><ul style="margin: 4px 0 0 0; padding-left: 20px; font-size: 11px;">'
            allAnomalies.forEach(anomaly => {
              anomaliesHtml += `<li style="color: ${anomaly.color}; margin: 2px 0;">${anomaly.label}</li>`
            })
            anomaliesHtml += '</ul></div>'
          }
          
          const popupContent = `
            <div style="min-width: 150px;">
              <strong>${listing.name || 'Unnamed Listing'}</strong><br>
              ${listing.city ? `City: ${listing.city}<br>` : ''}
              ${listing.neighbourhood_group ? `Area: ${listing.neighbourhood_group}<br>` : ''}
              ${listing.price ? `Price: €${listing.price}<br>` : 'Price: N/A<br>'}
              ${listing.host_name ? `Host: ${listing.host_name}` : ''}
              ${anomaliesHtml}
            </div>
          `
          marker.bindPopup(popupContent)
          marker.addTo(this.markerLayer)
          this.markers.push(marker)
        } catch (error) {
          console.error('Error creating marker for listing:', listing.id, error)
        }
      })

      // Garantir que o mapa recalcula o tamanho após adicionar marcadores
      this.map.invalidateSize()
    },

    /**
     * Atualiza a view do mapa (centro e zoom) baseado nos filtros selecionados
     * Usa coordenadas dos listings quando disponível, senão usa coordenadas conhecidas
     * NOTA: Não é chamado em updateMarkers() para não resetar a posição durante interações do usuário
     */
    updateMapView() {
      if (!this.map) return

      let center = [39.5, -8.0] // Centro de Portugal (padrão)
      let zoom = 6

      if (this.city === 'All' && this.country) {
        // Vista de país: zoom 6, centro do país
        const countryCenters = {
          Portugal: [39.5, -8.0],
          Spain: [40.0, -3.0],
          France: [46.0, 2.0],
          Italy: [41.9, 12.5]
        }
        center = countryCenters[this.country] || center
        zoom = 6
      } else if (this.city !== 'All') {
        // Vista de cidade: zoom 12, tenta usar coordenadas dos listings primeiro
        const cityListing = this.listings.find(l => l.coordinates?.lat && l.coordinates?.lng)
        if (cityListing) {
          center = [cityListing.coordinates.lat, cityListing.coordinates.lng]
          zoom = 12
        } else {
          // Fallback: coordenadas conhecidas por cidade
          const cityCenters = {
            Lisbon: [38.7223, -9.1393],
            Porto: [41.1579, -8.6291],
            Braga: [41.5518, -8.4229],
            Coimbra: [40.2033, -8.4103],
            Faro: [37.0194, -7.9322],
            Madrid: [40.4168, -3.7038],
            Barcelona: [41.3851, 2.1734],
            Seville: [37.3891, -5.9845],
            Paris: [48.8566, 2.3522],
            Lyon: [45.7640, 4.8357],
            Marseille: [43.2965, 5.3698],
            Rome: [41.9028, 12.4964],
            Milan: [45.4642, 9.1900],
            Florence: [43.7696, 11.2558]
          }
          if (cityCenters[this.city]) {
            center = cityCenters[this.city]
            zoom = 12
          }
        }
      }

      this.map.setView(center, zoom)
      this.map.invalidateSize()
    }

  }
}
</script>

<style scoped>
/* Estilos para o container do mapa */
:deep(.leaflet-container) {
  height: 500px !important;
  width: 100% !important;
  z-index: 0;
}

/* Estilos para marcadores customizados */
:deep(.custom-marker) {
  background: transparent;
  border: none;
}
</style>