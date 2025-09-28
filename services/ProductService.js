// services/ProductService.js - Enhanced with multiple barcode APIs (Go-UPC removed)
class ProductService {
  constructor() {
    // API configurations - Use environment variables
    this.barcodeSpiderKey = 'itvt03xhs26e03sdcae82gkawz8dqm'; // From your env
    this.barcodeLookupKey = 'itvt03xhs26e03sdcae82gkawz8dqm'; // From your env  
    this.upcdatabaseKey = 'E7DAA74553F182CB356C68BD394974B3'; // From your env
    
    // Base URLs for different services
    this.openFoodFactsBase = 'https://world.openfoodfacts.org/api/v0/product/';
    this.barcodeLookupBase = 'https://api.barcodelookup.com/v3/products';
    this.eanSearchBase = 'https://api.ean-search.org/api';
  }

  // Main product lookup function
  async lookupProduct(barcode) {
    const cleanedBarcode = this.cleanBarcode(barcode);
    
    if (!this.isValidProductBarcode(cleanedBarcode)) {
      throw new Error('Invalid product barcode format');
    }

    // Try multiple APIs in order of preference and reliability
    const lookupMethods = [
      () => this.lookupBarcodeLookup(cleanedBarcode),
      () => this.lookupOpenFoodFacts(cleanedBarcode),
      () => this.lookupEANSearch(cleanedBarcode),
      () => this.lookupBarcodeSpider(cleanedBarcode),
      () => this.lookupUPCDatabase(cleanedBarcode),
      () => this.lookupFallback(cleanedBarcode)
    ];

    let lastError = null;
    for (const method of lookupMethods) {
      try {
        const result = await method();
        if (result && result.found) {
          return result;
        }
      } catch (error) {
        console.warn('Lookup method failed:', error.message);
        lastError = error;
        continue;
      }
    }

    return {
      found: false,
      barcode: cleanedBarcode,
      message: 'Product not found in any database',
      error: lastError?.message || 'No lookup services available'
    };
  }

  // Clean and validate barcode
  cleanBarcode(barcode) {
    return barcode.replace(/[\s\-]/g, '').trim();
  }

  isValidProductBarcode(barcode) {
    // Check for common product barcode formats
    const patterns = [
      /^\d{8}$/,    // EAN-8
      /^\d{12}$/,   // UPC-A
      /^\d{13}$/,   // EAN-13
      /^\d{14}$/,   // GTIN-14
      /^\d{10}$/,   // ISBN-10
      /^97[89]\d{10}$/, // ISBN-13
    ];
    
    return patterns.some(pattern => pattern.test(barcode));
  }

