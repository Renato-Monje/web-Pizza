// Variables globales para el carrito
let cart = {};
let cartCount = 0;

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Función de inicialización
function initializeApp() {
    setupEventListeners();
    updateCartDisplay();
}

// Configurar event listeners
function setupEventListeners() {
    // Formulario de contacto
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // Navegación suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Cerrar carrito al hacer clic fuera
    document.addEventListener('click', function(e) {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartToggle = document.querySelector('.cart-toggle');
        
        if (!cartSidebar.contains(e.target) && 
            !cartToggle.contains(e.target) && 
            !e.target.closest('.nav-menu')) {
            closeCart();
        }
    });
}

// Funciones del carrito
function addToCart(id, name, price) {
    if (cart[id]) {
        cart[id].quantity++;
    } else {
        cart[id] = {
            name: name,
            price: price,
            quantity: 1
        };
    }
    updateCartDisplay();
    showAddToCartAnimation();
}

function removeFromCart(id) {
    if (cart[id]) {
        cart[id].quantity--;
        if (cart[id].quantity <= 0) {
            delete cart[id];
        }
    }
    updateCartDisplay();
}

function updateQuantity(id, quantity) {
    if (cart[id]) {
        cart[id].quantity = quantity;
        if (cart[id].quantity <= 0) {
            delete cart[id];
        }
    }
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCountElement = document.getElementById('cartCount');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Calcular total de items y precio
    let totalItems = 0;
    let totalPrice = 0;
    
    Object.values(cart).forEach(item => {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;
    });
    
    // Actualizar contador en el botón flotante
    if (totalItems > 0) {
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = 'flex';
    } else {
        cartCountElement.style.display = 'none';
    }
    
    // Actualizar contenido del carrito
    if (totalItems === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Tu carrito está vacío</p>';
        cartTotal.style.display = 'none';
        checkoutBtn.style.display = 'none';
    } else {
        let cartHTML = '';
        Object.entries(cart).forEach(([id, item]) => {
            cartHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">S/ ${item.price.toFixed(2)} c/u</div>
                    </div>
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="removeFromCart(${id})">-</button>
                        <span style="margin: 0 0.5rem; font-weight: bold;">${item.quantity}</span>
                        <button class="qty-btn" onclick="addToCart(${id}, '${item.name}', ${item.price})">+</button>
                    </div>
                </div>
            `;
        });
        
        cartItems.innerHTML = cartHTML;
        cartTotal.textContent = `Total: S/ ${totalPrice.toFixed(2)}`;
        cartTotal.style.display = 'block';
        checkoutBtn.style.display = 'block';
    }
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.toggle('open');
}

function closeCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.remove('open');
}

function showAddToCartAnimation() {
    const cartToggle = document.querySelector('.cart-toggle');
    cartToggle.style.transform = 'scale(1.3)';
    cartToggle.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
    
    setTimeout(() => {
        cartToggle.style.transform = 'scale(1)';
        cartToggle.style.background = 'linear-gradient(45deg, #ffd700, #ffb347)';
    }, 300);
}

function proceedToCheckout() {
    const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let orderSummary = 'RESUMEN DE TU PEDIDO:\n\n';
    Object.values(cart).forEach(item => {
        orderSummary += `${item.name} x${item.quantity} - S/ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    orderSummary += `\nTOTAL: S/ ${totalPrice.toFixed(2)}`;
    orderSummary += '\n\n¡Gracias por tu pedido! Te contactaremos pronto para confirmar tu orden.';
    
    alert(orderSummary);
    
    // Opcional: enviar pedido por WhatsApp
    const whatsappNumber = '51987654321';
    const whatsappMessage = encodeURIComponent(orderSummary);
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
    
    if (confirm('¿Deseas enviar tu pedido por WhatsApp?')) {
        window.open(whatsappURL, '_blank');
    }
    
    // Limpiar carrito después del checkout
    cart = {};
    updateCartDisplay();
    closeCart();
}

// Manejo del formulario de contacto
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {};
    
    // Obtener todos los datos del formulario
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Validar campos requeridos
    if (!data.nombre || !data.telefono || !data.email || !data.mensaje) {
        alert('Por favor completa todos los campos obligatorios.');
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        alert('Por favor ingresa un email válido.');
        return;
    }
    
    // Validar teléfono (números y algunos caracteres especiales)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(data.telefono)) {
        alert('Por favor ingresa un teléfono válido.');
        return;
    }
    
    // Simular envío del formulario
    showSuccessMessage();
    
    // Opcional: enviar por WhatsApp
    const whatsappMessage = createWhatsAppMessage(data);
    const whatsappNumber = '51987654321';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    setTimeout(() => {
        if (confirm('¿Deseas enviar tu consulta también por WhatsApp?')) {
            window.open(whatsappURL, '_blank');
        }
    }, 2000);
    
    // Limpiar formulario
    e.target.reset();
}

function createWhatsAppMessage(data) {
    let message = 'NUEVA CONSULTA - INCA PIZZA\n\n';
    message += `Nombre: ${data.nombre}\n`;
    message += `Teléfono: ${data.telefono}\n`;
    message += `Email: ${data.email}\n`;
    
    if (data.distrito) {
        message += `Distrito: ${data.distrito}\n`;
    }
    
    if (data['tipo-consulta']) {
        message += `Tipo de consulta: ${data['tipo-consulta']}\n`;
    }
    
    message += `\nMensaje:\n${data.mensaje}`;
    
    return message;
}

function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);
    
    // Scroll al mensaje
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Función para mostrar/ocultar menú móvil (si decides implementarlo)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('mobile-open');
}

