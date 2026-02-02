/**
 * Product Gallery JavaScript
 * Handles image gallery functionality and Add to Cart AJAX
 */

(function() {
  'use strict';

  // ============================================================
  // Product Gallery
  // ============================================================
  class ProductGallery {
    constructor(container) {
      this.container = container;
      this.slides = container.querySelectorAll('[data-slide-index]');
      this.thumbnails = container.querySelectorAll('[data-thumbnail-index]');
      this.dots = container.querySelectorAll('[data-dot-index]');
      this.prevButton = container.querySelector('[data-gallery-prev]');
      this.nextButton = container.querySelector('[data-gallery-next]');
      this.slider = container.querySelector('[data-gallery-slider]');

      this.currentIndex = 0;
      this.totalSlides = this.slides.length;
      this.touchStartX = 0;
      this.touchEndX = 0;
      this.isMobile = window.innerWidth < 768;

      if (this.totalSlides > 0) {
        this.init();
      }
    }

    init() {
      this.bindEvents();
      this.initSwipe();
      this.initLazyLoad();

      // Setup infinite scroll for mobile
      if (this.isMobile && this.totalSlides > 1) {
        this.setupInfiniteScroll();
      }

      // Set initial position for mobile carousel
      if (this.isMobile) {
        this.goToSlide(0);
      }

      // Check for mobile on resize
      window.addEventListener('resize', this.handleResize.bind(this));
    }

    setupInfiniteScroll() {
      if (!this.slider || this.infiniteSetup) return;
      this.infiniteSetup = true;

      // Clone last slide and prepend
      const lastSlide = this.slides[this.totalSlides - 1];
      const lastClone = lastSlide.cloneNode(true);
      lastClone.classList.add('is-clone');
      lastClone.removeAttribute('data-slide-index');
      this.slider.insertBefore(lastClone, this.slider.firstChild);

      // Clone first slide and append
      const firstSlide = this.slides[0];
      const firstClone = firstSlide.cloneNode(true);
      firstClone.classList.add('is-clone');
      firstClone.removeAttribute('data-slide-index');
      this.slider.appendChild(firstClone);

      // Listen for transition end to handle infinite loop jump
      this.slider.addEventListener('transitionend', () => {
        if (this.isTransitioning) {
          this.isTransitioning = false;
          this.handleInfiniteLoop();
        }
      });
    }

    handleInfiniteLoop() {
      // Jump to real slide without animation when on clone
      if (this.currentIndex < 0) {
        this.slider.style.transition = 'none';
        this.currentIndex = this.totalSlides - 1;
        this.updateSliderPosition();
        // Force reflow
        this.slider.offsetHeight;
        this.slider.style.transition = '';
      } else if (this.currentIndex >= this.totalSlides) {
        this.slider.style.transition = 'none';
        this.currentIndex = 0;
        this.updateSliderPosition();
        // Force reflow
        this.slider.offsetHeight;
        this.slider.style.transition = '';
      }
    }

    updateSliderPosition() {
      if (!this.isMobile || !this.slider) return;

      const slideWidth = 85;
      const offset = (100 - slideWidth) / 2;
      // +1 because of prepended clone
      const adjustedIndex = this.infiniteSetup ? this.currentIndex + 1 : this.currentIndex;
      const translateX = offset - (adjustedIndex * slideWidth);
      this.slider.style.transform = `translateX(${translateX}%)`;
    }

    bindEvents() {
      // Thumbnail clicks
      this.thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', () => this.goToSlide(index));
      });

      // Dot clicks
      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => this.goToSlide(index));
      });

      // Arrow buttons
      if (this.prevButton) {
        this.prevButton.addEventListener('click', () => this.prevSlide());
      }

      if (this.nextButton) {
        this.nextButton.addEventListener('click', () => this.nextSlide());
      }

      // Keyboard navigation
      this.container.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          this.prevSlide();
        } else if (e.key === 'ArrowRight') {
          this.nextSlide();
        }
      });
    }

    initSwipe() {
      if (!this.slider) return;

      this.slider.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      this.slider.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
      }, { passive: true });
    }

    handleSwipe() {
      const swipeThreshold = 50;
      const diff = this.touchStartX - this.touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swiped left - next slide
          this.nextSlide();
        } else {
          // Swiped right - prev slide
          this.prevSlide();
        }
      }
    }

    goToSlide(index) {
      // Handle infinite scroll on mobile
      if (this.isMobile && this.infiniteSetup) {
        // Allow going to clones (-1 and totalSlides)
        if (index < -1) index = -1;
        if (index > this.totalSlides) index = this.totalSlides;
        this.isTransitioning = (index < 0 || index >= this.totalSlides);
      } else if (this.isMobile) {
        if (index < 0) index = 0;
        if (index >= this.totalSlides) index = this.totalSlides - 1;
      } else {
        // Desktop: wrap around
        if (index < 0) index = this.totalSlides - 1;
        if (index >= this.totalSlides) index = 0;
      }

      this.currentIndex = index;

      // Calculate visual index for UI updates (handles clones)
      let visualIndex = index;
      if (index < 0) visualIndex = this.totalSlides - 1;
      if (index >= this.totalSlides) visualIndex = 0;

      // Update slides
      this.slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === visualIndex);
      });

      // Update thumbnails
      this.thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('is-active', i === visualIndex);
      });

      // Update dots
      this.dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === visualIndex);
      });

      // Mobile carousel: slide to position
      this.updateSliderPosition();

      // Scroll thumbnail into view if needed
      if (this.thumbnails[visualIndex]) {
        this.thumbnails[visualIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }

    nextSlide() {
      this.goToSlide(this.currentIndex + 1);
    }

    prevSlide() {
      this.goToSlide(this.currentIndex - 1);
    }

    handleResize() {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth < 768;

      // Reset slider position when switching between mobile/desktop
      if (wasMobile !== this.isMobile) {
        if (this.isMobile) {
          // Setup infinite scroll if not already done
          if (this.totalSlides > 1 && !this.infiniteSetup) {
            this.setupInfiniteScroll();
          }
          // Ensure currentIndex is valid
          if (this.currentIndex < 0 || this.currentIndex >= this.totalSlides) {
            this.currentIndex = 0;
          }
          this.goToSlide(this.currentIndex);
        } else if (this.slider) {
          this.slider.style.transform = '';
        }
      }
    }

    initLazyLoad() {
      const images = this.container.querySelectorAll('img[loading="lazy"]');

      images.forEach(img => {
        if (img.complete) {
          img.classList.add('is-loaded');
        } else {
          img.addEventListener('load', () => {
            img.classList.add('is-loaded');
          });
        }
      });
    }
  }

  // ============================================================
  // Add to Cart
  // ============================================================
  class AddToCart {
    constructor(form) {
      this.form = form;
      this.submitButton = form.querySelector('[data-add-to-cart]');
      this.submitButtonText = form.querySelector('[data-add-to-cart-text]');

      if (this.form) {
        this.init();
      }
    }

    init() {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleSubmit(e) {
      e.preventDefault();

      if (this.submitButton.disabled) return;

      this.setLoading(true);

      const formData = new FormData(this.form);

      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        this.onSuccess(data);
      } catch (error) {
        console.error('Add to cart error:', error);
        this.onError(error);
      } finally {
        this.setLoading(false);
      }
    }

    setLoading(isLoading) {
      this.submitButton.classList.toggle('is-loading', isLoading);
      this.submitButton.disabled = isLoading;
    }

    onSuccess(data) {
      // Update cart count
      this.updateCartCount();

      // Show success toast
      this.showToast(window.theme?.strings?.addedToCart || 'Zum Warenkorb hinzugefügt', 'success');

      // Optionally open cart drawer
      const cartDrawer = document.getElementById('cart-drawer');
      if (cartDrawer) {
        cartDrawer.classList.add('is-open');
        cartDrawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('cart-drawer-open');
        this.updateCartDrawer();
      }
    }

    onError(error) {
      this.showToast(window.theme?.strings?.cartError || 'Fehler beim Hinzufügen zum Warenkorb', 'error');
    }

    async updateCartCount() {
      try {
        const response = await fetch('/cart.js');
        const cart = await response.json();

        const cartCountElements = document.querySelectorAll('[data-cart-count]');
        cartCountElements.forEach(el => {
          el.textContent = cart.item_count;
          el.classList.toggle('is-hidden', cart.item_count === 0);
        });

        // Update theme.cartCount
        if (window.theme) {
          window.theme.cartCount = cart.item_count;
        }
      } catch (error) {
        console.error('Error updating cart count:', error);
      }
    }

    async updateCartDrawer() {
      try {
        const response = await fetch('/cart.js');
        const cart = await response.json();

        const cartItemsContainer = document.getElementById('cart-drawer-items');
        const cartSubtotal = document.getElementById('cart-drawer-subtotal');

        if (cartItemsContainer) {
          let itemsHtml = '';

          if (cart.items.length === 0) {
            itemsHtml = '<p class="cart-drawer__empty">Dein Warenkorb ist leer.</p>';
          } else {
            cart.items.forEach(item => {
              itemsHtml += `
                <div class="cart-drawer__item">
                  <div class="cart-drawer__item-image">
                    <img src="${item.image}" alt="${item.title}" width="80" height="80">
                  </div>
                  <div class="cart-drawer__item-info">
                    <h4 class="cart-drawer__item-title">${item.product_title}</h4>
                    ${item.variant_title ? `<p class="cart-drawer__item-variant">${item.variant_title}</p>` : ''}
                    <div class="cart-drawer__item-price">
                      <span class="cart-drawer__item-quantity">${item.quantity} x </span>
                      <span>${this.formatMoney(item.price)}</span>
                    </div>
                  </div>
                </div>
              `;
            });
          }

          cartItemsContainer.innerHTML = itemsHtml;
        }

        if (cartSubtotal) {
          cartSubtotal.textContent = this.formatMoney(cart.total_price);
        }
      } catch (error) {
        console.error('Error updating cart drawer:', error);
      }
    }

    formatMoney(cents) {
      const amount = (cents / 100).toFixed(2).replace('.', ',');
      return `${amount} €`;
    }

    showToast(message, type = 'success') {
      // Remove existing toast
      const existingToast = document.querySelector('.toast');
      if (existingToast) {
        existingToast.remove();
      }

      // Create toast
      const toast = document.createElement('div');
      toast.className = `toast toast--${type}`;
      toast.textContent = message;
      document.body.appendChild(toast);

      // Trigger animation
      requestAnimationFrame(() => {
        toast.classList.add('is-visible');
      });

      // Remove toast after delay
      setTimeout(() => {
        toast.classList.remove('is-visible');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  }

  // ============================================================
  // Quantity Selector
  // ============================================================
  class QuantitySelector {
    constructor(container) {
      this.container = container;
      this.input = container.querySelector('[data-quantity-input]');
      this.minusButton = container.querySelector('[data-quantity-minus]');
      this.plusButton = container.querySelector('[data-quantity-plus]');

      if (this.input) {
        this.init();
      }
    }

    init() {
      if (this.minusButton) {
        this.minusButton.addEventListener('click', () => this.decrease());
      }

      if (this.plusButton) {
        this.plusButton.addEventListener('click', () => this.increase());
      }

      this.input.addEventListener('change', () => this.validateInput());
    }

    decrease() {
      const currentValue = parseInt(this.input.value) || 1;
      const minValue = parseInt(this.input.min) || 1;

      if (currentValue > minValue) {
        this.input.value = currentValue - 1;
        this.input.dispatchEvent(new Event('change'));
      }
    }

    increase() {
      const currentValue = parseInt(this.input.value) || 1;
      const maxValue = parseInt(this.input.max) || 99999;

      if (currentValue < maxValue) {
        this.input.value = currentValue + 1;
        this.input.dispatchEvent(new Event('change'));
      }
    }

    validateInput() {
      let value = parseInt(this.input.value) || 1;
      const minValue = parseInt(this.input.min) || 1;
      const maxValue = parseInt(this.input.max) || 99999;

      if (value < minValue) value = minValue;
      if (value > maxValue) value = maxValue;

      this.input.value = value;
    }
  }

  // ============================================================
  // Variant Selector
  // ============================================================
  class VariantSelector {
    constructor(section) {
      this.section = section;
      this.productJson = section.querySelector('[data-product-json]');
      this.variantIdInput = section.querySelector('[data-variant-id]');
      this.selects = section.querySelectorAll('[data-option-index]');
      this.addToCartButton = section.querySelector('[data-add-to-cart]');
      this.addToCartText = section.querySelector('[data-add-to-cart-text]');
      this.priceContainer = section.querySelector('.product-info__price');

      if (this.productJson && this.selects.length > 0) {
        this.product = JSON.parse(this.productJson.textContent);
        this.init();
      }
    }

    init() {
      this.selects.forEach(select => {
        select.addEventListener('change', () => this.onVariantChange());
      });
    }

    onVariantChange() {
      const selectedOptions = [];
      this.selects.forEach(select => {
        selectedOptions.push(select.value);
      });

      const variant = this.product.variants.find(v => {
        return v.options.every((opt, index) => opt === selectedOptions[index]);
      });

      if (variant) {
        this.updateVariant(variant);
      }
    }

    updateVariant(variant) {
      // Update hidden variant ID
      if (this.variantIdInput) {
        this.variantIdInput.value = variant.id;
      }

      // Update price
      if (this.priceContainer) {
        this.updatePrice(variant);
      }

      // Update add to cart button
      if (variant.available) {
        this.addToCartButton.disabled = false;
        this.addToCartText.textContent = window.theme?.strings?.addToCart || 'In den Einkaufswagen';
      } else {
        this.addToCartButton.disabled = true;
        this.addToCartText.textContent = window.theme?.strings?.soldOut || 'Ausverkauft';
      }

      // Update URL
      const url = new URL(window.location);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url);
    }

    updatePrice(variant) {
      const formatMoney = (cents) => {
        return (cents / 100).toFixed(2).replace('.', ',') + ' €';
      };

      let priceHtml = '';

      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        priceHtml = `
          <span class="product-info__price-compare">${formatMoney(variant.compare_at_price)}</span>
          <span class="product-info__price-sale">${formatMoney(variant.price)}</span>
        `;
      } else {
        priceHtml = `<span class="product-info__price-regular">${formatMoney(variant.price)}</span>`;
      }

      priceHtml += '<span class="product-info__price-tax">inkl. MwSt.</span>';

      this.priceContainer.innerHTML = priceHtml;
    }
  }

  // ============================================================
  // Initialize on DOM Ready
  // ============================================================
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize Product Gallery
    const galleryContainer = document.querySelector('[data-product-gallery]');
    if (galleryContainer) {
      new ProductGallery(galleryContainer);
    }

    // Initialize Add to Cart
    const productForm = document.querySelector('[data-product-form]');
    if (productForm) {
      new AddToCart(productForm);
    }

    // Initialize Quantity Selectors
    const quantityContainers = document.querySelectorAll('.product-info__quantity');
    quantityContainers.forEach(container => {
      new QuantitySelector(container);
    });

    // Initialize Variant Selector
    const productSection = document.querySelector('[data-product-section]');
    if (productSection) {
      new VariantSelector(productSection);
    }
  });

})();