  // Barcode Lookup API (Comprehensive commercial database)
  async lookupBarcodeLookup(barcode) {
    if (!this.barcodeLookupKey) {
      throw new Error('Barcode Lookup API key not configured');
    }

    try {
      const response = await fetch(`${this.barcodeLookupBase}?barcode=${barcode}&formatted=y&key=${this.barcodeLookupKey}`);
      const data = await response.json();

      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        return {
          found: true,
          source: 'Barcode Lookup',
          barcode: barcode,
          name: product.title || product.product_name || 'Unknown Product',
          brand: product.brand || product.manufacturer || 'Unknown Brand',
          category: product.category || 'Unknown Category',
          image: product.images?.[0] || product.image || null,
          description: product.description || product.title || '',
          price: product.msrp || product.price || null,
          currency: product.currency || 'USD',
          additionalInfo: {
            upc: product.barcode_number,
            manufacturer: product.manufacturer || '',
            model: product.model || '',
            size: product.size || '',
            color: product.color || '',
            weight: product.weight || '',
            dimensions: product.dimension || '',
            features: product.features || [],
            reviews: product.reviews || [],
            stores: product.stores || []
          },
          url: `https://www.barcodelookup.com/${barcode}`,
          rawData: product
        };
      }
      
      return { found: false };
    } catch (error) {
      console.error('Barcode Lookup API failed:', error);
      throw error;
    }
  }

  // OpenFoodFacts API (Free, good for food products)
  async lookupOpenFoodFacts(barcode) {
    try {
      const response = await fetch(`${this.openFoodFactsBase}${barcode}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        return {
          found: true,
          source: 'OpenFoodFacts',
          barcode: barcode,
          name: product.product_name || product.product_name_en || 'Unknown Product',
          brand: product.brands || 'Unknown Brand',
          category: product.categories || 'Food & Beverages',
          image: product.image_url || product.image_front_url || null,
          description: product.generic_name || product.product_name || '',
          ingredients: product.ingredients_text || null,
          nutrition: this.extractNutrition(product),
          nutritionGrade: product.nutrition_grade_fr || product.nutriscore_grade || null,
          novaGroup: product.nova_group || null,
          additionalInfo: {
            countries: product.countries || '',
            stores: product.stores || '',
            packaging: product.packaging || '',
            labels: product.labels || '',
            allergens: product.allergens || '',
            traces: product.traces || '',
            quantity: product.quantity || '',
            servingSize: product.serving_size || ''
          },
          url: `https://world.openfoodfacts.org/product/${barcode}`,
          rawData: product
        };
      }
      
      return { found: false };
    } catch (error) {
      console.error('OpenFoodFacts lookup failed:', error);
      throw error;
    }
  }

  // EAN-Search.org API (Free with rate limits)
  async lookupEANSearch(barcode) {
    try {
      const response = await fetch(`${this.eanSearchBase}?token=0&op=barcode-lookup&format=json&ean=${barcode}`);
      const data = await response.json();

      if (data.length > 0 && data[0].name) {
        const product = data[0];
        return {
          found: true,
          source: 'EAN-Search',
          barcode: barcode,
          name: product.name || 'Unknown Product',
          brand: product.vendor || 'Unknown Brand',
          category: product.category || 'Unknown Category',
          image: null,
          description: product.name || '',
          additionalInfo: {
            issuing_country: product.issuing_country || ''
          },
          url: `https://www.ean-search.org/?q=${barcode}`,
          rawData: product
        };
      }

      return { found: false };
    } catch (error) {
      console.error('EAN-Search lookup failed:', error);
      throw error;
    }
  }

  // BarcodeSpider API (Requires API key)
  async lookupBarcodeSpider(barcode) {
    if (!this.barcodeSpiderKey) {
      throw new Error('BarcodeSpider API key not configured');
    }

    try {
      const response = await fetch(`https://api.barcodespider.com/v1/lookup?token=${this.barcodeSpiderKey}&upc=${barcode}`);
      const data = await response.json();

      if (data.item_response && data.item_response.code === 200) {
        const item = data.item_response.item_attributes;
        return {
          found: true,
          source: 'BarcodeSpider',
          barcode: barcode,
          name: item.title || 'Unknown Product',
          brand: item.brand || 'Unknown Brand',
          category: item.category || 'Unknown Category',
          image: item.image || null,
          description: item.description || '',
          price: item.lowest_recorded_price || null,
          additionalInfo: {
            size: item.size || '',
            weight: item.weight || '',
            color: item.color || '',
            model: item.model || ''
          },
          url: null,
          rawData: item
        };
      }

      return { found: false };
    } catch (error) {
      console.error('BarcodeSpider lookup failed:', error);
      throw error;
    }
  }

  // UPCDatabase API (Requires API key)
  async lookupUPCDatabase(barcode) {
    if (!this.upcdatabaseKey) {
      throw new Error('UPCDatabase API key not configured');
    }

    try {
      const response = await fetch(`https://api.upcdatabase.org/product/${barcode}/${this.upcdatabaseKey}`);
      const data = await response.json();

      if (data.valid === 'true') {
        return {
          found: true,
          source: 'UPCDatabase',
          barcode: barcode,
          name: data.title || 'Unknown Product',
          brand: data.brand || 'Unknown Brand',
          category: data.category || 'Unknown Category',
          image: null,
          description: data.description || '',
          additionalInfo: {
            size: data.size || '',
            weight: data.weight || '',
            color: data.color || ''
          },
          url: null,
          rawData: data
        };
      }

      return { found: false };
    } catch (error) {
      console.error('UPCDatabase lookup failed:', error);
      throw error;
    }
  }

  // Fallback method - creates a basic product info
  async lookupFallback(barcode) {
    return {
      found: true,
      source: 'Fallback',
      barcode: barcode,
      name: 'Unknown Product',
      brand: 'Unknown Brand',
      category: this.guessCategory(barcode),
      image: null,
      description: `Product with barcode ${barcode}`,
      additionalInfo: {
        note: 'Product information not found in database. You can help by adding this product to OpenFoodFacts or other product databases.',
        suggestedActions: [
          'Search online manually',
          'Check manufacturer website',
          'Add to OpenFoodFacts database'
        ]
      },
      url: `https://world.openfoodfacts.org/cgi/product_jqm2.pl?code=${barcode}&action=display`,
      rawData: null,
      isUnknown: true
    };
  }

  // Extract nutrition information
  extractNutrition(product) {
    if (!product.nutriments) return null;

    const nutrition = {};
    
    // Energy
    nutrition.energy = product.nutriments['energy-kcal_100g'] || product.nutriments.energy_100g || null;
    nutrition.energyUnit = 'kcal';
    
    // Macronutrients
    nutrition.fat = product.nutriments.fat_100g || null;
    nutrition.saturatedFat = product.nutriments['saturated-fat_100g'] || null;
    nutrition.carbohydrates = product.nutriments.carbohydrates_100g || null;
    nutrition.sugars = product.nutriments.sugars_100g || null;
    nutrition.protein = product.nutriments.proteins_100g || null;
    nutrition.fiber = product.nutriments.fiber_100g || null;
    
    // Minerals
    nutrition.salt = product.nutriments.salt_100g || null;
    nutrition.sodium = product.nutriments.sodium_100g || null;
    
    // Remove null values
    Object.keys(nutrition).forEach(key => {
      if (nutrition[key] === null) delete nutrition[key];
    });
    
    return Object.keys(nutrition).length > 0 ? nutrition : null;
  }

  // Guess category based on barcode prefix
  guessCategory(barcode) {
    const prefix = barcode.substring(0, 3);
    
    const categoryMap = {
      // Food & Beverages
      '300': 'Food & Beverages', '400': 'Food & Beverages', '500': 'Food & Beverages',
      '600': 'Food & Beverages', '700': 'Food & Beverages',
      
      // Books & Media  
      '800': 'Books & Media', '900': 'Books & Media',
      '978': 'Books', '979': 'Books',
      
      // Health & Beauty
      '012': 'Pharmaceuticals', '013': 'Pharmaceuticals',
      '030': 'Health & Beauty', '031': 'Health & Beauty',
      
      // General categories by country codes
      '000': 'General Merchandise', '001': 'General Merchandise',
      '020': 'General Merchandise', '021': 'General Merchandise',
    };

    return categoryMap[prefix] || 'General Merchandise';
  }

  // Search products by name
  async searchProducts(query, limit = 10) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodedQuery}&search_simple=1&action=process&json=1&page_size=${limit}`);
      const data = await response.json();

      if (data.products && data.products.length > 0) {
        return data.products.map(product => ({
          name: product.product_name || product.product_name_en || 'Unknown Product',
          brand: product.brands || 'Unknown Brand',
          barcode: product.code || '',
          image: product.image_url || product.image_front_url || null,
          category: product.categories || 'Unknown Category',
          nutritionGrade: product.nutrition_grade_fr || null
        }));
      }

      return [];
    } catch (error) {
      console.error('Product search failed:', error);
      return [];
    }
  }

  // API key setters
  setBarcodeSpiderKey(key) { this.barcodeSpiderKey = key; }
  setBarcodeLookupKey(key) { this.barcodeLookupKey = key; }
  setUPCDatabaseKey(key) { this.upcdatabaseKey = key; }

  // Get API status
  getAPIStatus() {
    return {
      barcodeLookup: !!this.barcodeLookupKey,
      barcodeSpider: !!this.barcodeSpiderKey,
      upcDatabase: !!this.upcdatabaseKey,
      openFoodFacts: true, // Always available (free)
      eanSearch: true // Free with rate limits
    };
  }
}

export default new ProductService();