// Función para manejar el scroll y efectos
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    
    if (window.scrollY > 100) {
        header.style.background = 'linear-gradient(135deg, #c41e3a 0%, #ffffff 30%, #c41e3a 100%)';
        header.style.boxShadow = '0 4px 30px rgba(0,0,0,0.2)';
    } else {
        header.style.background = 'linear-gradient(135deg, #c41e3a 0%, #ffffff 50%, #c41e3a 100%)';
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    }
});

// Funciones de utilidad
function formatCurrency(amount) {
    return `S/ ${amount.toFixed(2)}`;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 9;
}

// Funciones para animaciones adicionales
function animateOnScroll() {
    const elements = document.querySelectorAll('.pizza-card, .contact-item');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate-in');
        }
    });
}

// Ejecutar animación al hacer scroll
window.addEventListener('scroll', animateOnScroll);

// Función para abrir mapa en aplicación externa
function openMap() {
    const latitude = -12.2120;
    const longitude = -76.9419;
    const address = "Av. Juan Velasco Alvarado 1234, Villa El Salvador, Lima";
    
    // Para móviles - intentar abrir en app de mapas
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        window.open(googleMapsUrl, '_blank');
    } else {
        // Para desktop - abrir en nueva pestaña
        const googleMapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        window.open(googleMapsUrl, '_blank');
    }
}

// Función para compartir en redes sociales
function shareOnSocial(platform) {
    const url = window.location.href;
    const text = "¡Descubre las mejores pizzas peruanas en Inca Pizza - Villa El Salvador!";
    
    let shareUrl;
    
    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
            break;
        default:
            return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

// Guardar carrito en localStorage (opcional - para persistencia)
function saveCartToStorage() {
    try {
        localStorage.setItem('incaPizzaCart', JSON.stringify(cart));
    } catch (error) {
        console.warn('No se pudo guardar el carrito:', error);
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('incaPizzaCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartDisplay();
        }
    } catch (error) {
        console.warn('No se pudo cargar el carrito:', error);
        cart = {};
    }
}

// Función para limpiar el carrito
function clearCart() {
    if (confirm('¿Estás seguro de que deseas vaciar tu carrito?')) {
        cart = {};
        updateCartDisplay();
        saveCartToStorage();
    }
}

// Cargar carrito guardado al iniciar (si decides usar localStorage)
// loadCartFromStorage();

// Exportar funciones principales para uso global
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.proceedToCheckout = proceedToCheckout;
window.openMap = openMap;
window.shareOnSocial = shareOnSocial;
window.clearCart = clearCart;